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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || res.statusText);
        return data as T;
    },
    put: async <T = unknown>(url: string, body: unknown, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    },
    patch: async <T = unknown>(url: string, body: unknown, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PATCH',
            ...options,
            headers: { ...getHeaders(), ...options?.headers },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    },
    delete: async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            ...options,
            headers: { ...getHeaders(), ...options?.headers }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    }
};
