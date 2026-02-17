const RTC_BASE_URL = process.env.NEXT_PUBLIC_RTC_API_URL || 'http://localhost:8080/api/rtc';

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

export const rtcApi = {
    // Get the LiveKit token from the Go microservice
    getJoinToken: async (secureToken) => {
        const response = await fetch(`${RTC_BASE_URL}/join/${secureToken}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // Health check for the Go service
    checkHealth: async () => {
        const response = await fetch(`http://localhost:8080/health`, {
            method: 'GET',
        });
        return response.text();
    }
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw { 
            status: response.status, 
            message: data.message || data.error || 'RTC Service Error',
            errors: data
        };
    }
    return data;
};
