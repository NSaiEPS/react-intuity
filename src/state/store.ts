import { Action, configureStore } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";

import accountSlice from "./features/accountSlice";
import dashBoardSlice from "./features/dashBoardSlice";
import paymentSlice from "./features/paymentSlice";
import sideNavSlice from "./features/sideNavSlice";

export const store = configureStore({
  reducer: {
    DashBoard: dashBoardSlice,
    Account: accountSlice,
    Payment: paymentSlice,
    SideNav: sideNavSlice,
  },
  // middleware: [...getDefaultMiddleware(), thunk],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

