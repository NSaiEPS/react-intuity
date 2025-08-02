'use client';

import React, { useEffect, useState } from 'react';
import { updateAccountInfo } from '@/state/features/accountSlice';
import { RootState } from '@/state/store';
import { colors } from '@/utils';
import { getLocalStorage } from '@/utils/auth';
import {
  Box,
  Button,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { Question } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

function NotificationsSettings() {
  // const CustomerInfo: any = getLocalStorage('intuity-customerInfo');
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

  const CustomerInfo: any = dashBoardInfo?.customer ? dashBoardInfo?.customer : getLocalStorage('intuity-customerInfo');
  const TextToValueFormat = {
    Text: '2',
    Email: '1',
    Both: '3',
    None: '4',
  };
  const billerTextToValueFormat = {
    Text: '1',
    Email: '0',
    Both: '2',
    None: '3',
  };
  const [preferences, setPreferences] = useState({
    new_bill: '1',
    payment_confirmation: '1',
    reminders: '1',
    biller_announcements: '1',
  });

  const handleChange = (field: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const raw = getLocalStorage('intuity-user');
  const dispatch = useDispatch();

  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;
  const handleSave = () => {
    // Add save logic here (e.g., API call)
    console.log('Saved preferences:', preferences);

    const formData = new FormData();

    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);
    formData.append('id', userId);
    formData.append('model_open', '3');
    formData.append('notification_new_bill', preferences.new_bill);
    formData.append('notification_payment', preferences.payment_confirmation);
    formData.append('notification_reminder', preferences.reminders);
    formData.append('notification_biller', preferences.biller_announcements);

    dispatch(updateAccountInfo(token, formData, true, getPrefDetails));
  };

  useEffect(() => {
    getPrefDetails();
  }, []);
  const getPrefDetails = () => {
    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);
    formData.append('id', userId);
    formData.append('model_open', '15');

    dispatch(updateAccountInfo(token, formData, true, successCallBack, true));
  };
  const successCallBack = (res) => {
    // console.log(res, 'successCallBack');
    setPreferences({
      new_bill: TextToValueFormat[res?.new_bill?.selected] || '1',
      payment_confirmation: TextToValueFormat[res?.payment_confirmation?.selected] || '1',
      reminders: TextToValueFormat[res?.reminders?.selected] || '1',
      biller_announcements: billerTextToValueFormat[res?.biller_announcements?.selected] || '1',
    });
  };

  return (
    <Box sx={{ pt: 0 }}>
      <Grid container spacing={2} justifyContent="space-between">
        <CardHeader
          title={
            <Typography ml={1} variant="h5">
              Notification Settings
            </Typography>
          }
        />

        <CardHeader
          subheader={<Typography variant="h6">Names :{CustomerInfo?.customer_name}</Typography>}
          title={<Typography variant="h5">Account No :{CustomerInfo?.acctnum}</Typography>}
        />
      </Grid>

      <Divider />

      <Typography variant="h6" fontWeight="bold" mb={2} p={2}>
        Select your notification preference for each type of notice
      </Typography>

      <Grid container p={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography>New bill</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select value={preferences.new_bill} onChange={(e) => handleChange('new_bill', e.target.value)}>
              <MenuItem value="2">Text</MenuItem>
              <MenuItem value="1">Email</MenuItem>
              <MenuItem value="3">Both</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container alignItems="center" p={2} pt={0}>
        <Grid item xs={12} sm={6}>
          <Typography>Payment confirmation</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select
              value={preferences.payment_confirmation}
              onChange={(e) => handleChange('payment_confirmation', e.target.value)}
            >
              <MenuItem value="2">Text</MenuItem>
              <MenuItem value="1">Email</MenuItem>
              <MenuItem value="3">Both</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container p={2} alignItems="center" pt={0}>
        {/* <Grid item xs={12} sm={6}>
          <Typography>Due date reminder (5 days ahead)</Typography>
        </Grid> */}

        <Grid item xs={12} sm={6} display="flex" alignItems="center">
          <Typography>Due date reminder (5 days ahead)</Typography>
          <Tooltip
            title="Bill due reminders are sent 5 days prior to the due date. Scheduled and autopayment reminders are sent the day before they are scheduled."
            arrow
          >
            <IconButton edge="end">
              <Question size={20} color="#90caf9" weight="fill" />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select value={preferences.reminders} onChange={(e) => handleChange('reminders', e.target.value)}>
              <MenuItem value="2">Text</MenuItem>
              <MenuItem value="1">Email</MenuItem>
              <MenuItem value="3">Both</MenuItem>
              <MenuItem value="4">None</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container p={2} alignItems="center" pt={0}>
        <Grid item xs={12} sm={6} display="flex" alignItems="center">
          <Typography>Biller announcements</Typography>
          <Tooltip
            title="Biller announcements are typically service outages, emergency notices, conservation notices or general broadcast messages."
            placement="top"
            arrow
          >
            <IconButton edge="end">
              <Question size={20} color="#90caf9" weight="fill" />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select
              value={preferences.biller_announcements}
              onChange={(e) => handleChange('biller_announcements', e.target.value)}
            >
              <MenuItem value="1">Text</MenuItem>
              <MenuItem value="0">Email</MenuItem>
              <MenuItem value="2">Both</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box p={2} display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button
          color="inherit"
          variant="outlined"
          sx={{
            color: colors.blue,
            borderColor: colors.blue,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.blue,
            '&:hover': {
              backgroundColor: colors['blue.3'], // or any other hover color
            },
          }}
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}

export default NotificationsSettings;
