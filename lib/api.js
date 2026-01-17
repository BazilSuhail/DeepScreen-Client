import axios from 'axios';

/**
 * Get a cookie value by name
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

/**
 * Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/accounts',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Automatically add CSRF token to headers
 */
apiClient.interceptors.request.use(
  (config) => {
    // Only add CSRF token for state-changing methods
    const csrfToken = getCookie('csrf_token');
    const methodsWithCsrf = ['post', 'put', 'delete', 'patch'];
    
    if (csrfToken && methodsWithCsrf.includes(config.method.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Uniform error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract meaningful error message
    const customError = {
      ...error,
      message: error.response?.data?.error || 
               error.response?.data?.message || 
               (error.response?.data ? JSON.stringify(error.response.data) : null) ||
               error.message || 
               'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data
    };
    
    return Promise.reject(customError);
  }
);

export default apiClient;
