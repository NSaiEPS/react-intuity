import { BASE_URL } from "@/api/axios";
import { navigateTo } from "@/utils/navigation";
import secureLocalStorage from "react-secure-storage";
import { toast } from "@/lib/custom-toast";

import type { User } from "@/types/user";

import { clearLocalStorage, getLocalStorage, setLocalStorage } from "../../utils/auth";

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
}

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

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    // localStorage.setItem('custom-auth-token', token);
    secureLocalStorage.setItem("custom-auth-token", token);

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
      // 4. Missing/null body or token
      // 5. Non-empty errors array or string
      const hasErrors =
        (Array.isArray(data?.body?.errors) && data.body.errors.length > 0) ||
        (typeof data?.body?.errors === "string" && data.body.errors.trim() !== "");

      const isFailed =
        !res.ok ||
        data?.status === false ||
        data?.body?.status === "error" ||
        !data?.body ||
        !data?.body?.token ||
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

      data.body.email = email;
      secureLocalStorage.setItem("intuity-user", data); // no need to JSON.stringify
      secureLocalStorage.setItem("custom-auth-token", data?.body?.token);
      secureLocalStorage.setItem("intuity-is-logged-in", "true");
      secureLocalStorage.setItem(
        "intuity-companyId",
        data?.body?.alias || "intuityfe"
      );
      if (successCallBack && data?.body?.token) {
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
    });

    const data = await res.json();
    if (data?.status) {
      // toast.success(data?.message ?? "Email sent!");
      toast.success(
        data?.message ?? "Email sent!",
        "Please check your email inbox and click the link to change your password.",
        () => {
          navigateTo(resolvedAlias ? `/login-${resolvedAlias}` : "/login"); // redirect after OK
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
    });

    const data = await res.json();
    if (data?.status) {
      // toast.success(data?.message ?? "Email sent!");
      toast.success(
        data?.message ?? "Email sent!",
        "",
        () => {
          navigateTo(alias ? `/login-${alias}` : "/login"); // redirect after OK
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

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    // const token = localStorage.getItem('custom-auth-token');
    const token: any = secureLocalStorage.getItem("intuity-user");

    if (!token) {
      return { data: null };
    }

    return { data: token };
  }

  async signOut(token: string, formData: FormData): Promise<{ error?: string }> {
    // Preserve alias details before clearing storage
    const aliasDetails = getLocalStorage("alias-details") as { alias?: string } | null;
    const companyAlias = aliasDetails?.alias ?? "";

    // Clear all local storage
    clearLocalStorage();

    // Restore alias if it existed
    if (aliasDetails) {
      setLocalStorage("alias-details", aliasDetails);
    }

    // Reset all Redux slices to their initial state
    import("@/state/store").then(({ store }) => {
      import("@/state/features/accountSlice").then(({ resetAccountStore }) => store.dispatch(resetAccountStore()));
      import("@/state/features/dashBoardSlice").then(({ resetDashboardStore }) => store.dispatch(resetDashboardStore()));
      import("@/state/features/paymentSlice").then(({ resetPaymentStore }) => store.dispatch(resetPaymentStore()));
    }).catch(() => {});

    // Redirect to alias login if available, otherwise generic login
    const loginPath = companyAlias ? `/login-${companyAlias}` : "/login";
    navigateTo(loginPath, { replace: true });

    // Fire the server-side token invalidation in the background.
    // Even if this fails the user is already logged out locally.
    fetch(`${BASE_URL}logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).catch(() => {/* silent — user is already logged out locally */});

    return {};
  }
}

export const authClient = new AuthClient();
