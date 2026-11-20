import axios from 'axios';
import { toast } from '@/lib/custom-toast';
import { navigateTo } from '@/utils/navigation';
import { clearLocalStorage, getLocalStorage, setLocalStorage } from '@/utils/auth';
import { getCsrfToken, setCsrfToken, clearCsrfToken, fetchCsrfToken } from '@/lib/auth/csrf';
import { BASE_URL } from './axios-base';

export { BASE_URL } from './axios-base';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  const url = config.url || '';

  // Only state-changing methods require CSRF token: POST, PUT, PATCH, DELETE
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');

  // Skip CSRF token for login and csrf-token endpoints
  const isExcluded =
    url.includes('csrf-token') ||
    url === 'login' ||
    url === 'users/login' ||
    url.endsWith('/login');

  if (isStateChanging && !isExcluded) {
    let token = getCsrfToken();
    if (!token) {
      token = await fetchCsrfToken();
    }
    if (token && config.headers) {
      if (typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('X-CSRF-Token', token);
      } else {
        (config.headers as any)['X-CSRF-Token'] = token;
      }
    }
  }

  return config;
});

let isHandling401 = false;

export const handleUnauthorizedSession = (reason?: string) => {
  if (isHandling401) return;
  isHandling401 = true;

  // Clear CSRF token
  clearCsrfToken();

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

  if (reason === 'expired') {
    toast.info('Your session has expired, please sign in again.');
  } else if (reason === 'revoked') {
    toast.info('You have been signed out.');
  } else if (reason === 'missing' || reason === 'invalid') {
    // Normal login page — no session expired toast
  } else {
    toast.info('Your session has expired. Please log in again.');
  }

  const loginPath = companyAlias ? `/login-${companyAlias}` : '/login';
  navigateTo(loginPath, { replace: true });

  setTimeout(() => {
    isHandling401 = false;
  }, 2000);
};

api.interceptors.response.use(
  (response) => {
    // Update CSRF token whenever a successful response contains body.csrf_token or csrf_token
    const data = response?.data;
    const newCsrf = data?.body?.csrf_token || data?.csrf_token;
    if (newCsrf) {
      setCsrfToken(newCsrf);
    }

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
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const errorData = error.response?.data;
    const errorMessage =
      typeof errorData?.message === 'string'
        ? errorData.message
        : typeof errorData?.error === 'string'
          ? errorData.error
          : '';

    // Handle HTTP 403 Invalid CSRF token: fetch fresh token and retry exactly once
    // Strictly matches the documented backend contract: message "Invalid CSRF token." or reason "invalid_csrf"
    const normalizedMessage = errorMessage.trim().toLowerCase();
    const isInvalidCsrfResponse =
      normalizedMessage === 'invalid csrf token.' ||
      normalizedMessage === 'invalid csrf token' ||
      errorData?.reason === 'invalid_csrf' ||
      errorData?.reason === 'csrf';

    const isCsrfError = status === 403 && isInvalidCsrfResponse;

    if (isCsrfError && error.config && !error.config._retry) {
      error.config._retry = true;
      try {
        const freshToken = await fetchCsrfToken();
        if (freshToken && error.config.headers) {
          if (typeof (error.config.headers as any).set === 'function') {
            (error.config.headers as any).set('X-CSRF-Token', freshToken);
          } else {
            (error.config.headers as any)['X-CSRF-Token'] = freshToken;
          }
          return api(error.config);
        }
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    // Handle other HTTP 403 errors (insufficient permissions, wrong role, resource belongs to another user)
    // Display not-authorized message; do NOT log out
    if (status === 403 && !isCsrfError) {
      const msg = errorMessage || 'You are not authorized to perform this action.';
      toast.error(msg);
      return Promise.reject(error);
    }

    // Handle HTTP 401
    if (status === 401) {
      if (
        url !== 'users/login' &&
        url !== 'login' &&
        !url.endsWith('/login') &&
        url !== 'me' &&
        url !== '/me' &&
        !url.endsWith('/me')
      ) {
        const reason = errorData?.reason || errorData?.body?.reason;
        handleUnauthorizedSession(reason);
      }
    }

    // HTTP 503 / 500 / Network Error: Do not log out.

    return Promise.reject(error);
  }
);

export default api;
