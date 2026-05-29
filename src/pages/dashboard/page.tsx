import * as React from 'react';
import { RootState } from '@/state/store';
import { getLocalStorage } from '@/utils/auth';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from 'react-redux';

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

// Pulse skeleton — used for every lazy card AND the chart placeholder
const CardSkeleton = () => (
  <Box sx={{ height: '100%', minHeight: 120, borderRadius: 2, backgroundColor: '#f0f4f8',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } }
  }} />
);

// Chart placeholder — same height as real chart, painted immediately at FCP
// Speed Index improves because the viewport is "filled" even before the chart loads
const ChartSkeleton = () => (
  <Box sx={{ width: '100%', minHeight: 300, borderRadius: 2, backgroundColor: '#f0f4f8', flexGrow: 1,
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } }
  }} />
);

export default function DashBoardPage(): React.JSX.Element {
  const theme = useTheme();
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'));
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

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
          <React.Suspense fallback={<CardSkeleton />}>
            <DashboardInfo sx={{ height: '100%' }} type="autoPay" typeofUser="customer" value="autopay" isActive />
          </React.Suspense>
        </Grid>
      )}

      {!isLargeUp && allow_auto_payment === 1 && (
        <Grid item xs={12} sm={6} md={6}>
          <React.Suspense fallback={<CardSkeleton />}>
            <DashboardInfo sx={{ height: '100%' }} value="paperless" typeofUser="customer" type="paperLess" />
          </React.Suspense>
        </Grid>
      )}

      {/* ✅ Sales chart — heaviest component, lazy */}
      <Grid item xs={12} lg={9} order={{ xs: 3, lg: 1 }}>
        <Box display="flex" flexDirection="column" height="100%">
          {(isLargeUp || allow_auto_payment == 1) && (
            <React.Suspense fallback={<CardSkeleton />}>
              <ScheduleRecurringBox />
            </React.Suspense>
          )}
          {/* ChartSkeleton shows at FCP — viewport is fully "painted" immediately → better Speed Index */}
          <React.Suspense fallback={<ChartSkeleton />}>
            <Sales
              chartSeries={[
                { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
                { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
              ]}
              sx={{ flexGrow: 1 }}
              dashboard
            /></React.Suspense>
        </Box>
      </Grid>

      {/* ✅ Right column — lazy */}
      <Grid item xs={12} lg={3} order={{ xs: 2, lg: 2 }}>
        <Grid container spacing={2} height="-webkit-fill-available">
          {!isLargeUp && allow_auto_payment !== 1 && (
            <Grid item xs={12} sm={6} md={6}>
              <React.Suspense fallback={<CardSkeleton />}>
                <DashboardInfo sx={{ height: '100%' }} value="paperless" typeofUser="customer" type="paperLess" />
              </React.Suspense>
            </Grid>
          )}
          {isLargeUp && (
            <Grid item xs={12}>
              <React.Suspense fallback={<CardSkeleton />}>
                <DashboardInfo sx={{ height: '100%' }} value="paperless" typeofUser="customer" type="paperLess" />
              </React.Suspense>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={6} lg={12}>
            <React.Suspense fallback={<CardSkeleton />}>
              <DashboardInfo sx={{ height: '100%' }} typeofUser="customer" value="notification_reminder" type="notification" apiCall />
            </React.Suspense>
          </Grid>
          <Grid item xs={12} sm={!schedule_payment_msg && !recurring_payment_msg1 && !allow_auto_payment ? 12 : 6} md={!schedule_payment_msg && !recurring_payment_msg1 && !allow_auto_payment ? 12 : 6} lg={12}>
            <TotalProfit value="CustomerService" sx={{ height: '100%' }} />
          </Grid>
          {!isLargeUp && allow_auto_payment !== 1 && (
            <Grid item xs={12} sm={6} md={6} lg={12}>
              <React.Suspense fallback={<CardSkeleton />}>
                <ScheduleRecurringBox isSmallScreen={true} />
              </React.Suspense>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}