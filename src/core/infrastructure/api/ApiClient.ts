/**
 * API Client - Infrastructure Layer
 * Centralized HTTP client for all API communications
 * Handles authentication, retries, rate limiting, and error handling
 */

import { CORE_CONSTANTS } from '../../constants';
import { CoreError } from '../../errors';

// Request and Response Interfaces
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  requiresAuth?: boolean;
  cache?: RequestCache;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  retryCondition?: (error: ApiError) => boolean;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
  keyGenerator?: (request: Request) => string;
}

/**
 * API Client Class
 * Main HTTP client for all API communications
 */
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private retryConfig: RetryConfig;
  private rateLimitConfig: RateLimitConfig;
  private requestQueue: Map<string, Promise<ApiResponse<unknown>>>;
  private tokenProvider?: () => Promise<string | null>;
  private onError?: (error: ApiError) => void;
  private onUnauthorized?: () => void;

  constructor(config: {
    baseURL: string;
    defaultHeaders?: Record<string, string>;
    retryConfig?: RetryConfig;
    rateLimitConfig?: RateLimitConfig;
    tokenProvider?: () => Promise<string | null>;
    onError?: (error: ApiError) => void;
    onUnauthorized?: () => void;
  }) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'X-API-Version': CORE_CONSTANTS.API_VERSION,
      ...config.defaultHeaders
    };

    this.retryConfig = {
      maxRetries: CORE_CONSTANTS.MAX_RETRIES,
      retryDelay: 1000,
      retryCondition: this.defaultRetryCondition,
      ...config.retryConfig
    };

    this.rateLimitConfig = {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
      keyGenerator: this.defaultKeyGenerator,
      ...config.rateLimitConfig
    };

    this.requestQueue = new Map();
    this.tokenProvider = config.tokenProvider;
    this.onError = config.onError;
    this.onUnauthorized = config.onUnauthorized;
  }

  /**
   * HTTP Methods
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Main request method
   */
  private async request<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>> {
    const requestKey = this.generateRequestKey(endpoint, options);

    // Check if identical request is already in progress
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)! as Promise<ApiResponse<T>>;
    }

    // Create new request promise
    const requestPromise = this.executeRequest<T>(endpoint, options)
      .finally(() => {
        // Remove from queue when complete
        this.requestQueue.delete(requestKey);
      });

    // Add to queue
    this.requestQueue.set(requestKey, requestPromise);

    return requestPromise;
  }

  /**
   * Execute the actual HTTP request with retry logic
   */
  private async executeRequest<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>> {
    let lastError: ApiError | null = null;
    const maxRetries = options.retries ?? this.retryConfig.maxRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Build request
        const url = this.buildURL(endpoint);
        const headers = await this.buildHeaders(options);
        const body = this.buildBody(options.body);
        const timeout = options.timeout ?? CORE_CONSTANTS.API_TIMEOUT;

        // Create request with timeout
        const response = await this.fetchWithTimeout(url, {
          method: options.method || 'GET',
          headers,
          body,
          cache: options.cache || 'default'
        }, timeout);

        // Parse response
        const apiResponse = await this.parseResponse<T>(response);

        // Handle success
        if (apiResponse.success) {
          return apiResponse;
        }

        // Handle error
        lastError = apiResponse.error || null;

        // Check if should retry
        if (attempt < maxRetries && lastError && this.shouldRetry(lastError)) {
          await this.delay(this.retryConfig.retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }

        return apiResponse;

      } catch (error) {
        lastError = this.createApiError(error);

        // Check if should retry on exception
        if (attempt < maxRetries && this.shouldRetry(lastError)) {
          await this.delay(this.retryConfig.retryDelay * Math.pow(2, attempt));
          continue;
        }

        // Log error
        console.error(`API request failed (attempt ${attempt + 1}):`, error);

        // Call error handler
        if (this.onError) {
          this.onError(lastError);
        }

        return {
          success: false,
          error: lastError,
          statusCode: 0
        };
      }
    }

    return {
      success: false,
      error: lastError || { code: 'MAX_RETRIES_EXCEEDED', message: 'Maximum retry attempts exceeded' },
      statusCode: 0
    };
  }

  /**
   * Build complete URL
   */
  private buildURL(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // Remove trailing slash from baseURL if present
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;

    return `${cleanBaseURL}/${cleanEndpoint}`;
  }

  /**
   * Build request headers
   */
  private async buildHeaders(options: RequestOptions): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Remove headers with undefined values (e.g. Content-Type for FormData)
    Object.keys(headers).forEach(key => {
      if (headers[key] === undefined) {
        delete headers[key];
      }
    });

    // Add authentication token if required
    // Add Authorization header if token provider is set
    if (options.requiresAuth !== false && this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[ApiClient] Added Authorization header:', `Bearer ${token.substring(0, 10)}...`);
      } else {
        console.warn('[ApiClient] No token provided by tokenProvider');
      }
    }

    return headers;
  }

  /**
   * Build request body
   */
  private buildBody(body: unknown): string | FormData | undefined {
    if (!body) return undefined;

    // Handle FormData
    if (body instanceof FormData) {
      return body;
    }

    // Handle JSON
    if (typeof body === 'object') {
      return JSON.stringify(body as Record<string, unknown>);
    }

    return body as string;
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parse response
   */
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const statusCode = response.status;
    const headers = this.parseHeaders(response.headers);

    // Handle empty responses
    if (response.status === 204) {
      return {
        success: true,
        data: undefined as unknown as T,
        statusCode,
        headers
      };
    }

    // Clone the response so we can try text() if json() fails
    const clonedResponse = response.clone();

    // Parse JSON response
    try {
      const data = await response.json();

      // Handle success responses
      if (response.ok) {
        return {
          success: true,
          data,
          statusCode,
          headers
        };
      }

      // Handle error responses
      const error: ApiError = {
        code: data.code || `HTTP_${statusCode}`,
        message: data.message || response.statusText,
        details: data.details,
        validationErrors: data.validationErrors
      };

      // Handle specific error cases
      if (statusCode === 401) {
        this.handleUnauthorized(error);
      }

      return {
        success: false,
        error,
        statusCode,
        headers
      };

    } catch (parseError) {
      // Handle non-JSON responses using the cloned response
      let text = '';
      try {
        text = await clonedResponse.text();
      } catch {
        text = 'Unable to read response body';
      }

      return {
        success: false,
        error: {
          code: response.ok ? 'PARSE_ERROR' : `HTTP_${statusCode}`,
          message: response.ok ? 'Failed to parse response' : (text || response.statusText),
          details: { parseError, responseText: text }
        },
        statusCode,
        headers
      };
    }
  }

  /**
   * Parse response headers
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const parsed: Record<string, string> = {};
    headers.forEach((value, key) => {
      parsed[key] = value;
    });
    return parsed;
  }

  /**
   * Create API error from exception
   */
  private createApiError(error: unknown): ApiError {
    if (error instanceof CoreError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details
      };
    }

    if (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'AbortError') {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout',
        details: error
      };
    }

    if (typeof error === 'object' && error !== null) {
      const e = error as { name?: string; message?: string };
      if (e.name === 'TypeError' && (e.message || '').includes('fetch')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network error',
          details: error
        };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: (error as { message?: string }).message || 'Unknown error occurred',
      details: error
    };
  }

  /**
   * Handle unauthorized responses
   */
  private handleUnauthorized(error: ApiError): void {
    if (this.onUnauthorized) {
      this.onUnauthorized();
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: ApiError): boolean {
    if (this.retryConfig.retryCondition) {
      return this.retryConfig.retryCondition(error);
    }
    return this.defaultRetryCondition(error);
  }

  /**
   * Default retry condition
   */
  private defaultRetryCondition(error: ApiError): boolean {
    // Retry on network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      return true;
    }

    // Retry on 5xx server errors
    if (error.code.startsWith('HTTP_5')) {
      return true;
    }

    // Retry on 429 (Too Many Requests)
    if (error.code === 'HTTP_429') {
      return true;
    }

    return false;
  }

  /**
   * Generate request key for deduplication
   */
  private generateRequestKey(endpoint: string, options: RequestOptions): string {
    const key = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body)}`;
    return this.hashString(key);
  }

  /**
   * Default key generator for rate limiting
   */
  private defaultKeyGenerator(request: Request): string {
    // Use IP address or user ID if available
    return 'default';
  }

  /**
   * Simple hash function for string keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Upload file utility
   */
  async uploadFile(endpoint: string, file: File, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post(endpoint, formData, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': undefined // Let browser set content type for FormData
      }
    });
  }

  /**
   * Download file utility
   */
  async downloadFile(endpoint: string, options?: RequestOptions): Promise<Blob> {
    const url = this.buildURL(endpoint);
    const headers = await this.buildHeaders(options || {});

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: options?.timeout ? this.createAbortSignal(options.timeout) : undefined
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Create abort signal for timeout
   */
  private createAbortSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  /**
   * Batch request utility
   */
  async batch<T>(requests: Array<{
    endpoint: string;
    options?: RequestOptions;
  }>): Promise<ApiResponse<T>[]> {
    const promises = requests.map(({ endpoint, options }) =>
      this.request<T>(endpoint, options || {})
    );

    return Promise.all(promises);
  }

  /**
   * Set token provider
   */
  setTokenProvider(provider: () => Promise<string | null>): void {
    this.tokenProvider = provider;
  }

  /**
   * Set error handler
   */
  setErrorHandler(handler: (error: ApiError) => void): void {
    this.onError = handler;
  }

  /**
   * Set unauthorized handler
   */
  setUnauthorizedHandler(handler: () => void): void {
    this.onUnauthorized = handler;
  }

  /**
   * Update default headers
   */
  updateDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Get request queue size
   */
  getQueueSize(): number {
    return this.requestQueue.size;
  }

  /**
   * Clear request queue
   */
  clearQueue(): void {
    this.requestQueue.clear();
  }
}

/**
 * API Client Factory
 * Factory for creating pre-configured API clients
 */
export class ApiClientFactory {
  static createClient(config: {
    environment: 'development' | 'staging' | 'production';
    tokenProvider?: () => Promise<string | null>;
    onError?: (error: ApiError) => void;
    onUnauthorized?: () => void;
  }): ApiClient {
    const baseURLs = {
      development: import.meta.env.VITE_API_URL || '/api/v1',
      staging: import.meta.env.VITE_API_URL || '/api/v1',
      production: import.meta.env.VITE_API_URL || '/api/v1'
    };

    return new ApiClient({
      baseURL: baseURLs[config.environment],
      tokenProvider: config.tokenProvider,
      onError: config.onError,
      onUnauthorized: config.onUnauthorized,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000
      },
      rateLimitConfig: {
        maxRequests: 100,
        windowMs: 60000
      }
    });
  }
}

/**
 * Global API Client Instance
 * Singleton instance for the main API client
 */
let globalApiClient: ApiClient | null = null;

export const setGlobalApiClient = (client: ApiClient): void => {
  globalApiClient = client;
};

export const getGlobalApiClient = (): ApiClient => {
  if (!globalApiClient) {
    throw new Error('Global API client not initialized');
  }
  return globalApiClient;
};
