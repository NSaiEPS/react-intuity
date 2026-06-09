import {
  accountCustomerInfo,
  accountDetailsAPI,
  contactCustomerServiceApi,
  deleteAlertsAPI,
  deleteCardAndBankAccountApi,
  getCompanyDetailsApi,
  getConfirmInfoApi,
  getConvenienceFeeAPI,
  getPaymentDetailsApi,
  getPaymentProcessorDetailsAPI,
  getUserDetailsByToken,
  getWorldPlayPaymentDetailsAPI,
  guestPaymentRequestApi,
  listAnotherAccountAPI,
  oneTimePaymentApi,
  paperLessUpdate,
  paymentWithoutSavingDetailsAPI,
  registerApi,
  saveAcknowledgeForRecurringPaymentApi,
  saveDefaultPaymentMethodAPI,
  schedulePaymentAPI,
  transferService,
  updatePassword,
  updateUserInfo,
  updateVoicePreferenceAPi,
  usageAlertsAPI,
} from "@/api/dashboard";

import { navigateTo } from "@/utils/navigation";
import { createSlice } from "@reduxjs/toolkit";
import secureLocalStorage from "react-secure-storage";

import { toast } from "@/lib/custom-toast";
import { toast as simpleToast } from "react-toastify";
import type { AppDispatch } from "@/state/store";
import type {
  AccountInfoBody,
  CompanyInfoBody,
  ConfirmInfoBody,
  ConvenienceFeeBody,
  NotificationPreferencesBody,
  OneTimePaymentBody,
  PaymentCard,
  PaymentDetailsBody,
  PaymentProcessorBody,
  RegisterResponseBody,
  SetLoadingFn,
  TransferInfoBody,
  UsageAlertsBody,
} from "@/types/domain";

interface DahBoardState {
  userInfo: Record<string, unknown>;
  accountInfo: AccountInfoBody;
  accountLoading: boolean;
  accountError: string | null;
  transferInfo: TransferInfoBody;
  paymentMethodInfo: PaymentDetailsBody;
  paymentMethodInfoCards: PaymentCard[];
  confirmInfo: ConfirmInfoBody;
  companyInfo: CompanyInfoBody | null;
  usageAlerts: UsageAlertsBody;
  paymentProcessorDetails: PaymentProcessorBody;
  selectedCardInfo: PaymentCard | null;
  convenienceFee: ConvenienceFeeBody;
  oneTimePaymentInfo: OneTimePaymentBody;
  paymentRequiredKeyDetails: Record<string, unknown>;
  notificationPreferenceDetails: NotificationPreferencesBody;
  paymentDetailsInfo: PaymentDetailsBody;
}

const initialState: DahBoardState = {
  accountInfo: {},
  accountLoading: false,
  accountError: null,
  transferInfo: {},
  paymentMethodInfo: {},
  paymentMethodInfoCards: [],
  confirmInfo: {},
  usageAlerts: {},
  userInfo: {},
  companyInfo: null,
  paymentProcessorDetails: {},
  selectedCardInfo: null,
  convenienceFee: {},
  oneTimePaymentInfo: {},
  paymentRequiredKeyDetails: {},
  notificationPreferenceDetails: {},
  paymentDetailsInfo: {},
};

const AccountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccountInfo(state, action) {
      state.accountInfo = action.payload;
    },
    setAccountLoading(state, action) {
      state.accountLoading = action.payload;
    },
    setTransferInfo(state, action) {
      state.transferInfo = action.payload;
    },
    setPaymentMethodInfo(state, action) {
      state.paymentMethodInfoCards = action.payload;
    },
    setSelectedCardInfo(state, action) {
      state.selectedCardInfo = action.payload;
    },
    setConfirmInfo(state, action) {
      state.confirmInfo = action.payload;
    },
    setCompanyInfo(state, action) {
      state.companyInfo = action.payload;
    },
    setUsageAlerts(state, action) {
      state.usageAlerts = action.payload;
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
    setPaymentProcessorDetails(state, action) {
      state.paymentProcessorDetails = action.payload;
    },
    setConvenienceFee(state, action) {
      state.convenienceFee = action.payload;
    },
    setOneTimePaymentInfo(state, action) {
      state.oneTimePaymentInfo = action.payload;
    },
    setPaymentRequiredKeyDetails(state, action) {
      state.paymentRequiredKeyDetails = action.payload;
    },
    setNotificationPreferenceDetails(state, action) {
      state.notificationPreferenceDetails = action.payload;
    },
    setPaymentDetailsInfo(state, action) {
      state.paymentDetailsInfo = action.payload;
    },
    resetStore() {
      return initialState;
    },
  },
});

