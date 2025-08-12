// 'use server';

import { BASE_URL } from "./axios";

// import { cookies } from 'next/headers';

// import { SignInWithPasswordParams } from '@/lib/auth/client';

export interface DashBoardAPIParams {
  role_id: string;
  user_id: string;
  token: string;
}
export interface AccountUpdateForm {
  token: string;
  formData: any;
  type?: string;
}
// export async function homeApi(params: DashBoardAPIParams) {
export async function homeApi({ role_id, user_id, token }: DashBoardAPIParams) {
  // const token = cookies().get('auth-token')?.value;

  const formData = new FormData();

  formData.append("acl_role_id", role_id);
  formData.append("customer_id", user_id);
  //   const body = new URLSearchParams({ email, password }).toString();

  const res = await fetch(`${BASE_URL}home`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function accountDetailsAPI({
  role_id,
  user_id,
  token,
}: DashBoardAPIParams) {
  // const token = cookies().get('auth-token')?.value;

  const formData = new FormData();

  formData.append("acl_role_id", role_id);
  formData.append("customer_id", user_id);
  formData.append("is_form", "0");
  //   const body = new URLSearchParams({ email, password }).toString();

  const res = await fetch(`${BASE_URL}request/front/account-info`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function accountCustomerInfo({
  token,
  formData,
}: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}request/front/account-info`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function transferService({ token, formData }: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}request/front/transfer-service`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function paperLessUpdate({
  token,
  formData,
  type,
}: AccountUpdateForm) {
  const api =
    type === "autopay"
      ? `${BASE_URL}settings/front/autopay-setting`
      : `${BASE_URL}settings/front/paperless-setting`;
  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function updatePassword({
  token,
  formData,
  type,
}: AccountUpdateForm) {
  const api = `${BASE_URL}index/change-password`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function updateUserInfo({
  token,
  formData,
  type,
}: AccountUpdateForm) {
  const api = `${BASE_URL}my-account`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function getPaymentDetailsApi({
  token,
  formData,
}: AccountUpdateForm) {
  const api = `${BASE_URL}settings/front/payment-method`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function deleteCardAndBankAccountApi({
  token,
  formData,
  type,
}: AccountUpdateForm) {
  let api = `${BASE_URL}billing/front/delete-card/`;
  if (type == "card") {
    api = `${BASE_URL}billing/front/delete-card/`;
  } else if (type === "bank_account") {
    api = `${BASE_URL}billing/front/delete-bank-account/`;
  }
  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

// export async function getNotificationListApi({ token, formData }: AccountUpdateForm) {
//   const api = 'https://test-intuity-backend.pay.waterbill.com/my-account';

//   const res = await fetch(api, {
//     method: 'POST',

//     headers: {
//       Accept: 'application/json',
//       Authorization: `Bearer ${token}`, // ✅ Add the token to headers
//     },
//     body: formData,
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     return { error: data?.body?.errors?.[0] || 'Details failed' };
//   }

//   return data;
// }

export async function updateVoicePreferenceAPi({
  token,
  formData,
}: AccountUpdateForm) {
  const api = `${BASE_URL}settings/front/update-customer-column`;
  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function contactCustomerServiceApi({
  token,
  formData,
}: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}request/front/contact-service`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function getConfirmInfoApi({
  token,
  formData,
}: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}confirm-information`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function getCompanyDetailsApi({ formData }) {
  const res = await fetch(`${BASE_URL}get-details-by-alias`, {
    method: "POST",

    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function registerApi({ formData }: any) {
  //TODO: make dynamic
  const api = `${BASE_URL}register-cape-royale1`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function listAnotherAccountAPI({ token, formData }: any) {
  const api = `${BASE_URL}add-account`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function usageAlertsAPI({ token, formData }: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}usage/front/list-alerts`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function usageGraphAPI({ token, formData }: AccountUpdateForm) {
  // const res = await fetch('https://test-intuity-backend.pay.waterbill.com/usage', {
  const res = await fetch(`${BASE_URL}usage-bar-chart`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function getInvoiceDetailsAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const api = `${BASE_URL}billing/front/invoice`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function usageMonthlyGraphAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}usage/front/usage-meters-data`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function usageUtilityFiltersAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}get-utilityum-list`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function getLastBillInfoAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const res = await fetch(`${BASE_URL}billing/front/billing-details`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function paymentWithoutSavingDetailsAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const api = `${BASE_URL}billing/front/payment`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function getPaymentProcessorDetailsAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const api = `${BASE_URL}get-payment-processors`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}

export async function saveDefaultPaymentMethodAPI({
  token,
  formData,
}: AccountUpdateForm) {
  const api = `${BASE_URL}save-default-payment-method`;

  const res = await fetch(api, {
    method: "POST",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the token to headers
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data?.body?.errors?.[0] || "Details failed" };
  }

  return data;
}
