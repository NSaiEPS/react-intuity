import React, { createContext, useContext, useState } from "react";

interface LoadingContextProps {
  contextLoading: boolean;
  setContextLoading: (loading: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextProps>({
  contextLoading: true,
  setContextLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contextLoading, setContextLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ contextLoading, setContextLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
