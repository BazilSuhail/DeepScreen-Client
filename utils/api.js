const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    get: async (endpoint, options = {}) => {
        let url = `${BASE_URL}${endpoint}`;
        
        // Add query parameters if provided
        if (options.params) {
            const queryString = new URLSearchParams(options.params).toString();
            url = `${url}?${queryString}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    post: async (endpoint, data) => {
        const isFormData = data instanceof FormData;
        const headers = getHeaders();
        if (isFormData) {
            delete headers['Content-Type'];
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    put: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    patch: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

export const chatApi = {
    get: async (endpoint) => {
        const url = `${BASE_URL.replace('/api', '')}/chat${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    post: async (endpoint, data) => {
        const url = `${BASE_URL.replace('/api', '')}/chat${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }
};

const handleResponse = async (response) => {
    let data = {};
    try {
        data = await response.json();
    } catch (e) {
        data = { error: 'Failed to parse response' };
    }

    if (!response.ok) {
        let errorMessage = data.message || data.error || data.detail;
        
        if (!errorMessage && typeof data === 'object') {
            // DRF Validation errors usually look like { field: ["error"] }
            const firstKey = Object.keys(data)[0];
            if (firstKey) {
                const firstVal = data[firstKey];
                errorMessage = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
            }
        }

        throw { 
            status: response.status, 
            message: errorMessage || 'Something went wrong',
            errors: data
        };
    }
    return data;
};

export default api;
