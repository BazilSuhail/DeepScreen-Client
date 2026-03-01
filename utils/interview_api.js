const RTC_BASE_URL = process.env.NEXT_PUBLIC_RTC_API_URL || 'http://localhost:8000/rtc';

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
        console.log(`[RTC API] Requesting token from: ${RTC_BASE_URL}/join/${secureToken}/`);
        
        const response = await fetch(`${RTC_BASE_URL}/join/${secureToken}/`, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        console.log(`[RTC API] Response status: ${response.status}`);
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            console.log('[RTC API] Received LiveKit token successfully');
            console.log(`[RTC API] Room ID: ${data.room_id}`);
            console.log(`[RTC API] Role: ${data.role}`);
            if (data.serverUrl) {
                console.log(`[RTC API] LiveKit Server: ${data.serverUrl}`);
            }
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
