import React, { useEffect } from "react";
import { getUsageAlerts } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  CardHeader,
  Chip,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { CustomerInfo } from "@/utils";

function UsageHeader() {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: CustomerInfo = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const stored: IntuityUser | null = React.useMemo(() => {
    const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  }, [userInfo]);

  const { accountLoading, usageAlerts } = useSelector(
    (state: RootState) => state?.Account
  );

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;

  const dispatch = useDispatch();
  useEffect(() => {
    if (!roleId || !userId) return;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    dispatch(getUsageAlerts(formData));
  }, [userId]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          justifyContent="space-between"
          alignItems={isMobile ? "flex-start" : "center"}
          px={2}
          py={1}
        >
          {/* Left: Title + Usage Alerts */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant={isMobile ? "h6" : "h5"}>
              Usage History
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(paths.dashboard.usageAlerts())}
            >
              <Typography variant={isMobile ? "body1" : "h6"} fontWeight={500}>
                Usage Alerts
              </Typography>
              <Chip
                label={usageAlerts?.total_alerts}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  minWidth: 20,
                  fontSize: "0.75rem",
                  color: "white",
                  backgroundColor: "#d32f2f",
                }}
              />
            </Box>
          </Box>

          {/* Right: Account No & Name */}
          <Box display="flex" flexDirection="column" mt={isMobile ? 1 : 0}>
            <Typography variant={isMobile ? "body1" : "h6"}>
              Account No: {CustomerInfo?.acctnum}
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"}>
              Name: {CustomerInfo?.customer_name}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default UsageHeader;
