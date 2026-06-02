import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://test-intuity.waterbill.com/';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Attach the auth token to every request automatically.
// Individual calls can still override the header (e.g. getUserDetailsByToken).
api.interceptors.request.use((config) => {
  const token = secureLocalStorage.getItem('custom-auth-token') as string | null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== 'users/login') {
      secureLocalStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
