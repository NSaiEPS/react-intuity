import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack,
} from "@mui/material";
import { boarderRadius } from "@/utils";

const cardSx = {
  borderRadius: boarderRadius.card,
  border: "1px solid #EAEAEA",
  boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
};

// ─── Shared building blocks ────────────────────────────────────────────────────

const SkelField = ({ label = true }) => (
  <Stack spacing={0.5}>
    {label && <Skeleton variant="text" width="35%" height={18} />}
    <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
  </Stack>
);

const SkelHeader = ({ width = 220 }: { width?: number }) => (
  <Box sx={{ px: 3, py: 2 }}>
    <Skeleton variant="text" width={width} height={28} />
  </Box>
);

// ─── Pay Now ──────────────────────────────────────────────────────────────────

export const PayNowSkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    <SkelHeader width={200} />
    <Divider />
    <CardContent>
      <Grid container spacing={4}>
        {/* Left: bill line items */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Skeleton variant="text" width="50%" height={28} />
            <Divider />
            {Array.from({ length: 4 }).map((_, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Skeleton variant="text" width="55%" height={22} />
                <Skeleton variant="text" width="20%" height={22} />
              </Stack>
            ))}
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Skeleton variant="text" width="35%" height={26} />
              <Skeleton variant="text" width="20%" height={26} />
            </Stack>
          </Stack>
        </Grid>
        {/* Right: payment summary */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Skeleton variant="text" width="60%" height={28} />
            <Stack spacing={1.5}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Stack key={i} direction="row" justifyContent="space-between">
                  <Skeleton variant="text" width="50%" height={22} />
                  <Skeleton variant="text" width="25%" height={22} />
                </Stack>
              ))}
            </Stack>
            <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1, mt: 1 }} />
          </Stack>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// ─── Prior Bills ──────────────────────────────────────────────────────────────

export const PriorBillsSkeleton = () => (
  <Stack spacing={3}>
    <Card elevation={0} sx={cardSx}>
      {/* Header row: title + year dropdown */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2 }}>
        <Skeleton variant="text" width={230} height={28} />
        <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: 1 }} />
      </Stack>
      <Divider />
      {/* Tabs */}
      <Stack direction="row" spacing={2} sx={{ px: 3, py: 1.5 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
      <Divider />
      {/* Table header */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 3, py: 1.5 }}>
        {["Transaction Type", "Date", "Status", "Amount", "Balance"].map((_, i) => (
          <Skeleton key={i} variant="text" width={80} height={20} />
        ))}
      </Stack>
      <Divider />
      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <React.Fragment key={i}>
          <Stack direction="row" justifyContent="space-between" sx={{ px: 3, py: 1.5 }}>
            {Array.from({ length: 5 }).map((__, j) => (
              <Skeleton key={j} variant="text" width={80} height={20} />
            ))}
          </Stack>
          <Divider />
        </React.Fragment>
      ))}
    </Card>
  </Stack>
);

// ─── Account ──────────────────────────────────────────────────────────────────

export const AccountSkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    {/* Header bar matching Header component */}
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      sx={{ px: 3, py: 2 }}
    >
      <Skeleton variant="text" width={280} height={32} />
      <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={0.5}>
        <Skeleton variant="text" width={140} height={18} />
        <Skeleton variant="text" width={180} height={18} />
      </Stack>
    </Stack>
    <Divider />

    <CardContent sx={{ p: 3 }}>
      <Card elevation={0} sx={cardSx}>
        <Box sx={{ px: 3, py: 2 }}>
          <Skeleton variant="text" width={160} height={26} />
        </Box>
        <Divider />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ pb: 1 }}>
                  <Skeleton
                    variant="circular"
                    width={48}
                    height={48}
                    sx={{ flexShrink: 0 }}
                  />
                  <Box flex={1}>
                    <Skeleton variant="text" width="35%" height={18} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="60%" height={22} />
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </CardContent>
  </Card>
);

// ─── Settings ─────────────────────────────────────────────────────────────────

export const SettingsSkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    <SkelHeader width={260} />
    <Divider />
    <CardContent>
      <Grid container spacing={3}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <SkelField />
          </Grid>
        ))}
      </Grid>
    </CardContent>
    <Divider />
    <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
      <Skeleton variant="rectangular" width={100} height={38} sx={{ borderRadius: 1 }} />
    </Box>
    <Divider />
    {/* Password section */}
    <SkelHeader width={180} />
    <Divider />
    <CardContent>
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <SkelField />
          </Grid>
        ))}
      </Grid>
    </CardContent>
    <Divider />
    <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
      <Skeleton variant="rectangular" width={100} height={38} sx={{ borderRadius: 1 }} />
    </Box>
  </Card>
);

// ─── Notification Settings ────────────────────────────────────────────────────

export const NotificationSettingsSkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    <SkelHeader width={200} />
    <Divider />
    <CardContent>
      <Stack spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.5} flex={1}>
              <Skeleton variant="text" width="40%" height={22} />
              <Skeleton variant="text" width="60%" height={18} />
            </Stack>
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

// ─── Stop / Transfer Service ──────────────────────────────────────────────────

