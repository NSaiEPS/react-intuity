import { Navigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getLocalStorage } from "@/utils/auth";
import { Skeleton } from "@mui/material";
import React from "react";
import { Box, Stack, Paper } from "@mui/material";

const DashboardLayout = React.lazy(() => import("@/pages/dashboard/layout"));

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
export const Authorization = ({ children }) => {
  if (getLocalStorage("intuity-user")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function LoaderFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        margin: "auto",
        // display: "flex",
        // alignItems: "center",
      }}
    >
      <Skeleton variant="rectangular" height={50} />
      <Skeleton variant="text" />
      <Skeleton variant="rectangular" height={500} style={{ marginTop: 16 }} />
    </div>
  );
}

export const DashboardLayoutSkeleton = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          bgcolor: "#0B2545",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Skeleton
          variant="rectangular"
          width="60%"
          height={40}
          sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
        />{" "}
        {/* Logo */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width="100%"
            height={36}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 1 }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            height: 64,
            borderBottom: "1px solid #eee",
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width={120} height={30} /> {/* Page Title */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3, display: "flex", gap: 3 }}>
          {/* Left Card */}
          <Paper sx={{ flex: 2, p: 2 }}>
            <Skeleton variant="rectangular" width={100} height={20} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />

            <Skeleton
              variant="rectangular"
              width="100%"
              height={1}
              sx={{ my: 2 }}
            />

            <Stack direction="row" justifyContent="space-between">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={100} height={20} />
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={120} height={20} />
            </Stack>
          </Paper>

          {/* Right Card */}
          <Paper sx={{ flex: 1, p: 2 }}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
            <Skeleton
              variant="rectangular"
              width="40%"
              height={40}
              sx={{ mt: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={36}
              sx={{ mt: 3, borderRadius: 1 }}
            />
            <Skeleton variant="text" width="50%" height={20} sx={{ mt: 2 }} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export const DashboardLayoutWithSuspense = () => {
  return (
    <React.Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardLayout />
    </React.Suspense>
  );
};

export const LoginSkeleton = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        justifyContent: "center",
        bgcolor: "#fff",
        p: 2,
      }}
    >
      {/* Logo Row */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
        <Skeleton
          variant="rectangular"
          width={40}
          height={40}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton variant="text" width={100} height={30} />
      </Stack>

      {/* Login Box */}
      <Paper sx={{ width: 420, p: 0, overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ bgcolor: "#e0e0e0", p: 2 }}>
          <Skeleton variant="text" width={80} height={24} />
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Login ID Field */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1, mb: 2 }}
          />

          {/* Password Field */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1, mb: 3 }}
          />

          {/* Icon Buttons Row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 3 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="24%"
                height={40}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>

          {/* Sign In and Forgot Password */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Skeleton
              variant="rectangular"
              width={100}
              height={40}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton variant="text" width={140} height={20} />
          </Stack>

          {/* Register Link */}
          <Skeleton variant="text" width="100%" height={20} />
        </Box>
      </Paper>
    </Box>
  );
};

export const LoginSuspense = (element: React.ReactNode) => {
  return (
    <React.Suspense fallback={<LoginSkeleton />}>
      {<>{element}</>}
    </React.Suspense>
  );
};
