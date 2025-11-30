const API_URL = '/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const api = {
    get: async <T = unknown>(url: string): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    },
    post: async <T = unknown>(url: string, body: unknown): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    },
    put: async <T = unknown>(url: string, body: unknown): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    },
    patch: async <T = unknown>(url: string, body: unknown): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    },
    delete: async <T = unknown>(url: string): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        return data as T;
    }
};
