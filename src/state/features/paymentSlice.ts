import { getLastBillInfoAPI } from '@/api/dashboard';
import { navigateTo } from '@/utils/navigation';
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { AppDispatch } from '../store';
import { AxiosError } from 'axios';
import { ReactNode } from 'react';


interface ApiResponse<T> {
  status: boolean;
  message?: string;
  body?: T;
}

interface LastBillInfo {
  billing_list: {};
  block_individual_customer_payment_text: string;
  payment_pending: ReactNode;
  recurring_payment_msg1: any;
  autopay_text: ReactNode;
  schedule_payment_text: string;
  pay_now_text: any;
  schedule_payment_msg: ReactNode;
  achworks_pay_now_text: any;
  nacha_pay_now_text: any;
  last_bill: any;
  customer_acknowledgement_text: any;
  get_recurring_payments: any;
  customer: any;
  text_autopay_billing: string;
  pending_payment: any;
  pending_payment_text: boolean;
  company: any;
  id?: string;
  amount?: number;
  dueDate?: string;
  // add more fields as needed
}

interface DashBoardState {
  lastBillInfo: LastBillInfo | null;
  paymentLoader: boolean;
}

type GetLastBillInfoThunk = (
  formData: FormData,
  token: string,
  setContextLoading?: (loading: boolean) => void,
  isPost?: boolean,
  successCallBack?: (data: LastBillInfo) => void
) => (dispatch: AppDispatch) => Promise<void>;

const initialState:DashBoardState = {
  lastBillInfo: {},
  paymentLoader: false,
} as DashBoardState;

const paymentSlice = createSlice({
  name: 'paymentSlice',
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

export const getLastBillInfo: GetLastBillInfoThunk =
  (formData, token, setContextLoading, isPost = false, successCallBack) =>
  async (dispatch) => {
    dispatch(setPaymentLoader(true));

    try {
      const res: ApiResponse<LastBillInfo> = await getLastBillInfoAPI({ token, formData });

      if (res?.status) {
        if (successCallBack) {
          successCallBack(res?.body);
        }
        if (!isPost) {
          dispatch(setLastBillInfo(res?.body));
        } else {
          toast.success(res?.message ?? 'Successful!!');
        }
      } else {
        dispatch(setLastBillInfo({}));

        navigateTo('/login', { replace: true }, res?.message);
        if (res?.message !== 'You are not authorised to use this api') {
          toast.error(res?.message ?? 'Something went wrong!');
        }
      }
    } catch (e: unknown) {
      const error = e as AxiosError<{ message?: string }>;

  toast.error(
    error.response?.data?.message ?? 'Error! Try again.'
  );

      // toast(e?.response?.data?.message);
      // message.error(e?.response?.data?.message);
    } finally {
      dispatch(setPaymentLoader(false));
      if (setContextLoading) {
        setContextLoading(false);
      }
    }
  };
