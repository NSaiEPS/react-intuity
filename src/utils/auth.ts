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

// export const clearLocalStorage = () => {
//   secureLocalStorage.clear();
// };

export const clearLocalStorage = () => {
  removeLocalStorage("custom-auth-token");
  removeLocalStorage("intuity-user");
  removeLocalStorage("intuity-is-logged-in");

  removeLocalStorage("intuity-meterDetails");
  removeLocalStorage("linked-customerInfo");
  removeLocalStorage("intuity-companyId");
  removeLocalStorage("intuity-company");
  removeLocalStorage("intuity-customerInfo");
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
  body?: {
    acl_role_id?: string;
    customer_id?: string;
    token?: string;
    email?: string;
  };
};
