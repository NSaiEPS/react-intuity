import { Navigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getLocalStorage } from "@/utils/auth";
import { CircularProgress, Grid } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
}

const ProtectedRoute = ({ children, title }: ProtectedRouteProps) => {
  const user = getLocalStorage("intuity-user");
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Helmet key={location.pathname}>
        <title>{title ? `${title} - Intuity` : "Intuity"}</title>
      </Helmet>

      {children}
    </>
  );
};

export default ProtectedRoute;
export const Authorization = ({ children, title }) => {
  if (getLocalStorage("intuity-user")) {
    return <Navigate to="/" replace />;
  }
  // If user is not logged in, return the element passed to Authorization
  return (
    <>
      {/* <Helmet key={location.pathname}>
        <title>{title ? `${title} - Intuity` : "Intuity"}</title>
      </Helmet> */}
      {children}
    </>
  );
};
// getLocalStorage("intuity-user") ? <Navigate to="/" /> : element;

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
