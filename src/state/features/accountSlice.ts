import {
  accountCustomerInfo,
  accountDetailsAPI,
  contactCustomerServiceApi,
  deleteCardAndBankAccountApi,
  getCompanyDetailsApi,
  getConfirmInfoApi,
  getConvenienceFeeAPI,
  getPaymentDetailsApi,
  getPaymentProcessorDetailsAPI,
  guestPaymentRequestApi,
  listAnotherAccountAPI,
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
import { clearLocalStorage } from "@/utils/auth";
import { createSlice } from "@reduxjs/toolkit";

import { toast } from "react-toastify";

type Users = {};
interface DahBoardState {
  userInfo: any;
  accountInfo: any;
  accountLoading: boolean;
  accountError: string | null;
  transferInfo: any;
  paymentMethodInfo: any;
  paymentMethodInfoCards: any;
  confirmInfo: any;
  companyInfo: any;
  usageAlerts: any;
  paymentProcessorDetails: any;
  selectedCardInfo: any;
  convenienceFee: any;
  oneTimePaymentInfo: any;
}

const initialState = {
  accountInfo: {},
  accountLoading: false,
  accountError: null,
  transferInfo: {},
  paymentMethodInfo: {},
  paymentMethodInfoCards: [],
  confirmInfo: {},
  usageAlerts: {},
  userInfo: {},
  paymentProcessorDetails: {},
  selectedCardInfo: {},
  convenienceFee: {},
  oneTimePaymentInfo: {},
} as DahBoardState;

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
      // state.paymentMethodInfo = action.payload;
      state.paymentMethodInfoCards = action.payload;
    },
    setSelectedCardInfo(state, action) {
      // state.paymentMethodInfo = action.payload;
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
} = AccountSlice.actions;

export default AccountSlice.reducer;

