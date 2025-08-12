// import api from '@/app/api/axios';
import api, { BASE_URL } from "@/api/axios";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";

import type { User } from "@/types/user";

import { removeLocalStorage } from "../../utils/auth";

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
}

const user = {
  id: "USR-000",
  avatar: "/assets/avatar.png",
  firstName: "Sofia",
  lastName: "Rivers",
  email: "sofia@devias.io",
} satisfies User;

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

  // async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
  //   const { email, password } = params;
  //   const formData = new FormData();

  //   formData.append('email', email);
  //   formData.append('password', password);

  //   // Make API request
  //   const res: any = await api.post('/login', formData);
  //   console.log(res, 'errorerror');
  //   const token = res.data?.body.token;

  //   if (token) {
  //     localStorage.setItem('custom-auth-token', token);
  //     setLocalStorage('custom-auth-token', token);

  //     setLocalStorage('intuity-user', JSON.stringify(res.data?.body));
  //     return {};
  //   } else {
  //     return { error: res?.data?.body?.errors?.[0] };
  //   }
  // }

  async signInWithPassword(
    params: { email: string; password: string },
    successCallBack
  ): Promise<{ error?: string }> {
    const { email, password } = params;
    const formData = new FormData();

    formData.append("email", email);
    formData.append("password", password);
    const res = await fetch(`${BASE_URL}login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await res.json();
    console.log(data, "errorerror");

    if (!res.ok || data?.body?.errors?.[0]) {
      return { error: data?.body?.errors?.[0] || "Login failed" };
    }

    // Save user data (not token!) in localStorage
    // localStorage.setItem('intuity-user', JSON.stringify(data));
    // localStorage.setItem('custom-auth-token', data?.body?.token);
    secureLocalStorage.setItem("intuity-user", data); // no need to JSON.stringify
    secureLocalStorage.setItem("custom-auth-token", data?.body?.token);
    secureLocalStorage.setItem(
      "intuity-companyId",
      data?.body?.alias || "intuityfe"
    );
    // Cookies.set('intuity-user', JSON.stringify(data.body), {
    //   expires: 7,
    //   secure: true,
    //   path: '/',
    //   sameSite: 'Lax',
    // });
    if (successCallBack && data?.body?.token) {
      successCallBack(data);
    }
    return {};
  }

  async resetPassword(params: { email: string }): Promise<{ error?: string }> {
    const { email } = params;
    const formData = new FormData();

    formData.append("email", email);

    const res = await fetch(`${BASE_URL}index/recover-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await res.json();
    if (data?.status) {
      toast.success(data?.message ?? "Email sent!");
    }
    console.log(data, "errorerror");
    if (!res.ok || data?.status == false || data?.body?.errors?.[0]) {
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

  async signOut(): Promise<{ error?: string }> {
    removeLocalStorage("custom-auth-token");
    removeLocalStorage("intuity-user");

    return {};
  }
}

export const authClient = new AuthClient();
