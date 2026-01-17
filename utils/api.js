import apiClient from '@/lib/api';

/**
 * Super simple API wrapper
 * @param {string} url - Endpoint (e.g., '/auth/login/')
 * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {object} data - Body for POST/PUT
 * @returns {Promise}
 */
export const api = async (url, method = 'GET', data = null) => {
  try {
    const response = await apiClient({
      url,
      method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Shorthands
api.get = (url) => api(url, 'GET');
api.post = (url, data) => api(url, 'POST', data);
api.put = (url, data) => api(url, 'PUT', data);
api.delete = (url) => api(url, 'DELETE');
