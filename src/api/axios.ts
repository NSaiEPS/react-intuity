import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';
import { toast } from '@/lib/custom-toast';
import { navigateTo } from '@/utils/navigation';
import { clearLocalStorage, getLocalStorage, setLocalStorage } from '@/utils/auth';

export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://test-intuity.waterbill.com/';
// export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://junctional-eugena-squirrellike.ngrok-free.dev/';


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
  let token = secureLocalStorage.getItem('custom-auth-token') as string | null;
  if (!token) {
    const rawUser = secureLocalStorage.getItem('intuity-user') as any;
    token = rawUser?.body?.token || rawUser?.token || null;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isHandling401 = false;

export const handleUnauthorizedSession = () => {
  if (isHandling401) return;
  isHandling401 = true;

  // Preserve alias details if they exist so user returns to company login page
  const aliasDetails = getLocalStorage('alias-details') as { alias?: string } | null;
  const companyAlias = aliasDetails?.alias ?? '';

  // Clear authentication/session data
  clearLocalStorage();

  // Restore alias details for company-specific login
  if (aliasDetails) {
    setLocalStorage('alias-details', aliasDetails);
  }

  // Reset Redux stores
  import('@/state/store').then(({ store }) => {
    import('@/state/features/accountSlice').then(({ resetAccountStore }) => store.dispatch(resetAccountStore()));
    import('@/state/features/dashBoardSlice').then(({ resetDashboardStore }) => store.dispatch(resetDashboardStore()));
    import('@/state/features/paymentSlice').then(({ resetPaymentStore }) => store.dispatch(resetPaymentStore()));
  }).catch(() => { });

  toast.info('Your session has expired. Please log in again.');

  const loginPath = companyAlias ? `/login-${companyAlias}` : '/login';
  navigateTo(loginPath, { replace: true });

  setTimeout(() => {
    isHandling401 = false;
  }, 2000);
};

api.interceptors.response.use(
  (response) => {
    const data = response?.data;
    if (
      data &&
      data.status === false &&
      (data.message === 'You are not authorized.' ||
        data.message === 'You are not authorized' ||
        data.message === 'You are not authorised to use this api' ||
        data.message === 'You are not authorized to use this api')
    ) {
      handleUnauthorizedSession();
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url !== 'users/login' && url !== 'login') {
        handleUnauthorizedSession();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
