import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { navigateTo } from '@/utils/navigation';

export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://test-intuity.waterbill.com/';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
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
      import('@/state/store').then(({ store }) => {
        import('@/state/features/accountSlice').then(({ resetAccountStore }) => store.dispatch(resetAccountStore()));
        import('@/state/features/dashBoardSlice').then(({ resetDashboardStore }) => store.dispatch(resetDashboardStore()));
        import('@/state/features/paymentSlice').then(({ resetPaymentStore }) => store.dispatch(resetPaymentStore()));
      }).catch(() => {});
      toast.info('Your session has expired. Please log in again.');
      navigateTo('/login', { replace: true });
    }
    return Promise.reject(error);
  }
);

export default api;
