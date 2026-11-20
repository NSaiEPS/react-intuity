import secureLocalStorage from "react-secure-storage";

export const setLocalStorage = (key: string, value: unknown) => {
  secureLocalStorage.setItem(key, value as Parameters<typeof secureLocalStorage.setItem>[1]);
};

export const getLocalStorage = (key: string) => {
  return secureLocalStorage.getItem(key);
};

export const removeLocalStorage = (key: string) => {
  secureLocalStorage.removeItem(key);
};

export const clearLocalStorage = () => {
  removeLocalStorage("custom-auth-token");
  removeLocalStorage("intuity-user");
  removeLocalStorage("intuity-is-logged-in");

  removeLocalStorage("intuity-meterDetails");
  removeLocalStorage("linked-customerInfo");
  removeLocalStorage("intuity-companyId");
  removeLocalStorage("intuity-company");
  removeLocalStorage("intuity-customerInfo");
  removeLocalStorage("is_skipped");
};

export const updateLocalStorageValue = (
  storageKey: string,
  targetKey: string,
  newValue: unknown
) => {
  try {
    const storedData = secureLocalStorage.getItem(storageKey);
    if (!storedData || typeof storedData !== "object") {
      console.warn(
        `No valid object found in secure storage for key: ${storageKey}`
      );
      return;
    }

    const updatedData = {
      ...storedData,
      [targetKey]: newValue,
    };

    secureLocalStorage.setItem(storageKey, updatedData);
  } catch (error) {
    console.error("Error updating secure storage:", error);
  }
};

export type IntuityUser = {
  status?: boolean;
  message?: string;
  body?: {
    id?: number | string;
    acl_role_id?: string;
    customer_id?: string;
    company_id?: string | number;
    company_name?: string;
    alias?: string;
    email?: string;
    customer_name?: string;
    acctnum?: string;
    is_verified?: number;
    is_two_fa_required?: boolean;
    number_of_days_for_confirmation?: number;
    csrf_token?: string;
    auth?: {
      authenticated?: boolean;
      method?: string;
      issued_at?: string;
      expires_at?: string;
      expires_in?: number;
      two_fa_required?: boolean;
      two_fa_completed?: boolean;
      must_complete_two_fa?: boolean;
      must_confirm_information?: boolean;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};
