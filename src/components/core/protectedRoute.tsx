import React from 'react';
import { getLocalStorage } from '@/utils/auth';
import { Box, Paper, Skeleton, Stack } from '@mui/material';
import { Navigate, useLocation, useNavigate, useParams  } from 'react-router-dom';

import { usePreloadDashboardRoutes } from '@/hooks/usePreloadDashboardRoutes';
import { BASE_URL } from '@/api/axios';
import { toast } from 'react-toastify';

const DashboardLayout = React.lazy(() => import('@/pages/dashboard/layout'));

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
}

const ProtectedRoute = ({ children, title }: ProtectedRouteProps) => {
  const user = getLocalStorage('intuity-user');
  interface AliasUser {
  alias: string;
}
  const aliasUser: AliasUser | null = getLocalStorage('alias-details') as AliasUser | null;
  const location = useLocation();
  const navigate = useNavigate();

  const { company } = useParams();

const [checking2FA, setChecking2FA] = React.useState(true);

  // Set document title without react-helmet (removes 60KB from critical bundle)
  React.useEffect(() => {
    document.title = title || 'Intuity';
  }, [title, location.pathname]);

  React.useEffect(() => {
  const check2FAStatus = async () => {
    if (!user) {
      setChecking2FA(false);
      return;
    }

    try {
      const token = getLocalStorage('custom-auth-token');

      const res = await fetch(
        `${BASE_URL}index/check-two-fa-confirm-status`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const {
        two_fa_status,
        confirm_information_status,
      } = data?.body || {};

      if (
        two_fa_status === false ||
        confirm_information_status === false
      ) {
        toast.info("Please complete 2FA first.")
         navigate(`/${company}/confirm-information`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error('2FA check failed:', error);
    } finally {
      setChecking2FA(false);
    }
  };

  check2FAStatus();
}, []);

  if (!user) {
    return <Navigate to={aliasUser ? `/login-${aliasUser?.alias}` : `/login`} replace />;
  }

  if (checking2FA) {
  return <LoaderFallback />;
}



  return (
    <div style={{ marginTop: '17px' }}>
      {children}
    </div>
  );
};

export default ProtectedRoute;
export const Authorization = ({ children }) => {
  if (getLocalStorage('intuity-user')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function LoaderFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        margin: 'auto',
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          bgcolor: '#0B2545',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Skeleton
          animation="pulse"
          variant="rectangular"
          width="60%"
          height={40}
          sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
        />{' '}
        {/* Logo */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            animation="pulse"
            key={i}
            variant="rectangular"
            width="100%"
            height={36}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            height: 64,
            borderBottom: '1px solid #eee',
            px: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton animation="pulse" variant="text" width={120} height={30} /> {/* Page Title */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton animation="pulse" variant="circular" width={32} height={32} />
            <Skeleton animation="pulse" variant="circular" width={32} height={32} />
            <Skeleton animation="pulse" variant="circular" width={40} height={40} />
          </Stack>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3, display: 'flex', gap: 3 }}>
          {/* Left Card */}
          <Paper sx={{ flex: 2, p: 2 }}>
            <Skeleton animation="pulse" variant="rectangular" width={100} height={20} />
            <Skeleton animation="pulse" variant="text" width="60%" height={24} sx={{ mt: 1 }} />
            <Skeleton animation="pulse" variant="text" width="40%" height={20} sx={{ mt: 1 }} />

            <Skeleton animation="pulse" variant="rectangular" width="100%" height={1} sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between">
              <Skeleton animation="pulse" variant="text" width={120} height={20} />
              <Skeleton animation="pulse" variant="text" width={100} height={20} />
            </Stack>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
              <Skeleton animation="pulse" variant="text" width={120} height={20} />
              <Skeleton animation="pulse" variant="text" width={120} height={20} />
            </Stack>
          </Paper>

          {/* Right Card */}
          <Paper sx={{ flex: 1, p: 2 }}>
            <Skeleton animation="pulse" variant="text" width="70%" height={20} />
            <Skeleton animation="pulse" variant="text" width="50%" height={20} sx={{ mt: 1 }} />
            <Skeleton animation="pulse" variant="rectangular" width="40%" height={40} sx={{ mt: 2 }} />
            <Skeleton
              animation="pulse"
              variant="rectangular"
              width="100%"
              height={36}
              sx={{ mt: 3, borderRadius: 1 }}
            />
            <Skeleton animation="pulse" variant="text" width="50%" height={20} sx={{ mt: 2 }} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export const DashboardLayoutWithSuspense = () => {
  //preloading some important dashboard routes
  usePreloadDashboardRoutes();
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center',
        bgcolor: '#fff',
        p: 2,
      }}
    >
      {/* Logo Row */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
        <Skeleton animation="pulse" variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton animation="pulse" variant="text" width={100} height={30} />
      </Stack>

      {/* Login Box */}
      <Paper sx={{ width: 420, p: 0, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ bgcolor: '#e0e0e0', p: 2 }}>
          <Skeleton animation="pulse" variant="text" width={80} height={24} />
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Login ID Field */}
          <Skeleton animation="pulse" variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1, mb: 2 }} />

          {/* Password Field */}
          <Skeleton animation="pulse" variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1, mb: 3 }} />

          {/* Icon Buttons Row */}
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                animation="pulse"
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
            <Skeleton animation="pulse" variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
            <Skeleton animation="pulse" variant="text" width={140} height={20} />
          </Stack>

          {/* Register Link */}
          <Skeleton animation="pulse" variant="text" width="100%" height={20} />
        </Box>
      </Paper>
    </Box>
  );
};

export const LoginSuspense = (element: React.ReactNode) => {
  return <React.Suspense fallback={<LoginSkeleton />}>{<>{element}</>}</React.Suspense>;
};
