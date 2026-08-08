import React, { useEffect } from "react";
import { getUsageAlerts } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { colors, CustomerInfo } from "@/utils";

function UsageHeader() {
  const location = useLocation();
  const isAlertsPage = location.pathname.includes("usage-alerts");
  const isHistoryPage = location.pathname.includes("usage-history");

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
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap" pt={1.5} pb={1.5}>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                cursor: "pointer",
                pb: 0.5,
                borderBottom: isHistoryPage ? `3px solid ${colors.blue}` : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
              onClick={() => navigate(paths.dashboard.usageHistory())}
            >
              <Typography
                sx={{
                  fontSize: isHistoryPage ? "24px" : "20px",
                  fontWeight: 500,
                  color: isHistoryPage ? "text.primary" : "text.secondary",
                  transition: "all 0.2s ease",
                }}
              >
                Usage History
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              sx={{
                cursor: "pointer",
                pb: 0.5,
                borderBottom: isAlertsPage ? `3px solid ${colors.blue}` : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
              onClick={() => navigate(paths.dashboard.usageAlerts())}
            >
              <Typography
                sx={{
                  fontSize: isAlertsPage ? "24px" : "20px",
                  fontWeight: 500,
                  color: isAlertsPage ? "text.primary" : "text.secondary",
                  transition: "all 0.2s ease",
                }}
              >
                Usage Alerts
              </Typography>
              <Chip
                label={usageAlerts?.total_alerts || 0}
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
        <Divider />
      </Grid>
    </Grid>
  );
}

export default UsageHeader;
