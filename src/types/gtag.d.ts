// Type definitions for Google Analytics gtag

// Type untuk gtag event parameters
interface GtagEvent {
  event_category: string;
  event_label?: string;
  value?: number;
  send_to?: string;
  page_path?: string;
  page_title?: string;
  page_location?: string;
}

// Type untuk gtag function
interface GtagFunction {
  (command: 'event', action: string, parameters?: GtagEvent): void;
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'js', date: Date): void;
  (command: string, ...args: unknown[]): void;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagFunction;
  }
}

export {};