import React from 'react';
import { getLocalStorage } from '@/utils/auth';
import { Box, Paper, Skeleton, Stack } from '@mui/material';
import { Navigate, useLocation, useNavigate, useParams  } from 'react-router-dom';

import { usePreloadDashboardRoutes } from '@/hooks/usePreloadDashboardRoutes';
import { useDispatch } from '@/hooks/redux';
import { check2FAStatus } from '@/state/features/accountSlice';

// DashboardLayout is eager — it's the persistent shell (sidebar + topnav) every
// logged-in user sees immediately. Lazy-loading it only added a skeleton flash.
import DashboardLayout from '@/pages/dashboard/layout';

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
  const dispatch = useDispatch();
  const { company } = useParams();

  React.useEffect(() => {
    document.title = title || 'Intuity';
  }, [title, location.pathname]);

  React.useEffect(() => {
    if (!user) return;
    dispatch(check2FAStatus(company ?? 'intuityfe', navigate));
  }, []);

  if (!user) {
    return <Navigate to={aliasUser ? `/login-${aliasUser?.alias}` : `/login`} replace />;
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
  return null;
}


export const DashboardLayoutWithSuspense = () => {
  usePreloadDashboardRoutes();
  return <DashboardLayout />;
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
