import { router } from "@/App";
import React, { createContext, useContext, useEffect, useState } from "react";

export const LoadingContext = createContext({ loading: false });
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = router.subscribe(() => {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  return (
    <LoadingContext.Provider value={{ loading }}>
      {children}
    </LoadingContext.Provider>
  );
};