export const {
  setAccountInfo,
  setAccountLoading,
  setTransferInfo,
  setPaymentMethodInfo,
  setSelectedCardInfo,
  setConfirmInfo,
  setCompanyInfo,
  setUsageAlerts,
  setUserInfo,
  setPaymentProcessorDetails,
  setConvenienceFee,
  setOneTimePaymentInfo,
  setPaymentRequiredKeyDetails,
  setNotificationPreferenceDetails,
  setPaymentDetailsInfo,
  resetStore: resetAccountStore,
} = AccountSlice.actions;

export default AccountSlice.reducer;

// ─── Thunks ───────────────────────────────────────────────────────────────────
// Token is no longer accepted as a parameter — the axios interceptor in
// src/api/axios.ts reads it from secureLocalStorage automatically.

export const getAccountInfo = (
  role_id: string,
  user_id: string,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await accountDetailsAPI({ role_id, user_id });
    if (res?.status) {
      dispatch(setAccountInfo(res?.body));
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const updateAccountCustomerInfo = (
  formData: FormData,
  successCallback?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await accountCustomerInfo({ formData });
    if (res?.status) {
      toast.success(res?.message ?? "Email Sent!");
      dispatch(setAccountInfo(res?.body));
      if (successCallback) successCallback();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Something went wrong!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const stopTransferService = (
  formData: FormData,
  isGetApi = false,
  successCallBack?: () => void,
  setContextLoading?: SetLoadingFn,
  nodataSaving = false
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await transferService({ formData });
    if (res.status) {
      if (!nodataSaving) dispatch(setTransferInfo(res?.body));
      if (successCallBack) successCallBack();
      if (!isGetApi) toast.success(res?.message ?? "Sent message successfully.");
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.message ?? "Something went wrong!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const updateAccountInfo = (
  formData: FormData,
  profile = false,
  successCallBack?: (data?: any) => void,
  dataRequired = false,
  setContextLoading?: SetLoadingFn,
  reduxNeeded = false,
  noRedirect = false
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = profile
      ? await updateUserInfo({ formData })
      : await updatePassword({ formData });

    if (res.status) {
      if (reduxNeeded) dispatch(setNotificationPreferenceDetails(res?.body));
      if (res?.body?.otp) toast.success("OTP sent successfully.");
      if (!dataRequired) {
        toast.success(
          res?.status == 200
            ? res?.data
            : res?.message
            ? res?.body?.notification_email_message ?? res?.message
            : profile
            ? "Updated User Info"
            : "Updated Password!"
        );
      }
      if (successCallBack) {
        dataRequired ? successCallBack(res?.body) : successCallBack();
      }
    } else {
      if (
        res?.message ===
        "We apologize but we are currently not able to verify your 2FA phone number. Please try again later."
      ) {
        toast.error(res?.message);
        return;
      }
      if (
        res?.message ===
        "We apologize but we are currently not able to verify your phone number. Please try again later."
      ) {
        toast.error(res?.message);
        return;
      }
      if (!noRedirect && profile) navigateTo("/login", { replace: true }, res?.message);
      toast.error(res?.message ?? "Something went wrong!!!!!");
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!!!!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const updatePaperLessInfo = (
  formData: FormData,
  type: string,
  successCallBack?: ((data?: PaymentCard) => void) | (() => void),
  saveResponse = false,
  setAutoPaySettings?: (settings: Record<string, unknown>) => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await paperLessUpdate({ formData, type });
    if (res.status) {
      if (!saveResponse) {
        toast.success(
          res?.message
            ? res?.message
            : type === "autopay"
            ? "Updated Auto Pay!"
            : "Updated Paperless!"
        );
      }
      if (successCallBack) {
        if (saveResponse) {
          successCallBack(res?.body?.autopay_card);
          if (setAutoPaySettings) setAutoPaySettings(res?.body?.autopay_setting);
        } else {
          successCallBack();
        }
      }
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const getPaymentDetails = (
  formData: FormData,
  isPost = false,
  successCallBack?: (customer: any) => void,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getPaymentDetailsApi({ formData });
    if (res?.status) {
      if (successCallBack) successCallBack(res?.body?.customer);
      if (!isPost) {
        dispatch(setPaymentMethodInfo(res?.body?.mycards));
        dispatch(setSelectedCardInfo(res?.body?.selected_card));
        dispatch(setPaymentDetailsInfo(res?.body));
        dispatch(setPaymentRequiredKeyDetails(res?.body?.worldpay_transaction_set_up_id));
      } else {
        toast.success(res?.message ? res?.message : "Payment method saved!");
      }
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (isPost && res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const deleteCardAndBankAccount = (
  formData: FormData,
  type: "card" | "bank_account",
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await deleteCardAndBankAccountApi({ formData, type });
    if (res.status) {
      toast.success(
        res?.message
          ? res?.message
          : type === "card"
          ? "Successfully Deleted the Card"
          : "Successfully Deleted the Bank Account"
      );
      if (successCallBack) successCallBack();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const updateVoicePreference = (
  formData: FormData,
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await updateVoicePreferenceAPi({ formData });
    if (res.status) {
      toast.success(res?.message ? res?.message : "Updated Voice Preference");
      if (successCallBack) successCallBack();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const contactCustomerService = (
  formData: FormData,
  successCallBack?: (body: any) => void,
  showMessage = true,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await contactCustomerServiceApi({ formData });
    if (res.status) {
      if (successCallBack) successCallBack(res?.body);
      if (showMessage) toast.success(res?.message ? res?.message : "Message Sent!");
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const getConfirmInfo = (
  formData: FormData,
  successCallBack?: () => void,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getConfirmInfoApi({ formData });
    if (res.status) {
      dispatch(setConfirmInfo(res?.body));
      if (successCallBack) successCallBack();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const getCompanyDetails = (
  formData: FormData,
  successCallBack?: () => void,
  failureCallBack?: () => void,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getCompanyDetailsApi({ formData });
    if (res.status) {
      dispatch(setCompanyInfo(res?.body));
      if (successCallBack) successCallBack();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
      if (failureCallBack) failureCallBack();
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
    if (failureCallBack) failureCallBack();
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const registerApiRequest = (
  formData: FormData,
  successCallBack?: (body: RegisterResponseBody) => void,
  seLoading?: SetLoadingFn,
  alias?: string,
  activeStep?: number
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await registerApi({ formData, alias });
    if (!alias) {
      toast.error("Company alias missing. Please reload the page.");
      dispatch(setAccountLoading(false));
      return;
    }
    if (res?.status) {
      if (activeStep !== 2) {
        // simpleToast.success(res?.message ?? "Something went wrong!");
      }
      if (successCallBack) successCallBack(res?.body);
    } else {
      const msg = res?.message
        ? typeof res?.message === "string"
          ? res?.message
          : res?.message[0]
        : "Something went wrong!";
      toast.error(
        "",
        msg ===
          "Oops! We're sorry, we did not find a match with the authentication information you provided. Please try again or try a different authentication method to match."
          ? " Oops! We’re sorry, your verification answer did not match the selected question. Please try again or use a different verification question."
          : msg
      );
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    if (seLoading) seLoading(false);
    dispatch(setAccountLoading(false));
  }
};

export const linkAnotherAccount = (
  formData: FormData,
  successCallBack?: (body: any) => void,
  seLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await listAnotherAccountAPI({ formData });
    if (res?.status) {
      toast.success(res?.message ?? "Something went wrong!");
      if (successCallBack) successCallBack(res?.body);
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      toast.error(
        res?.message
          ? typeof res?.message === "string"
            ? res?.message
            : res?.message[0]
          : "Something went wrong!"
      );
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    if (seLoading) seLoading(false);
    dispatch(setAccountLoading(false));
  }
};

export const getUsageAlerts = (
  formData: FormData,
  successCallback?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await usageAlertsAPI({ formData });
    if (res?.status) {
      dispatch(setUsageAlerts(res?.body));
      if (successCallback) successCallback();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Something went wrong!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const paymentWithoutSavingDetails = (
  formData: FormData,
  isPost = false,
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await paymentWithoutSavingDetailsAPI({ formData });
    if (res?.status) {
      if (successCallBack) successCallBack();
      toast.success(res?.message ? res?.message : "Payment SuccessFull!");
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (isPost && res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const getPaymentProcessorDetails = (
  formData: FormData,
  isPost = false,
  successCallBack?: () => void,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getPaymentProcessorDetailsAPI({ formData });
    if (res?.status) {
      if (successCallBack) successCallBack();
      dispatch(setPaymentProcessorDetails(res?.body));
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (isPost && res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const saveDefaultPaymentMethod = (
  formData: FormData,
  isPost = false,
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await saveDefaultPaymentMethodAPI({ formData });
    if (res?.status) {
      if (successCallBack) successCallBack();
      toast.success(res?.message ? res?.message : "Payment Saved SuccessFully!");
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (isPost && res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const getConvenienceFee = (
  formData: FormData,
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getConvenienceFeeAPI({ formData });
    if (res?.status) {
      dispatch(setConvenienceFee(res?.body));
      if (successCallBack) successCallBack();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const schedulePayment = (
  formData: FormData,
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await schedulePaymentAPI({ formData });
    if (res?.status) {
      if (successCallBack) successCallBack();
      toast.success(res?.message ? res?.message : "Payment SuccessFully Scheduled!");
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const guestPaymentRequest = (
  formData: FormData,
  alias: string,
  successCallBack?: (customer: any) => void,
  failureCallBack?: (isBlocked?: boolean, hasError?: true) => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await guestPaymentRequestApi({ formData, alias });
    if (res.status) {
      if (res?.body?.is_payments_blocked) {
        failureCallBack(res?.body?.is_payments_blocked);
      } else {
        dispatch(setOneTimePaymentInfo(res?.body));
        if (successCallBack) successCallBack(res?.body?.customer);
      }
    } else {
      if (res?.message !== "You are not authorised to use this api") {
        const msg =
          res?.message === "Invoice amount must match your last bill."
            ? "Enter the amount from your original invoice for this billing period. Do not include any recently added late fees. Do not reduce the invoice amount due to any payments made since you received the initial bill."
            : res?.message;
        toast.error("", msg ?? "Something went wrong!");
      }
      if (failureCallBack) failureCallBack(undefined, true);
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
    if (failureCallBack) failureCallBack();
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const saveAcknowledgeForRecurringPayment = (
  formData: FormData,
  successCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await saveAcknowledgeForRecurringPaymentApi({ formData });
    if (res.status) {
      toast.success(res?.message ? res?.message : " Acknowledgement Saved !!");
      if (successCallBack) successCallBack();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const oneTimePayment = (
  formData: FormData,
  successCallBack?: (customer: any) => void,
  failureCallBack?: () => void,
  companyAlias?: string,
  successCallBackWithToast?: (toast: any) => void,

) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await oneTimePaymentApi({ formData, companyAlias });
    if (res.status) {
      toast.success(res?.message ?? "Payment was successful");
      if (successCallBack) successCallBack(res?.body?.customer);
      if (successCallBackWithToast) successCallBackWithToast(res?.message);
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
      if (failureCallBack) failureCallBack();
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
    if (failureCallBack) failureCallBack();
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const deleteUsageAlerts = (
  formData: FormData,
  successCallback?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await deleteAlertsAPI({ formData });
    if (res?.status) {
      if (successCallback) successCallback();
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Something went wrong!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

export const getWorldPlayPaymentDetails = (
  formData: FormData,
  successCallback?: (body: Record<string, unknown>) => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getWorldPlayPaymentDetailsAPI({ formData });
    if (res?.status) {
      if (successCallback) successCallback(res?.body);
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Something went wrong!");
  } finally {
    dispatch(setAccountLoading(false));
  }
};

// Special: token here is a one-time URL login token, not the stored auth token.
export const getUserInfoByToken = (
  token: string,
  formData: FormData,
  successCallBack?: (body: any) => void,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setAccountLoading(true));
  try {
    const res = await getUserDetailsByToken({ token, formData });
    if (res.status) {
      if (successCallBack) successCallBack(res?.body);
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!");
  } finally {
    dispatch(setAccountLoading(false));
    if (setContextLoading) setContextLoading(false);
  }
};
