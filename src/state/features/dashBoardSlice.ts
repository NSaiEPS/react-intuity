import api from "@/api/axios";
import {
  accountDetailsAPI,
  getInvoiceDetailsAPI,
  homeApi,
  updateUserInfo,
  usageGraphAPI,
  usageMonthlyGraphAPI,
  usageUtilityFiltersAPI,
} from "@/api/dashboard";

import { navigateTo } from "@/utils/navigation";
import { createSlice } from "@reduxjs/toolkit";
import secureLocalStorage from "react-secure-storage";
import { toast } from "@/lib/custom-toast";
import type { AppDispatch } from "@/state/store";
import type {
  DashboardResponse,
  InvoiceDetailsBody,
  NotificationPreferencesBody,
  SetLoadingFn,
  UsageGraphBody,
} from "@/types/domain";
import { getCustomerServiceTabsFromCustomer, setCustomerServiceTabs } from "./sideNavSlice";

interface DashBoardState {
  dashBoardInfo: DashboardResponse & Record<string, any>;
  dashboardLoading: boolean;
  notificationLoading: boolean;
  dashboardError: string | null;
  notificationList: NotificationPreferencesBody | Record<string, any>;
  usageGraph: UsageGraphBody;
  invoiceDetails: InvoiceDetailsBody;
  monthlyUsageGraph: Record<string, any>;
  usageUtilityFilters: Record<string, any>;
  monthlyUsageUam: string;
  routeChecker: boolean;
}

const initialState: DashBoardState = {
  dashBoardInfo: {} as DashboardResponse & Record<string, any>,
  dashboardLoading: false,
  notificationLoading: false,
  dashboardError: null,
  notificationList: {},
  usageGraph: {},
  invoiceDetails: {},
  monthlyUsageGraph: {},
  usageUtilityFilters: {},
  monthlyUsageUam: "",
  routeChecker: false,
};

const DashBoardSlice = createSlice({
  name: "dashBoard",
  initialState,
  reducers: {
    setDashboardInfo(state, action) {
      state.dashBoardInfo = action.payload;
    },
    setDashboardLoader(state, action) {
      state.dashboardLoading = action.payload;
    },
    setNotificationList(state, action) {
      state.notificationList = action.payload;
    },
    setNotificationLoader(state, action) {
      state.notificationLoading = action.payload;
    },
    setusageGraph(state, action) {
      state.usageGraph = action.payload;
    },
    setInvoiceDetails(state, action) {
      state.invoiceDetails = action.payload;
    },
    setMonthlyUsageGraph(state, action) {
      state.monthlyUsageGraph = action.payload;
    },
    setUsageUtilityFilters(state, action) {
      state.usageUtilityFilters = action.payload;
    },
    setMonthlyUsageUam(state, action) {
      state.monthlyUsageUam = action.payload;
    },
    setRouteChecker(state, action) {
      state.routeChecker = action.payload;
    },
    resetStore() {
      return initialState;
    },
  },
});

export const {
  setDashboardInfo,
  setDashboardLoader,
  setNotificationList,
  setNotificationLoader,
  setusageGraph,
  setInvoiceDetails,
  setMonthlyUsageGraph,
  setUsageUtilityFilters,
  setMonthlyUsageUam,
  setRouteChecker,
  resetStore: resetDashboardStore,
} = DashBoardSlice.actions;

export default DashBoardSlice.reducer;

// ─── Thunks ───────────────────────────────────────────────────────────────────
// Token is no longer accepted as a parameter — the axios interceptor injects it.

