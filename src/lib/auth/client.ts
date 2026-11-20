import { BASE_URL, api } from "@/api/axios";
import { navigateTo } from "@/utils/navigation";
import secureLocalStorage from "react-secure-storage";
import { toast } from "@/lib/custom-toast";
import { setCsrfToken, clearCsrfToken } from "@/lib/auth/csrf";

import type { User } from "@/types/user";
import { clearLocalStorage, getLocalStorage, setLocalStorage } from "../../utils/auth";

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: "google" | "discord";
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
  company_alias?: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UserAuthDetails {
  authenticated?: boolean;
  method?: string;
  issued_at?: string;
  expires_at?: string;
  expires_in?: number;
  two_fa_required?: boolean;
  two_fa_completed?: boolean;
  must_complete_two_fa?: boolean;
  must_confirm_information?: boolean;
  [key: string]: unknown;
}

export interface GetUserResult {
  data?: any | null;
  auth?: UserAuthDetails | null;
  error?: string | null;
  reason?: string | null;
  isServiceUnavailable?: boolean;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: "Social authentication not implemented" };
  }

  async signInWithPassword(
    params: SignInWithPasswordParams,
    successCallBack?: (data: any) => void
  ): Promise<{ error?: string }> {
    const { email, password, company_alias } = params;
    const formData = new FormData();

    formData.append("email", email);
    formData.append("password", password);
    if (company_alias && typeof company_alias === "string" && company_alias.trim() !== "") {
      formData.append("company_alias", company_alias.trim());
    }

    try {
      const res = await fetch(`${BASE_URL}login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        credentials: "include",
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      // Check for failure cases:
      // 1. HTTP error (!res.ok)
      // 2. Explicit status: false
      // 3. Explicit body status: error
      // 4. Missing/null body
      // 5. Non-empty errors array or string
      const hasErrors =
        (Array.isArray(data?.body?.errors) && data.body.errors.length > 0) ||
        (typeof data?.body?.errors === "string" && data.body.errors.trim() !== "");

      const isFailed =
        !res.ok ||
        data?.status === false ||
        data?.body?.status === "error" ||
        !data?.body ||
        hasErrors;

      if (isFailed) {
        const errorMsg =
          (typeof data?.message === "string" && data.message.trim() !== "" ? data.message : null) ||
          (Array.isArray(data?.message) && data.message.length > 0 ? data.message[0] : null) ||
          (typeof data?.body?.errors === "string" ? data.body.errors : null) ||
          (Array.isArray(data?.body?.errors) && data.body.errors.length > 0 ? data.body.errors[0] : null) ||
          (typeof data?.error === "string" ? data.error : null) ||
          (!res.ok ? "Login failed. Please try again." : "Login failed");

        return { error: errorMsg };
      }

      // Store CSRF token returned in login response body
      if (data?.body?.csrf_token) {
        setCsrfToken(data.body.csrf_token);
      }

      data.body.email = email;
      secureLocalStorage.setItem("intuity-user", data);
      secureLocalStorage.setItem("intuity-is-logged-in", "true");
      secureLocalStorage.setItem(
        "intuity-companyId",
        data?.body?.alias || "intuityfe"
      );

      if (successCallBack) {
        successCallBack(data);
      }
      return {};
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Network error. Please try again.";
      return { error: message };
    }
  }

  async resetPassword(
    params: { email: string; company?: string | number; alias?: string },
    alias?: string
  ): Promise<{ error?: string }> {
    const { email, company, alias: paramAlias } = params;
    const resolvedAlias = alias || paramAlias;
    const formData = new FormData();
    formData.append("email", email);
    if (company) {
      formData.append("company", String(company));
    }
    if (resolvedAlias) {
      formData.append("alias", resolvedAlias);
      formData.append("company_alias", resolvedAlias);
      formData.append("company_login", resolvedAlias);
    }

    const res = await fetch(`${BASE_URL}index/recover-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (data?.status) {
      toast.success(
        data?.message ?? "Email sent!",
        "Please check your email inbox and click the link to change your password.",
        () => {
          navigateTo(resolvedAlias ? `/login-${resolvedAlias}` : "/login");
        }
      );
    }

    if (!res.ok || data?.status === false || data?.body?.errors?.[0]) {
      return {
        error:
          data?.message?.[0] ||
          data?.body?.errors?.[0] ||
          "Something went wrong !",
      };
    }
    return {};
  }

  async resetUserName(params: any, alias?: string): Promise<{ error?: string }> {
    const res = await fetch(`${BASE_URL}index/recover-login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: params,
      credentials: "include",
    });

    const data = await res.json();
    if (data?.status) {
      toast.success(
        data?.message ?? "Email sent!",
        "",
        () => {
          navigateTo(alias ? `/login-${alias}` : "/login");
        }
      );
    }

    if (!res.ok || data?.status === false || data?.body?.errors?.[0]) {
      return {
        error:
          data?.message?.[0] ||
          data?.body?.errors?.[0] ||
          "Something went wrong !",
      };
    }
    return {};
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: "Update reset not implemented" };
  }

  /**
   * Validates the session using GET /me with credentials.
   * Restores user state, active account, and CSRF token.
   */
  async getUser(): Promise<GetUserResult> {
    try {
      const res = await api.get("me");
      const data = res.data;

      if (data?.status && data?.body) {
        // Save the latest CSRF token
        if (data.body.csrf_token) {
          setCsrfToken(data.body.csrf_token);
        }

        const userData = {
          status: true,
          message: data.message || "Session valid",
          body: data.body,
        };

        // Update local storage so existing components continue to function
        secureLocalStorage.setItem("intuity-user", userData);
        secureLocalStorage.setItem("intuity-is-logged-in", "true");
        if (data.body.alias) {
          secureLocalStorage.setItem("intuity-companyId", data.body.alias);
        }

        // Update Redux state
        try {
          const { store } = await import("@/state/store");
          const { setUserInfo } = await import("@/state/features/accountSlice");
          store.dispatch(setUserInfo(userData));
        } catch {}

        return {
          data: userData,
          auth: (data.body.auth as UserAuthDetails) || null,
        };
      }

      return { data: null, error: data?.message || "Invalid session response" };
    } catch (err: any) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      const reason = responseData?.reason || responseData?.body?.reason || null;

      // Handle HTTP 401
      if (status === 401) {
        clearLocalStorage();
        clearCsrfToken();

        // Reset Redux stores
        try {
          const { store } = await import("@/state/store");
          const { resetAccountStore } = await import("@/state/features/accountSlice");
          const { resetDashboardStore } = await import("@/state/features/dashBoardSlice");
          const { resetPaymentStore } = await import("@/state/features/paymentSlice");
          store.dispatch(resetAccountStore());
          store.dispatch(resetDashboardStore());
          store.dispatch(resetPaymentStore());
        } catch {}

        if (reason === "expired") {
          toast.info("Your session has expired, please sign in again.");
        } else if (reason === "revoked") {
          toast.info("You have been signed out.");
        }
        // missing / invalid: show normal login page (no toast)

        return { data: null, auth: null, error: reason || "unauthorized", reason };
      }

      // Handle HTTP 503 / 500 / Network Error:
      // Backend explicitly confirms a 503 response from /me is NOT a logout.
      // Do not clear potentially valid authentication session.
      if (status === 503 || !err?.response || status >= 500) {
        const cachedUser = secureLocalStorage.getItem("intuity-user");
        return {
          data: cachedUser || null,
          auth: null,
          isServiceUnavailable: true,
          error: "Session validation service is temporarily unavailable.",
        };
      }

      return { data: null, auth: null, error: err?.message || "Session validation failed" };
    }
  }

  async signOut(formData?: FormData): Promise<{ error?: string }> {
    // Preserve alias details before clearing storage so user returns to company login page
    const aliasDetails = getLocalStorage("alias-details") as { alias?: string } | null;
    const companyAlias = aliasDetails?.alias ?? "";

    // 1. Call server-side logout to clear HttpOnly cookie and invalidate session across devices.
    // keepalive: true ensures the request completes even if page navigation or unload occurs.
    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
      await fetch(`${BASE_URL}logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        credentials: "include",
        keepalive: true,
        signal: controller?.signal,
      });
      if (timeoutId) clearTimeout(timeoutId);
    } catch {
      // Treat logout as completed even if the response indicates the session is already unauthorized or network timed out
    }

    // 2. Clear CSRF token
    clearCsrfToken();

    // 3. Clear all local storage
    clearLocalStorage();

    // 4. Restore alias if it existed
    if (aliasDetails) {
      setLocalStorage("alias-details", aliasDetails);
    }

    // 5. Reset all Redux slices to their initial state
    import("@/state/store").then(({ store }) => {
      import("@/state/features/accountSlice").then(({ resetAccountStore }) => store.dispatch(resetAccountStore()));
      import("@/state/features/dashBoardSlice").then(({ resetDashboardStore }) => store.dispatch(resetDashboardStore()));
      import("@/state/features/paymentSlice").then(({ resetPaymentStore }) => store.dispatch(resetPaymentStore()));
    }).catch(() => {});

    // 6. Redirect to alias login if available, otherwise generic login
    const loginPath = companyAlias ? `/login-${companyAlias}` : "/login";
    navigateTo(loginPath, { replace: true });

    return {};
  }
}

export const authClient = new AuthClient();
