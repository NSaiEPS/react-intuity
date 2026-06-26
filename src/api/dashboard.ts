import { navigateTo } from "@/utils/navigation";
import secureLocalStorage from "react-secure-storage";
import api from "./axios";

// ─── Authenticated endpoints ─────────────────────────────────────────────────
// Token is injected automatically by the axios request interceptor in axios.ts.
// No function here needs to accept or forward a token.

export async function check2FAStatusApi() {
  const res = await api.get("index/check-two-fa-confirm-status");
  return res.data;
}

export async function homeApi({ role_id, user_id }: { role_id: string; user_id: string }) {
  const formData = new FormData();
  formData.append("acl_role_id", role_id);
  formData.append("customer_id", user_id);
  const res = await api.post("home", formData);
  return res.data;
}

export async function accountDetailsAPI({ role_id, user_id }: { role_id: string; user_id: string }) {
  const formData = new FormData();
  formData.append("acl_role_id", role_id);
  formData.append("customer_id", user_id);
  formData.append("is_form", "0");
  const res = await api.post("request/front/account-info", formData);
  return res.data;
}

export async function accountCustomerInfo({ formData }: { formData: FormData }) {
  const res = await api.post("request/front/account-info", formData);
  return res.data;
}

export async function transferService({ formData }: { formData: FormData }) {
  const res = await api.post("request/front/transfer-service", formData);
  return res.data;
}

export async function paperLessUpdate({ formData, type }: { formData: FormData; type?: string }) {
  const endpoint =
    type === "autopay"
      ? "settings/front/autopay-setting"
      : "settings/front/paperless-setting";
  const res = await api.post(endpoint, formData);
  return res.data;
}

export async function updatePassword({ formData }: { formData: FormData }) {
  const res = await api.post("index/change-password", formData);
  return res.data;
}

export async function updateUserInfo({ formData }: { formData: FormData }) {
  const res = await api.post("my-account", formData);
  return res.data;
}

export async function getPaymentDetailsApi({ formData }: { formData: FormData }) {
  const res = await api.post("settings/front/payment-method", formData);
  return res.data;
}

export async function deleteCardAndBankAccountApi({ formData, type }: { formData: FormData; type?: string }) {
  const endpoint =
    type === "bank_account"
      ? "billing/front/delete-bank-account/"
      : "billing/front/delete-card/";
  const res = await api.post(endpoint, formData);
  return res.data;
}

export async function updateVoicePreferenceAPi({ formData }: { formData: FormData }) {
  const res = await api.post("settings/front/update-customer-column", formData);
  return res.data;
}

export async function contactCustomerServiceApi({ formData }: { formData: FormData }) {
  const res = await api.post("request/front/contact-service", formData);
  return res.data;
}

export async function getConfirmInfoApi({ formData }: { formData: FormData }) {
  const res = await api.post("confirm-information", formData);
  return res.data;
}

export async function listAnotherAccountAPI({ formData }: { formData: FormData }) {
  const res = await api.post("add-account", formData);
  return res.data;
}

export async function usageAlertsAPI({ formData }: { formData: FormData }) {
  const res = await api.post("usage/front/list-alerts", formData);
  return res.data;
}

export async function deleteAlertsAPI({ formData }: { formData: FormData }) {
  const res = await api.post("usage/front/delete-alerts", formData);
  return res.data;
}

export async function usageGraphAPI({ formData }: { formData: FormData }) {
  const res = await api.post("usage-bar-chart", formData);
  return res.data;
}

export async function getInvoiceDetailsAPI({ formData }: { formData: FormData }) {
  const res = await api.post("billing/front/invoice", formData);
  return res.data;
}

export async function usageMonthlyGraphAPI({ formData }: { formData: FormData }) {
  const res = await api.post("usage/front/usage-meters-data", formData);
  return res.data;
}

export async function usageUtilityFiltersAPI({ formData }: { formData: FormData }) {
  const res = await api.post("get-utilityum-list", formData);
  return res.data;
}

export async function getLastBillInfoAPI({ formData }: { formData: FormData }) {
  const res = await api.post("billing/front/billing-details", formData);
  return res.data;
}

export async function paymentWithoutSavingDetailsAPI({ formData }: { formData: FormData }) {
  const res = await api.post("billing/front/payment", formData);
  return res.data;
}

export async function getPaymentProcessorDetailsAPI({ formData }: { formData: FormData }) {
  const res = await api.post("get-payment-processors", formData);
  return res.data;
}

export async function saveDefaultPaymentMethodAPI({ formData }: { formData: FormData }) {
  const res = await api.post("save-default-payment-method", formData);
  return res.data;
}

export async function getConvenienceFeeAPI({ formData }: { formData: FormData }) {
  const res = await api.post("get-convenience-fee", formData);
  return res.data;
}

export async function schedulePaymentAPI({ formData }: { formData: FormData }) {
  const res = await api.post("billing/front/payment", formData);
  return res.data;
}

export async function saveAcknowledgeForRecurringPaymentApi({ formData }: { formData: FormData }) {
  const res = await api.post("billing/front/recurring-pay-customer-acknowledge", formData);
  return res.data;
}

export async function getWorldPlayPaymentDetailsAPI({ formData }: { formData: FormData }) {
  const res = await api.post("get-worldpay-iframe-mobile", formData);
  return res.data;
}

// ─── Special: login-with-token ────────────────────────────────────────────────
// The `token` here is a one-time URL-based login token (NOT the stored auth
// token).  The user is not yet logged in, so the interceptor has nothing to
// inject — we must set the Authorization header explicitly here.
export async function getUserDetailsByToken({ token, formData }: { token: string; formData: FormData }) {
  const res = await api.post("login-with-token", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = res.data;
  secureLocalStorage.setItem("intuity-user", data);
  secureLocalStorage.setItem("custom-auth-token", data?.body?.token);
  secureLocalStorage.setItem("intuity-companyId", data?.body?.alias || "intuityfe");
  navigateTo(`/${data?.body?.alias}/dashboard`, { replace: true });
  return data;
}

// ─── Public endpoints (no auth token needed) ─────────────────────────────────

export async function getCompanyDetailsApi({ formData }: { formData: FormData }) {
  const res = await api.post("get-details-by-alias", formData);
  return res.data;
}

export async function registerApi({ formData, alias }: { formData: FormData; alias: string }) {
  const res = await api.post(`registerfe-${alias}`, formData);
  return res.data;
}

export async function guestPaymentRequestApi({ formData, alias }: { formData: FormData; alias: string }) {
  const res = await api.post(`pay-as-guest-${alias}`, formData);
  return res.data;
}

export async function oneTimePaymentApi({ formData, companyAlias = "cape-royale1" }: { formData: FormData; companyAlias?: string }) {
  const res = await api.post(`pay-as-guest-${companyAlias}`, formData);
  return res.data;
}