export const getDashboardInfo = (
  role_id: string,
  user_id: string
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await homeApi({ role_id, user_id });
    if (res?.status) {
      secureLocalStorage.setItem("intuity-customerInfo", res?.body?.customer);
      secureLocalStorage.setItem("intuity-company", res?.body?.company);
      secureLocalStorage.setItem("linked-customerInfo", res?.body?.linked_customers);
      secureLocalStorage.setItem("intuity-meterDetails", res?.body?.meterDetails);
      dispatch(setDashboardInfo(res));
      const companyData = res?.body?.company ?? {};
      const customerData = res?.body?.customer ?? {};
      const mergedData = { ...companyData, ...customerData };
      dispatch(setCustomerServiceTabs(getCustomerServiceTabsFromCustomer(mergedData)));
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const getAccountInfo = (
  role_id: string,
  user_id: string
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await accountDetailsAPI({ role_id, user_id });
    if (res?.status) {
      // no-op: data stored externally by caller if needed
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

// Previously used localStorage.getItem("token") which was always empty.
// The axios interceptor now reads the correct token from secureLocalStorage.
export const setPaperLessSettings = (data: FormData) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await api.post("settings/front/paperless-setting", data);
    if (res.data?.success) {
      dispatch(setDashboardInfo(res?.data?.data?.data));
    } else {
      if (res?.data?.message !== "You are not authorised to use this api") {
        toast.error(res?.data?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const setAutoPaySettings = (data: FormData) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await api.post("settings/front/autopay-setting", data);
    if (res.data?.success) {
      dispatch(setDashboardInfo(res?.data?.data?.data));
    } else {
      if (res?.data?.message !== "You are not authorised to use this api") {
        toast.error(res?.data?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const getNotificationList = (
  formData: FormData,
  successCallBack?: () => void,
  setData = true,
  failureCallBack?: () => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setNotificationLoader(true));
  try {
    const res = await updateUserInfo({ formData });
    if (res?.status) {
      if (setData) dispatch(setNotificationList(res?.body));
      if (res?.body?.otp) toast.success(`Otp is ${res?.body?.otp}`);
      if (!setData) {
        if (res?.message?.includes("Otp is invalid")) {
          toast.error(res?.message);
        } else {
          toast.success(res?.message ?? "Notification Email changed successfully.");
        }
      }
      if (successCallBack) successCallBack();
    } else {
      if (failureCallBack) failureCallBack();
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
      navigateTo("/login", { replace: true }, res?.message);
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
    if (failureCallBack) failureCallBack();
  } finally {
    dispatch(setDashboardLoader(false));
    dispatch(setNotificationLoader(false));
  }
};

export const getUsageGraph = (formData: FormData) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setusageGraph({}));
  dispatch(setDashboardLoader(true));
  try {
    const res = await usageGraphAPI({ formData });
    if (res?.status) {
      dispatch(setusageGraph(res?.body));
    } else {
      dispatch(setusageGraph({}));
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    dispatch(setusageGraph({}));
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const getInvoiceDetails = (
  formData: FormData,
  setContextLoading?: SetLoadingFn
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await getInvoiceDetailsAPI({ formData });
    if (res?.status) {
      dispatch(setInvoiceDetails(res?.body));
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
    if (setContextLoading) setContextLoading(false);
  }
};

export const usageMonthlyGraph = (formData: FormData) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setMonthlyUsageGraph({}));
  dispatch(setDashboardLoader(true));
  try {
    const res = await usageMonthlyGraphAPI({ formData });
    if (res?.status) {
      dispatch(setMonthlyUsageGraph(res?.body?.data));
    } else {
      dispatch(setMonthlyUsageGraph({}));
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    dispatch(setMonthlyUsageGraph({}));
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const usageUtilityFilters = (
  formData: FormData,
  successCallBack?: (body: any) => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await usageUtilityFiltersAPI({ formData });
    if (res?.status) {
      dispatch(setUsageUtilityFilters(res?.body));
      if (successCallBack) successCallBack(res?.body);
    } else {
      navigateTo("/login", { replace: true }, res?.message);
      if (res?.message !== "You are not authorised to use this api") {
        toast.error(res?.message ?? "Something went wrong!");
      }
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");
  } finally {
    dispatch(setDashboardLoader(false));
  }
};
