import axios from 'axios';
import { sanitizeData } from '../utils/sanitize';
import { redirectToLogin } from '../utils/auth';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8085';

const api = axios.create({
  baseURL: `${GATEWAY}/api/profesor`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
    if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = sanitizeData(config.data);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
