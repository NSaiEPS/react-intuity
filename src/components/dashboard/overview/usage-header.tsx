'use client';

import React, { useEffect } from 'react';
import { getUsageAlerts } from '@/state/features/accountSlice';
import { RootState } from '@/state/store';
import { getLocalStorage } from '@/utils/auth';
import { Box, CardHeader, Chip, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

function UsageHeader() {
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

  const CustomerInfo: any = dashBoardInfo?.customer ? dashBoardInfo?.customer : getLocalStorage('intuity-customerInfo');

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  // const raw = getLocalStorage('intuity-user');
  const raw = userInfo?.body ? userInfo : getLocalStorage('intuity-user');

  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;

  const { accountLoading, usageAlerts } = useSelector((state: RootState) => state?.Account);
  console.log(usageAlerts, 'usageAlerts');
  const dispatch = useDispatch();
  useEffect(() => {
    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    //     acl_role_id:4
    // customer_id:810
    // formData.append('is_form', '0');

    dispatch(getUsageAlerts(token, formData));
  }, [userInfo]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Grid container spacing={2} direction="column">
      {/* Row 1: Usage History & Alerts */}
      <Grid item>
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems={isMobile ? 'flex-start' : 'center'}
        >
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
            Usage History
          </Typography>

          <Box display="flex" alignItems="center" mt={0.5} mr={'auto'} ml={!isMobile ? 2 : 0}>
            <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight={500}>
              Usage Alerts
            </Typography>
            <Chip
              label={usageAlerts?.total_alerts}
              size="small"
              sx={{
                ml: 1,
                height: 20,
                minWidth: 20,
                fontSize: '0.75rem',
                color: 'white',
                backgroundColor: '#d32f2f',
              }}
            />
          </Box>
        </Box>
      </Grid>

      {/* Row 2: Account Info */}
      <Grid item>
        <Box
          display="flex"
          flexDirection={'column'}
          justifyContent={isMobile ? 'flex-start' : 'flex-end'}
          alignItems={isMobile ? 'flex-start' : 'flex-end'}
          gap={0}
          mt={isMobile ? 0 : -5}
        >
          <Typography variant={isMobile ? 'body1' : 'h6'}>Account No: {CustomerInfo?.acctnum}</Typography>
          <Typography variant={isMobile ? 'body2' : 'subtitle1'}>Name: {CustomerInfo?.customer_name}</Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default UsageHeader;