export const getAccountInfo: any =
  (role_id, user_id, token, setContextLoading) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await accountDetailsAPI({ role_id, user_id, token });

      if (res?.status) {
        console.log(res, "accountDetailsAPI");
        dispatch(setAccountInfo(res?.body));
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const updateAccountCustomerInfo: any =
  (token, formData, successCallback) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await accountCustomerInfo({ token, formData });

      if (res?.status) {
        console.log(res, "accountDetailsAPI");
        toast.success(res?.message ?? "Email Sent!");

        dispatch(setAccountInfo(res?.body));
        if (successCallback) {
          successCallback();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Something went wrong!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const stopTransferService: any =
  (token, formData, isGetApi = false, successCallBack, setContextLoading) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await transferService({ token, formData });

      if (res.status) {
        dispatch(setTransferInfo(res?.body));
        if (successCallBack) {
          successCallBack();
        }
        if (!isGetApi) {
          toast.success(res?.message ?? "Sent message successfully.");
        }
        // message.success(res?.data?.message);
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong!");
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const updateAccountInfo: any =
  (
    token,
    formData,
    profile = false,
    successCallBack,
    dataRequired = false,
    setContextLoading
  ) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      let res;
      if (profile) {
        res = await updateUserInfo({ token, formData });
      } else {
        res = await updatePassword({ token, formData });
      }

      if (res.status) {
        if (!dataRequired) {
          toast.success(
            res?.status == 200
              ? res?.data
              : res?.message
              ? res?.message
              : profile
              ? "Updated User Info"
              : "Updated Password!"
          );
        }
        if (successCallBack) {
          if (dataRequired) {
            successCallBack(res?.body);
          } else {
            successCallBack();
          }
        }
        //toast(res?.data?.message);
        // message.success(res?.data?.message);
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const updatePaperLessInfo: any =
  (token, formData, type, successCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await paperLessUpdate({ token, formData, type });

      if (res.status) {
        toast.success(
          res?.message
            ? res?.message
            : type === "autopay"
            ? "Updated Auto Pay!"
            : "Updated Paperless!"
        );

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const getPaymentDetails: any =
  (token, formData, isPost = false, successCallBack, setContextLoading) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await getPaymentDetailsApi({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack(res?.body?.customer);
        }
        if (!isPost) {
          dispatch(setPaymentMethodInfo(res?.body?.mycards));
          dispatch(setSelectedCardInfo(res?.body?.selected_card));
        } else {
          toast.success(res?.message ? res?.message : "Payment method saved!");
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        if (isPost) {
          toast.error(res?.message ?? "Something went wrong!");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const deleteCardAndBankAccount: any =
  (token, formData, type, successCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await deleteCardAndBankAccountApi({ token, formData, type });

      if (res.status) {
        toast.success(
          res?.message
            ? res?.message
            : type === "card"
            ? "Successfully Deleted the Card"
            : "Successfully Deleted the Bank Account"
        );

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const updateVoicePreference: any =
  (token, formData, successCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await updateVoicePreferenceAPi({ token, formData });

      if (res.status) {
        toast.success(res?.message ? res?.message : "Updated Voice Preference");

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const contactCustomerService: any =
  (token, formData, successCallBack, showMessage = true, setContextLoading) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await contactCustomerServiceApi({ token, formData });

      if (res.status) {
        if (successCallBack) {
          successCallBack(res?.body);
        }
        if (showMessage) {
          toast.success(res?.message ? res?.message : "Message Sent!");
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const getConfirmInfo: any =
  (token, formData, successCallBack, setContextLoading) => async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await getConfirmInfoApi({ token, formData });

      if (res.status) {
        dispatch(setConfirmInfo(res?.body));

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const getCompanyDetails: any =
  (formData, successCallBack, failureCallBack, setContextLoading) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await getCompanyDetailsApi({ formData });

      if (res.status) {
        dispatch(setCompanyInfo(res?.body));

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }

        toast.error(res?.message ?? "Something went wrong!");
        if (failureCallBack) {
          failureCallBack();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
      if (failureCallBack) {
        failureCallBack();
      }
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const registerApiRequest: any =
  (formData, successCallBack, seLoading) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await registerApi({ formData });

      // console.log(res, 'getPaymentDetails');

      if (res?.status) {
        toast.success(res?.message ?? "Something went wrong!");

        if (successCallBack) {
          successCallBack(res?.body);
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(
          res?.message
            ? typeof res?.message == "string"
              ? res?.message
              : res?.message[0]
            : "Something went wrong!"
        );
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      if (seLoading) {
        seLoading(false);
      }
      dispatch(setAccountLoading(false));
    }
  };

export const linkAnotherAccount: any =
  (token, formData, successCallBack, seLoading) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await listAnotherAccountAPI({ token, formData });

      console.log(res, "linkAnotherAccount");

      if (res?.status) {
        toast.success(res?.message ?? "Something went wrong!");

        if (successCallBack) {
          successCallBack(res?.body);
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(
          res?.message
            ? typeof res?.message == "string"
              ? res?.message
              : res?.message[0]
            : "Something went wrong!"
        );
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      if (seLoading) {
        seLoading(false);
      }
      dispatch(setAccountLoading(false));
    }
  };

export const getUsageAlerts: any =
  (token, formData, successCallback) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await usageAlertsAPI({ token, formData });

      if (res?.status) {
        dispatch(setUsageAlerts(res?.body));
        if (successCallback) {
          successCallback();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Something went wrong!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const paymentWithoutSavingDetails: any =
  (token, formData, isPost = false, successCallBack) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await paymentWithoutSavingDetailsAPI({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack();
        }

        toast.success(res?.message ? res?.message : "Payment SuccessFull!");
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        if (isPost) {
          toast.error(res?.message ?? "Something went wrong!");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const getPaymentProcessorDetails: any =
  (token, formData, isPost = false, successCallBack, setContextLoading) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await getPaymentProcessorDetailsAPI({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack();
        }

        dispatch(setPaymentProcessorDetails(res?.body));
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        if (isPost) {
          toast.error(res?.message ?? "Something went wrong!");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const saveDefaultPaymentMethod: any =
  (token, formData, isPost = false, successCallBack) =>
  async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await saveDefaultPaymentMethodAPI({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack();
        }

        toast.success(
          res?.message ? res?.message : "Payment Saved SuccessFully!"
        );
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        if (isPost) {
          toast.error(res?.message ?? "Something went wrong!");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const getConvenienceFee: any =
  (token, formData, successCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await getConvenienceFeeAPI({ token, formData });

      if (res?.status) {
        dispatch(setConvenienceFee(res?.body));

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }

        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const schedulePayment: any =
  (token, formData, successCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));

    try {
      const res = await schedulePaymentAPI({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack();
        }

        toast.success(
          res?.message ? res?.message : "Payment SuccessFully Scheduled!"
        );
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }

        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const guestPaymentRequest: any =
  (formData, alias, successCallBack, failureCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await guestPaymentRequestApi({ formData, alias });
      let dummyRes = {
        status: true,
        body: {
          customer: {
            id: 16406,
            company_id: 4,
            location_id: 0,
            user_id: 0,
            status: 1,
            acctnum: "0012",
            customer_name: "LINCOLN RECOVERY",
            address: "2955 EAST 1ST AVENUE, STE 200 ",
            city: "DENVER",
            state: 6,
            zipcode: "80206",
            house_num: null,
            phone: "",
            phone2: "",
            email: "accounting@sunshinebh.com",
            service_address: "19067 WEST FRONTAGE ROAD",
            map_lat: null,
            map_lng: null,
            balance: 2032.85,
            balance_date: "2025-04-25",
            projected_bill: 0,
            next_bill_date: null,
            invite_date: null,
            invite_code: "",
            adderss2: null,
            zip: null,
            customer_vat_number: null,
            registration_value: null,
            block_payments_cc: null,
            block_payments_eft: null,
            customer_name2: null,
            pin: "5186",
            display_account_number: null,
            usage_calc_last: "2025-04-17 00:00:00",
            customer_type: "",
            ic_email: "",
            ic_password: "",
            paperless: 0,
            paperless_reported: null,
            email_blast: null,
            default_card_id_for_auto_payment: null,
            payment_method_for_auto_payment: null,
            fixed_payment_amount_for_auto_payment: null,
            day_for_auto_payment: null,
            autopay: 0,
            email_updated_date: null,
            customer_status: "A",
            special_handling_code: "R",
            country_code: null,
            phone_no: null,
            is_phone_verified: 0,
            otp: 0,
            phone_no_updated_at: null,
            notification_new_bill: 1,
            notification_payment: 1,
            notification_reminder: 4,
            notification_biller: 0,
            is_phone_block: 0,
            country_code_phone_no: "0",
            payment_method: null,
            total_unread_notification: 25,
            is_payment_schedule: 0,
            payment_schedule_date: null,
            text_preference: 0,
            country_id: 0,
            ivr_callfrom_phone: null,
            is_conveyed: 0,
            secondary_recipient_email: "",
            is_recurring_payment: 0,
            is_payments_blocked: 0,
            recurring_ack_date: null,
            is_voice_optout: 0,
            updated_email: null,
            last_bill_amount: 2032.85,
            billing_id: 71574,
          },
        },
        message: "Data Found",
      };
      if (dummyRes.status) {
        dispatch(setOneTimePaymentInfo(dummyRes?.body));

        if (successCallBack) {
          successCallBack(dummyRes?.body?.customer);
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }

        toast.error(res?.message ?? "Something went wrong!");
        if (failureCallBack) {
          failureCallBack();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
      if (failureCallBack) {
        failureCallBack();
      }
    } finally {
      dispatch(setAccountLoading(false));
    }
  };

export const saveAcknowledgeForRecurringPayment: any =
  (token, formData, successCallBack) => async (dispatch) => {
    dispatch(setAccountLoading(true));
    try {
      const res = await saveAcknowledgeForRecurringPaymentApi({
        token,
        formData,
      });

      if (res.status) {
        toast.success(
          res?.message ? res?.message : " Acknowledgement Saved !!"
        );

        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!");
    } finally {
      dispatch(setAccountLoading(false));
    }
  };
