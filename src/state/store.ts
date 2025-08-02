import { Action, configureStore } from "@reduxjs/toolkit";
import thunk, { ThunkAction, ThunkMiddleware } from "redux-thunk";

import accountSlice from "./features/accountSlice";
import dashBoardSlice from "./features/dashBoardSlice";
import paymentSlice from "./features/paymentSlice";

export const store = configureStore({
  reducer: {
    DashBoard: dashBoardSlice,
    Account: accountSlice,
    Payment: paymentSlice,
  },
  // middleware: [...getDefaultMiddleware(), thunk],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
