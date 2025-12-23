import axios from 'axios';
import { handleAPIError } from '../utils/errorHandler';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = BACKEND_URL;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // refresh: /api/auth/jwt/refresh/
        const res = await axios.post(`${API_BASE_URL}/api/auth/jwt/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = res.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(handleAPIError(error));
  }
);

export default api;