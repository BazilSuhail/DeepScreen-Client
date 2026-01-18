
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Add token from localStorage
 */
apiClient.interceptors.request.use((config) => {
  try {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to header:', token.slice(0, 20) + '...');
      } else {
        console.warn('⚠️ No token in localStorage');
      }
    }
  } catch (e) {
    console.error('Error reading token:', e);
  }
  return config;
});

/**
 * Response Interceptor: Error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Request failed',
      status: error.response?.status,
      data: error.response?.data
    };
    console.error('❌ API Error:', customError);
    return Promise.reject(customError);
  }
);

export const api = async (url, method = 'GET', data = null) => {
  try {
    const response = await apiClient({ url, method, data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

api.get = (url) => api(url, 'GET');
api.post = (url, data) => api(url, 'POST', data);
api.put = (url, data) => api(url, 'PUT', data);
api.delete = (url) => api(url, 'DELETE');

export default api;
// import axios from 'axios';

// /**
//  * Get a cookie value by name
//  */
// export const getCookie = (name) => {
//   if (typeof document === 'undefined') return null;
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(';').shift();
//   return null;
// };

// /**
//  * Axios instance with default configuration
//  */
// const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
//   withCredentials: true,
//   timeout: 10000, // 10s — prevents requests hanging forever
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// /**
//  * Request Interceptor: Automatically add CSRF token to headers
//  */
// apiClient.interceptors.request.use(
//   (config) => {
//     const csrfToken = getCookie('csrf_token');
//     const methodsWithCsrf = ['post', 'put', 'delete', 'patch'];
//     if (csrfToken && methodsWithCsrf.includes(config.method.toLowerCase())) {
//       config.headers['X-CSRF-Token'] = csrfToken;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /**
//  * Response Interceptor: Uniform error handling
//  */
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const customError = {
//       ...error,
//       message: error.response?.data?.error ||
//         error.response?.data?.message ||
//         (error.response?.data ? JSON.stringify(error.response.data) : null) ||
//         error.message ||
//         'An unexpected error occurred',
//       status: error.response?.status,
//       data: error.response?.data
//     };
//     return Promise.reject(customError);
//   }
// );

// /**
//  * Super simple API wrapper
//  */
// export const api = async (url, method = 'GET', data = null) => {
//   try {
//     const response = await apiClient({
//       url,
//       method,
//       data,
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// // Shorthands
// api.get = (url) => api(url, 'GET');
// api.post = (url, data) => api(url, 'POST', data);
// api.put = (url, data) => api(url, 'PUT', data);
// api.delete = (url) => api(url, 'DELETE');

// export default 
// api;
