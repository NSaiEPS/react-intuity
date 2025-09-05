// import api from '@/app/api/axios';
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
import type { PayloadAction } from "@reduxjs/toolkit";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";

type Users = {};
interface DahBoardState {
  dashBoardInfo: any;
  dashboardLoader: boolean;
  notificationLoader: boolean;
  dashboardError: string | null;
  notificationList: any;
  usageGraph: any;
  invoiceDetails: any;
  monthlyUsageGraph: any;
  usageUtilityFilters: any;
  monthlyUsageUam: string;
}

const initialState = {
  dashBoardInfo: {},
  dashboardLoader: false,
  notificationLoader: false,
  dashboardError: null,
  notificationList: [],
  usageGraph: {},
  invoiceDetails: {},
  monthlyUsageGraph: {},
  usageUtilityFilters: {},
  monthlyUsageUam: "",
} as DahBoardState;

const DashBoardSlice = createSlice({
  name: "dashBoard",
  initialState,
  reducers: {
    setDashboardInfo(state, action) {
      state.dashBoardInfo = action.payload;
    },
    setDashboardLoader(state, action) {
      state.dashboardLoader = action.payload;
    },
    setNotificationList(state, action) {
      state.notificationList = action.payload;
    },
    setNotificationLoader(state, action) {
      state.notificationLoader = action.payload;
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
} = DashBoardSlice.actions;

export default DashBoardSlice.reducer;

export const getDashboardInfo: any =
  (role_id, user_id, token) => async (dispatch) => {
    dispatch(setDashboardLoader(true));

    try {
      const res = await homeApi({ role_id, user_id, token });

      if (res?.status) {
        // localStorage.setItem('intuity-customerInfo', JSON.stringify(res?.body?.customer));
        // localStorage.setItem('linked-customerInfo', JSON.stringify(res?.body?.linked_customers));

        secureLocalStorage.setItem("intuity-customerInfo", res?.body?.customer);
        secureLocalStorage.setItem("intuity-company", res?.body?.company);
        secureLocalStorage.setItem(
          "linked-customerInfo",
          res?.body?.linked_customers
        );

        secureLocalStorage.setItem(
          "intuity-meterDetails",
          res?.body?.meterDetails
        );

        dispatch(setDashboardInfo(res));
      } else {
        navigateTo("/login", { replace: true }, res?.message); // ✅ no reload
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");

      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setDashboardLoader(false));
    }
  };

export const getAccountInfo: any =
  (role_id, user_id, token) => async (dispatch) => {
    dispatch(setDashboardLoader(true));

    // formData.append('customer_id', '5968');

    // formData.append('question', 'What is this?');
    // formData.append('preferMethod', 'email');
    // formData.append('amthe', 'owner');
    // formData.append('acl_role_Id', '4');
    // formData.append('customer_id', '5968');
    // formData.append('is_form', '1');

    try {
      const res = await accountDetailsAPI({ role_id, user_id, token });

      if (res?.status) {
        //toast(res?.data?.message);
        // message.success(res?.data?.message);
        // dispatch(setDashboardInfo(res));
      } else {
        navigateTo("/login", { replace: true }, res?.message); // ✅ no reload
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");

      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setDashboardLoader(false));
    }
  };

export const setPaperLessSettings: any = (data) => async (dispatch) => {
  dispatch(setDashboardLoader(true));
  try {
    const res = await api.post("settings/front/paperless-setting", data, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.data?.success) {
      //toast(res?.data?.message);
      // message.success(res?.data?.message);
      dispatch(setDashboardInfo(res?.data?.data?.data));
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");

    // toast(e?.response?.data?.message);
    // message.error(e?.response?.data?.message);
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const setAutoPaySettings: any = (data) => async (dispatch) => {
  dispatch(setDashboardLoader(true));

  try {
    const res = await api.post("settings/front/autopay-setting", data, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.data?.success) {
      //toast(res?.data?.message);
      // message.success(res?.data?.message);
      dispatch(setDashboardInfo(res?.data?.data?.data));
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");

    // toast(e?.response?.data?.message);
    // message.error(e?.response?.data?.message);
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const getNotificationList: any =
  (token, formData, successCallBack, setData = true, failureCallBack) =>
  async (dispatch) => {
    // dispatch(setDashboardLoader(true));
    dispatch(setNotificationLoader(true));

    try {
      // const res = await getNotificationListApi({ role_id, user_id, token });
      const res = await updateUserInfo({ token, formData });

      if (res?.status) {
        if (setData) {
          dispatch(setNotificationList(res?.body));
        }
        if (res?.body?.otp) {
          toast.success(`Otp is ${res?.body?.otp}`);
        }
        if (!setData) {
          if (res?.message?.includes("Otp is invalid")) {
            toast.error(res?.message);
          } else {
            toast.success(
              res?.message ?? "Notification Email changed successfully."
            );
          }
        }
        if (successCallBack) {
          successCallBack();
        }
      } else {
        if (failureCallBack) {
          failureCallBack();
        }
        toast.error(res?.message ?? "some thing went wrong");

        navigateTo("/login", { replace: true }, res?.message); // ✅ no reload
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
      failureCallBack();

      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setDashboardLoader(false));
      dispatch(setNotificationLoader(false));
    }
  };

export const getUsageGraph: any = (formData, token) => async (dispatch) => {
  dispatch(setDashboardLoader(true));

  try {
    const res = await usageGraphAPI({ formData, token });

    if (res?.status) {
      dispatch(setusageGraph(res?.body));
    } else {
      navigateTo("/login", { replace: true }, res?.message); // ✅ no reload
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");

    // toast(e?.response?.data?.message);
    // message.error(e?.response?.data?.message);
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const getInvoiceDetails: any =
  (formData, token, setContextLoading) => async (dispatch) => {
    dispatch(setDashboardLoader(true));
    try {
      // const res: any = await api.post('/billing/front/invoice', data, {
      //   headers: {
      //     Authorization: token,
      //   },
      // });

      const res = await getInvoiceDetailsAPI({ token, formData });

      if (res?.status) {
        dispatch(setInvoiceDetails(res?.body));
      } else {
        navigateTo("/login", { replace: true }, res?.message); // ✅ no reload

        toast.error(res?.message ?? "Something went wrong!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");
    } finally {
      dispatch(setDashboardLoader(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };

export const usageMonthlyGraph: any = (formData, token) => async (dispatch) => {
  dispatch(setDashboardLoader(true));

  try {
    const res = await usageMonthlyGraphAPI({ formData, token });

    if (res?.status) {
      dispatch(setMonthlyUsageGraph(res?.body?.data));
    } else {
      navigateTo("/login", { replace: true }, res?.message); // ✅ no reload
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Error Try again!!");

    // toast(e?.response?.data?.message);
    // message.error(e?.response?.data?.message);
  } finally {
    dispatch(setDashboardLoader(false));
  }
};

export const usageUtilityFilters: any =
  (formData, token, successCallBack) => async (dispatch) => {
    dispatch(setDashboardLoader(true));

    try {
      const res = await usageUtilityFiltersAPI({ formData, token });

      if (res?.status) {
        dispatch(setUsageUtilityFilters(res?.body));
        successCallBack(res?.body);
      } else {
        navigateTo("/login", { replace: true }, res?.message); // ✅ no reload
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");

      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setDashboardLoader(false));
    }
  };
