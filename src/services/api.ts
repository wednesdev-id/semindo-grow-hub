const API_URL = '/api/v1';

const getHeaders = () => {
    const token = sessionStorage.getItem('auth_token'); // Fixed: use sessionStorage
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const api = {
    get: async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options?.headers
            }
        });
        
        if (!res.ok) {
            try {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || res.statusText);
            } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                    // Re-throw if it's the error we just created
                    throw e;
                }
                throw new Error(res.statusText || `Request failed with status ${res.status}`);
            }
        }
        
        return await res.json() as T;
    },
    post: async <T = unknown>(url: string, body: unknown, options?: RequestInit): Promise<T> => {
        const headers: any = { ...getHeaders(), ...options?.headers };

        // If body is FormData, let browser set Content-Type (remove it from headers)
        if (body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            ...options,
            headers,
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
        
        if (!res.ok) {
            try {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || res.statusText);
            } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                    throw e;
                }
                throw new Error(res.statusText || `Request failed with status ${res.status}`);
            }
        }

        return await res.json() as T;
    },
    put: async <T = unknown>(url: string, body: unknown, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            body: JSON.stringify(body)
        });
        
        if (!res.ok) {
            try {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || res.statusText);
            } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                    throw e;
                }
                throw new Error(res.statusText || `Request failed with status ${res.status}`);
            }
        }

        return await res.json() as T;
    },
    patch: async <T = unknown>(url: string, body: unknown, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PATCH',
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            body: JSON.stringify(body)
        });
        
        if (!res.ok) {
            try {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || res.statusText);
            } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                    throw e;
                }
                throw new Error(res.statusText || `Request failed with status ${res.status}`);
            }
        }

        return await res.json() as T;
    },
    delete: async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            ...options,
            headers: { ...getHeaders(), ...options?.headers }
        });
        
        if (!res.ok) {
            try {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || res.statusText);
            } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                    throw e;
                }
                throw new Error(res.statusText || `Request failed with status ${res.status}`);
            }
        }

        return await res.json() as T;
    }
};
