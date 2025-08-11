import { router } from "@/App"; // Make sure this is the same router instance from your app
import React, { createContext, useContext, useEffect, useState } from "react";

// Context for loading state
export const LoadingContext = createContext({
  contextLoading: true,
  setContextLoading: () => {},
});

// Hook to use loading context
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [contextLoading, setContextLoading] = useState(true);

  // useEffect(() => {
  //   // Subscribe to router navigation events
  //   const unsubscribe = router.subscribe(() => {
  //     // Start loading
  //     setContextLoading(true);

  //     // Stop loading after a delay (simulate transition)
  //     const timer = setTimeout(() => setContextLoading(false), 1000);

  //     // Cleanup timer when navigation changes or unmounts
  //     return () => clearTimeout(timer);
  //   });

  //   // Cleanup router subscription on unmount
  //   return unsubscribe;
  // }, []);

  return (
    <LoadingContext.Provider value={{ contextLoading, setContextLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
