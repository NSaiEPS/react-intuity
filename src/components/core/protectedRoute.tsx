import { getLocalStorage } from "@/utils/auth";
import { CircularProgress, Grid } from "@mui/material";
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getLocalStorage("intuity-user");
  console.log("rendered");
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

export const Authorization = ({ element }) =>
  getLocalStorage("intuity-user") ? <Navigate to="/" /> : element;

export function LoaderFallback() {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: "100vh" }}
    >
      <CircularProgress />
    </Grid>
  );
}
