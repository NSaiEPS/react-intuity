import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";

export interface CustomerServiceTabs {
  service: boolean;      // Contact Us
  account: boolean;      // Update Info
  stopService: boolean;  // Change Service
  usageHistory: boolean; // Usage History
}

export function getCustomerServiceTabsFromCustomer(data: any): CustomerServiceTabs {
  if (!data) {
    return {
      service: true,
      account: true,
      stopService: true,
      usageHistory: true,
    };
  }

  const isAllowed = (val: any) => {
    if (val === undefined || val === null) return true;
    if (val === 0 || val === "0" || val === false || val === "false") return false;
    return true;
  };

  return {
    service: isAllowed(data.contact_customer_service),
    account: isAllowed(data.update_account_information),
    stopService: isAllowed(data.stop_transfer_service),
    usageHistory: isAllowed(data.usage_history),
  };
}

export interface SideNavState {
  loading: boolean;
  customerServiceTabs: CustomerServiceTabs;
}

const initialState: SideNavState = {
  loading: false,
  customerServiceTabs: {
    service: true,
    account: true,
    stopService: true,
    usageHistory: true,
  },
};

const sideNavSlice = createSlice({
  name: "sideNav",
  initialState,
  reducers: {
    setSideNavLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCustomerServiceTabs: (state, action: PayloadAction<Partial<CustomerServiceTabs>>) => {
      state.customerServiceTabs = {
        ...state.customerServiceTabs,
        ...action.payload,
      };
    },
  },
});

export const { setSideNavLoading, setCustomerServiceTabs } = sideNavSlice.actions;

export const fetchSideNavPermissions = () => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(setSideNavLoading(true));
  try {
    // Simulated API call returning tab permissions.
    // In production, replace this promise with real API service call.
    const res = await new Promise<{
      status: boolean;
      data: Partial<CustomerServiceTabs>;
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          status: true,
          data: {
            service: true,
            account: true,
            stopService: true,
            usageHistory: true,
          },
        });
      }, 50);
    });

    if (res?.status && res?.data) {
      dispatch(setCustomerServiceTabs(res.data));
    }
  } catch (err) {
    console.error("Failed to fetch SideNav permissions", err);
  } finally {
    dispatch(setSideNavLoading(false));
  }
};

export default sideNavSlice.reducer;
