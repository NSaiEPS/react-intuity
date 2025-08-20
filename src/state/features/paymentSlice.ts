import { getLastBillInfoAPI } from "@/api/dashboard";
import { clearLocalStorage } from "@/utils/auth";
import { createSlice } from "@reduxjs/toolkit";

import { toast } from "react-toastify";

interface DahBoardState {
  lastBillInfo: any;
  paymentLoader: boolean;
}

const initialState = {
  lastBillInfo: {},
  paymentLoader: false,
} as DahBoardState;

const paymentSlice = createSlice({
  name: "paymentSlice",
  initialState,
  reducers: {
    setLastBillInfo(state, action) {
      state.lastBillInfo = action.payload;
    },
    setPaymentLoader(state, action) {
      state.paymentLoader = action.payload;
    },
  },
});

export const { setLastBillInfo, setPaymentLoader } = paymentSlice.actions;

export default paymentSlice.reducer;

export const getLastBillInfo: any =
  (formData, token, setContextLoading, isPost = false, successCallBack) =>
  async (dispatch) => {
    dispatch(setPaymentLoader(true));

    try {
      const res = await getLastBillInfoAPI({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack();
        }
        if (!isPost) {
          dispatch(setLastBillInfo(res?.body));
        } else {
          toast.success(res?.message ?? "Successful!!");
        }
      } else {
        dispatch(setLastBillInfo({}));

        if (res?.message == "You are not authorised to use this api") {
          clearLocalStorage();
          location.reload();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error Try again!!");

      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setPaymentLoader(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };
