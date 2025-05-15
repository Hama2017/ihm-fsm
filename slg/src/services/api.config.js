import axios from 'axios';
import authService from '@/services/authService';
import router from '@/router';
import { useAuthStore } from '@/stores/AuthStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true
});

apiClient.interceptors.request.use(
  config => {
    config.headers['X-API-KEY'] = 'sk_master_admin'; 
    return config;
  },
  error => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const noNeedToRefresh = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

function processQueue(error, token = null) {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !noNeedToRefresh.some(path => originalRequest.url.includes(path)) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      isRefreshing = true;

      try {
        await authService.refreshToken();
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        try {
          const authStore = useAuthStore();
          authStore.user = null;
        } catch (e) {
          console.warn('authStore inaccessible, ignore.');
        }

        router.push({ name: 'login' });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
