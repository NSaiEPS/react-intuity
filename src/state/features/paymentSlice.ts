import { getLastBillInfoAPI } from '@/api/dashboard';
import { navigateTo } from '@/utils/navigation';
import { createSlice } from '@reduxjs/toolkit';
import { toast } from '@/lib/custom-toast';
import { AppDispatch } from '../store';
import { AxiosError } from 'axios';
import type { ApiResponse, LastBillBody, SetLoadingFn } from '@/types/domain';

type LastBillInfo = LastBillBody;

interface DashBoardState {
  lastBillInfo: LastBillInfo | null;
  paymentLoader: boolean;
}

const initialState: DashBoardState = {
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

export const getLastBillInfo = (
  formData: FormData,
  setContextLoading?: SetLoadingFn,
  isPost = false,
  successCallBack?: (data: LastBillInfo) => void
) => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setPaymentLoader(true));
  try {
    const res: ApiResponse<LastBillInfo> = await getLastBillInfoAPI({ formData });
    if (res?.status) {
      if (successCallBack) successCallBack(res?.body);
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
    toast.error(error.response?.data?.message ?? 'Error! Try again.');
  } finally {
    dispatch(setPaymentLoader(false));
    if (setContextLoading) setContextLoading(false);
  }
};
