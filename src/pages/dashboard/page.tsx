import * as React from 'react';
import { RootState } from '@/state/store';
import { getLocalStorage, IntuityUser } from '@/utils/auth';
import { Box, Card, CardContent, Skeleton, Stack, useMediaQuery, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from 'react-redux';
import { useDispatch } from '@/hooks/redux';
import { getDashboardInfo } from '@/state/features/dashBoardSlice';

// ✅ eager — above fold, user sees these first
import { Budget } from '@/components/dashboard/overview/budget';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';

// ✅ lazy — below fold or heavy
const Sales = React.lazy(() =>
  import('@/components/dashboard/overview/sales').then((m) => ({ default: m.Sales }))
);
const DashboardInfo = React.lazy(() =>
  import('@/components/dashboard/overview/dashboard-info').then((m) => ({ default: m.DashboardInfo }))
);
const ScheduleRecurringBox = React.lazy(() =>
  import('@/components/dashboard/overview/schedule-recurring-box').then((m) => ({ default: m.ScheduleRecurringBox }))
);

const cardBase = {
  borderRadius: 2,
  backgroundColor: '#fff',
  border: '1px solid #EAEAEA',
  boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
};

// Skeleton for Budget card (Balance Due + PAY NOW)
const BudgetSkeleton = () => (
  <Card elevation={0} sx={{ ...cardBase, height: '100%' }}>
    <CardContent>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={1} flex={1}>
            <Skeleton variant="text" width="55%" height={28} />
            <Skeleton variant="text" width="40%" height={40} />
          </Stack>
          <Skeleton variant="circular" width={56} height={56} />
        </Stack>
        <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
      </Stack>
    </CardContent>
  </Card>
);

// Skeleton for BillDue card
const BillDueSkeleton = () => (
  <Card elevation={0} sx={{ ...cardBase, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <CardContent sx={{ width: '100%' }}>
      <Stack spacing={2} alignItems="center" justifyContent="center">
        <Skeleton variant="text" width={140} height={32} />
        <Skeleton variant="text" width={120} height={52} />
      </Stack>
    </CardContent>
  </Card>
);

// Skeleton for DashboardInfo toggle cards (paperless / autopay / notification)
const InfoCardSkeleton = () => (
  <Card elevation={0} sx={{ ...cardBase, height: '100%' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack spacing={1} flex={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="80%" height={18} />
        </Stack>
        <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 2 }} />
      </Stack>
    </CardContent>
  </Card>
);

// Skeleton for CustomerService card
const CustomerServiceSkeleton = () => (
  <Card elevation={0} sx={{ ...cardBase, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <CardContent sx={{ width: '100%' }}>
      <Stack spacing={2} alignItems="center">
        <Skeleton variant="text" width={140} height={28} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
        </Stack>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Stack>
    </CardContent>
  </Card>
);

// Skeleton for ScheduleRecurring box
const ScheduleSkeleton = () => (
  <Card elevation={0} sx={{ ...cardBase, mb: 2 }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={1} flex={1}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" height={18} />
        </Stack>
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </Stack>
    </CardContent>
  </Card>
);

// Skeleton for Sales chart
const ChartSkeleton = () => (
  <Box sx={{ width: '100%', minHeight: 300, borderRadius: 2, backgroundColor: '#f0f4f8', flexGrow: 1,
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } }
  }} />
);

// Full dashboard skeleton that matches the real layout exactly
const DashboardSkeleton = () => {
  const theme = useTheme();
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Grid container spacing={2} sx={{ maxWidth: '1600px' }}>
      {/* Row 1 — top two cards */}
      <Grid item xs={12} lg={9}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <BudgetSkeleton />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BillDueSkeleton />
          </Grid>
        </Grid>
      </Grid>

      {/* Autopay card placeholder (lg=3) */}
      <Grid item xs={12} sm={6} md={6} lg={3}>
        <InfoCardSkeleton />
      </Grid>

      {/* Chart area */}
      <Grid item xs={12} lg={9} order={{ xs: 3, lg: 1 }}>
        <Box display="flex" flexDirection="column" height="100%">
          {isLargeUp && <ScheduleSkeleton />}
          <ChartSkeleton />
        </Box>
      </Grid>

      {/* Right column */}
      <Grid item xs={12} lg={3} order={{ xs: 2, lg: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={12}>
            <InfoCardSkeleton />
          </Grid>
          <Grid item xs={12} sm={6} lg={12}>
            <InfoCardSkeleton />
          </Grid>
          <Grid item xs={12} sm={6} lg={12}>
            <CustomerServiceSkeleton />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default function DashBoardPage(): React.JSX.Element {
  const theme = useTheme();
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'));
  const dispatch = useDispatch();
  const { dashBoardInfo, dashboardLoading } = useSelector((state: RootState) => state?.DashBoard);

  // Fetch dashboard data once — owned here so Budget never needs to call it
  React.useEffect(() => {
    const raw = getLocalStorage('intuity-user');
    const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;
    dispatch(getDashboardInfo(stored?.body?.acl_role_id, stored?.body?.customer_id));
  }, []);

  // Start downloading lazy chunks immediately after first paint
  React.useEffect(() => {
    const t = requestAnimationFrame(() => {
      import('@/components/dashboard/overview/sales');
      import('@/components/dashboard/overview/dashboard-info');
      import('@/components/dashboard/overview/schedule-recurring-box');
    });
    return () => cancelAnimationFrame(t);
  }, []);

  interface CompanyDetails { allow_auto_payment?: number | string; }
  const companyDetails: CompanyDetails = getLocalStorage('intuity-company') as CompanyDetails | null;
  const { allow_auto_payment } = dashBoardInfo?.body?.company || companyDetails || {};
  const { recurring_payment_msg1, schedule_payment_msg } = dashBoardInfo?.body || {};

  // Only show the full-page skeleton on first load (before any data has arrived).
  // dashboardLoading also flips for getUsageGraph, getNotificationList, etc. —
  // gating on that alone causes those components to unmount/remount infinitely.
  const hasData = !!dashBoardInfo?.body;
  if (!hasData) {
    return <DashboardSkeleton />;
  }

  return (
    <Grid container spacing={2} sx={{ maxWidth: '1600px' }}>

      {/* ✅ First Row — eager, above fold, loads instantly */}
      <Grid item xs={12} lg={allow_auto_payment === 1 ? 9 : 12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Budget diff={12} trend="up" sx={{ height: '100%' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TotalProfit value="BillDue" sx={{ height: '100%' }} />
          </Grid>
        </Grid>
      </Grid>

      {/* ✅ lazy — not visible until scroll on mobile */}
      {allow_auto_payment === 1 && (
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <React.Suspense fallback={<InfoCardSkeleton />}>
            <DashboardInfo sx={{ height: '100%' }} type="autoPay" typeofUser="customer" value="autopay" isActive />
          </React.Suspense>
        </Grid>
      )}

      {!isLargeUp && allow_auto_payment === 1 && (
        <Grid item xs={12} sm={6} md={6}>
          <React.Suspense fallback={<InfoCardSkeleton />}>
            <DashboardInfo sx={{ height: '100%' }} value="paperless" typeofUser="customer" type="paperLess" />
          </React.Suspense>
        </Grid>
      )}

      {/* ✅ Sales chart — heaviest component, lazy */}
      <Grid item xs={12} lg={9} order={{ xs: 3, lg: 1 }}>
        <Box display="flex" flexDirection="column" height="100%">
          {(isLargeUp || allow_auto_payment == 1) && (
            <React.Suspense fallback={<ScheduleSkeleton />}>
              <ScheduleRecurringBox />
            </React.Suspense>
          )}
          <React.Suspense fallback={<ChartSkeleton />}>
            <Sales
              chartSeries={[
                { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
                { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
              ]}
              sx={{ flexGrow: 1 }}
              dashboard
            />
          </React.Suspense>
        </Box>
      </Grid>

      {/* ✅ Right column — lazy */}
      <Grid item xs={12} lg={3} order={{ xs: 2, lg: 2 }}>
        <Grid container spacing={2} height="-webkit-fill-available">
          {!isLargeUp && allow_auto_payment !== 1 && (
            <Grid item xs={12} sm={6} md={6}>
              <React.Suspense fallback={<InfoCardSkeleton />}>
                <DashboardInfo sx={{ height: '100%' }} value="paperless" typeofUser="customer" type="paperLess" />
              </React.Suspense>
            </Grid>
          )}
          {isLargeUp && (
            <Grid item xs={12}>
              <React.Suspense fallback={<InfoCardSkeleton />}>
                <DashboardInfo sx={{ height: '100%' }} value="paperless" typeofUser="customer" type="paperLess" />
              </React.Suspense>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={6} lg={12}>
            <React.Suspense fallback={<InfoCardSkeleton />}>
              <DashboardInfo sx={{ height: '100%' }} typeofUser="customer" value="notification_reminder" type="notification" apiCall />
            </React.Suspense>
          </Grid>
          <Grid item xs={12} sm={!schedule_payment_msg && !recurring_payment_msg1 && !allow_auto_payment ? 12 : 6} md={!schedule_payment_msg && !recurring_payment_msg1 && !allow_auto_payment ? 12 : 6} lg={12}>
            <TotalProfit value="CustomerService" sx={{ height: '100%' }} />
          </Grid>
          {!isLargeUp && allow_auto_payment !== 1 && (
            <Grid item xs={12} sm={6} md={6} lg={12}>
              <React.Suspense fallback={<ScheduleSkeleton />}>
                <ScheduleRecurringBox isSmallScreen={true} />
              </React.Suspense>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