export const StopServiceSkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    <SkelHeader width={220} />
    <Divider />
    <CardContent>
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <SkelField />
          </Grid>
        ))}
      </Grid>
    </CardContent>
    <Divider />
    <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
      <Skeleton variant="rectangular" width={120} height={38} sx={{ borderRadius: 1 }} />
    </Box>
  </Card>
);

// ─── Service (Customer Service) ───────────────────────────────────────────────

export const ServiceSkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    <SkelHeader width={210} />
    <Divider />
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SkelField />
        </Grid>
        <Grid item xs={12} md={6}>
          <SkelField />
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={0.5}>
            <Skeleton variant="text" width="25%" height={18} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={90} height={32} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
      <Skeleton variant="rectangular" width={100} height={38} sx={{ borderRadius: 1 }} />
    </Box>
  </Card>
);

// ─── Usage History ────────────────────────────────────────────────────────────

export const UsageHistorySkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    {/* Header: account info row */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2 }}>
      <Skeleton variant="text" width={200} height={28} />
      <Skeleton variant="text" width={160} height={22} />
    </Stack>
    <Divider />
    {/* Filter row */}
    <Stack direction="row" spacing={2} sx={{ px: 3, py: 2 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
    <Divider />
    {/* Chart */}
    <Box sx={{ px: 3, py: 2 }}>
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
    </Box>
    {/* Bar chart */}
    <Box sx={{ px: 3, pb: 3 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
    </Box>
  </Card>
);

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const PaymentMethodsSkeleton = () => (
  <Stack spacing={3}>
    <Card elevation={0} sx={cardSx}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2 }}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="rectangular" width={130} height={36} sx={{ borderRadius: 1 }} />
      </Stack>
      <Divider />
      {Array.from({ length: 3 }).map((_, i) => (
        <React.Fragment key={i}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3, py: 2 }}>
            <Skeleton variant="rectangular" width={48} height={32} sx={{ borderRadius: 1 }} />
            <Stack flex={1} spacing={0.5}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="25%" height={16} />
            </Stack>
            <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 1 }} />
          </Stack>
          <Divider />
        </React.Fragment>
      ))}
    </Card>
  </Stack>
);

// ─── Payment Details ──────────────────────────────────────────────────────────

export const PaymentDetailsSkeleton = () => (
  <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
    {/* Header row */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Skeleton variant="text" width={220} height={28} />
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rectangular" width={130} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={130} height={36} sx={{ borderRadius: 1 }} />
      </Stack>
    </Stack>

    <Card elevation={0} sx={cardSx}>
      <CardContent>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid item xs={12} md={6}>
            <SkelField />
          </Grid>
          {/* Email */}
          <Grid item xs={12} md={6}>
            <SkelField />
          </Grid>
          {/* Amount */}
          <Grid item xs={12} md={6}>
            <SkelField />
          </Grid>
          {/* Due date */}
          <Grid item xs={12} md={6}>
            <Stack spacing={0.5}>
              <Skeleton variant="text" width="35%" height={18} />
              <Skeleton variant="text" width="50%" height={28} />
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Payment method section */}
        <Stack spacing={1.5}>
          <Skeleton variant="text" width={180} height={24} />
          {Array.from({ length: 3 }).map((_, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="rectangular" width={48} height={30} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width="40%" height={20} />
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Submit button */}
        <Box display="flex" justifyContent="flex-end">
          <Skeleton variant="rectangular" width={160} height={42} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  </Box>
);

// ─── Confirm Info ─────────────────────────────────────────────────────────────

export const ConfirmInfoSkeleton = () => (
  <>
    <Skeleton variant="text" width={340} height={36} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {Array.from({ length: 2 }).map((_, i) => (
        <Grid item xs={12} md={6} key={i}>
          <Card variant="outlined" sx={{ borderRadius: "8px", height: "100%" }}>
            <CardContent>
              {/* Account No. */}
              <Skeleton variant="text" width={160} height={30} sx={{ mb: 2 }} />

              {/* Mobile No. section */}
              <Skeleton variant="rectangular" height={34} sx={{ borderRadius: 1, mb: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Skeleton variant="text" width={120} height={22} />
                <Skeleton variant="text" width={30} height={22} />
              </Stack>

              {/* Email section */}
              <Skeleton variant="rectangular" height={34} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="text" width="75%" height={18} sx={{ mb: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Skeleton variant="text" width={190} height={22} />
                <Skeleton variant="text" width={30} height={22} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Skip / Confirm button row */}
    <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
      <Skeleton variant="rectangular" width={100} height={44} sx={{ borderRadius: "12px" }} />
      <Skeleton variant="rectangular" width={120} height={44} sx={{ borderRadius: "12px" }} />
    </Stack>
  </>
);

// ─── Auto Pay ─────────────────────────────────────────────────────────────────

export const AutoPaySkeleton = () => (
  <Card elevation={0} sx={cardSx}>
    <SkelHeader width={160} />
    <Divider />
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SkelField />
        </Grid>
        <Grid item xs={12} md={6}>
          <SkelField />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width="50%" height={22} />
            <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 2 }} />
          </Stack>
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
      <Skeleton variant="rectangular" width={100} height={38} sx={{ borderRadius: 1 }} />
    </Box>
  </Card>
);
