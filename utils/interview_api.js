import { RTC_API_URL } from './config.js';

const RTC_BASE_URL = RTC_API_URL;

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
    // Get the LiveKit token from Django backend (rtc app)
    getJoinToken: async (secureToken) => {
        
        const response = await fetch(`${RTC_BASE_URL}/join/${secureToken}/`, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        
        // Error responses (e.g. 502 from a proxy) may not be JSON
        let data = {};
        try {
            data = await response.json();
        } catch {
            data = {};
        }
        
        
        return handleResponse(response, data);
    }
};


const handleResponse = async (response, data) => {
    if (!response.ok) {
        throw { 
            status: response.status, 
            message: data.message || data.error || 'RTC Service Error',
            errors: data
        };
    }
    return data;
};
