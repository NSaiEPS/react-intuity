import axios from 'axios';
import { BASE_URL } from '@/api/axios-base';

let inMemoryCsrfToken: string | null = null;
let fetchCsrfPromise: Promise<string | null> | null = null;

const CSRF_STORAGE_KEY = 'intuity_csrf_token';

/**
 * Get the current CSRF token from memory or sessionStorage fallback.
 */
export const getCsrfToken = (): string | null => {
  if (inMemoryCsrfToken) {
    return inMemoryCsrfToken;
  }
  try {
    const sessionToken = sessionStorage.getItem(CSRF_STORAGE_KEY);
    if (sessionToken) {
      inMemoryCsrfToken = sessionToken;
      return sessionToken;
    }
  } catch {
    // Ignore sessionStorage errors
  }
  return null;
};

/**
 * Store the latest CSRF token in memory and sessionStorage.
 */
export const setCsrfToken = (token: string | null): void => {
  inMemoryCsrfToken = token;
  try {
    if (token) {
      sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(CSRF_STORAGE_KEY);
    }
  } catch {
    // Ignore sessionStorage errors
  }
};

/**
 * Clear the CSRF token on logout or session expiration.
 */
export const clearCsrfToken = (): void => {
  inMemoryCsrfToken = null;
  try {
    sessionStorage.removeItem(CSRF_STORAGE_KEY);
  } catch {
    // Ignore sessionStorage errors
  }
};

/**
 * Fetch a fresh CSRF token from GET /csrf-token with credentials.
 * Deduplicates concurrent requests using a shared promise.
 */
export const fetchCsrfToken = async (): Promise<string | null> => {
  if (fetchCsrfPromise) {
    return fetchCsrfPromise;
  }

  fetchCsrfPromise = (async () => {
    try {
      const response = await axios.get(`${BASE_URL}csrf-token`, {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
        },
      });

      const token =
        response.data?.csrf_token ||
        response.data?.body?.csrf_token ||
        response.data?.data?.csrf_token ||
        (response.headers?.['x-csrf-token'] as string) ||
        null;

      if (token) {
        setCsrfToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    } finally {
      fetchCsrfPromise = null;
    }
  })();

  return fetchCsrfPromise;
};

