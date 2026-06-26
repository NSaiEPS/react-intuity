import * as React from "react";
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import { colors, formatToMMDDYYYY, UtilityItem } from "@/utils";

interface UtilityBillBlockProps {
  utilityKey: string;
  items: UtilityItem[];
  previousBalance: number;
  billingAmount: number;
}

export function UtilityBillBlock({ utilityKey, items, previousBalance, billingAmount }: UtilityBillBlockProps): React.JSX.Element {
  const [utilityName, , meterNumber, ...addressParts] = utilityKey.split(";");
  const serviceAddress = addressParts.join(";");
  const utilityDetails: UtilityItem = items?.[0] ?? ({} as UtilityItem);
  const billedItems = items?.filter((item) => item?.product_id);

  // Subtotal = sum of line items only
  const subtotal = items.reduce((acc, item) => acc + (item?.amount || 0), 0);

  // Grand total = items subtotal + previous balance
  const grandTotal = subtotal + previousBalance;

  return (
    <Box sx={{ px: 1.5 }}>
      {/* ── SERVICE DETAILS CARD ── */}
      <Box
        sx={{
          width: "100%",
          p: 1.5,
          mt: 1,
          mb: 1.5,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <Grid container spacing={3}>
          {/* Service Address + Dates */}
          <Grid item xs={12} sm={3}>
            <Typography color="text.secondary" sx={{ fontSize: "16px" }}>
              {utilityName} Service at
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              {utilityDetails.service_address}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              From: {utilityDetails?.start_date ? formatToMMDDYYYY(utilityDetails.start_date, false, false, true) : ""}
              <br />
              To: {utilityDetails?.end_date ? formatToMMDDYYYY(utilityDetails.end_date, false, false, true) : ""}
            </Typography>
          </Grid>

          {/* Number of Days */}
          <Grid item xs={12} sm={2}>
            <Typography sx={{ fontSize: "16px" }} color="text.secondary" gutterBottom>
              Number of Days
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              {utilityDetails.consumption_days}
            </Typography>
          </Grid>

          {/* Meter Readings */}
          <Grid item xs={12} sm={4}>
            <Typography sx={{ fontSize: "16px" }} color="text.secondary" gutterBottom>
              Meter Readings
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              Start: {utilityDetails?.previous_reading}
              <br />
              End: {utilityDetails?.current_reading}
            </Typography>
          </Grid>

          {/* Usage Info */}
          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontSize: "16px" }} color="text.secondary" gutterBottom>
              Usage in Gallons
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              Meter #: {utilityDetails.meter_number}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              {utilityDetails.consumption}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Item Description heading */}
      <Typography sx={{ mb: 0.3, fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, color: colors.darkBlue }}>
        Item Description
      </Typography>
      <Typography sx={{ mb: 1, fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, color: colors.blue }}>
        <strong>{utilityName}</strong> - {meterNumber} - {serviceAddress}
      </Typography>

      {/* ── ITEMS TABLE ── */}
      <TableContainer component={Paper} sx={{ mb: 1.5, boxShadow: 0, overflowX: "auto" }}>
        <Table>
          <TableBody>
            {/* Line items — alternating row colors */}
            {billedItems.map((item, index) => (
              <TableRow key={item.item} sx={{ bgcolor: index % 2 !== 0 ? colors["blue.4"] : "white", "& td": { py: 1 } }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, border: 0 }}>
                  {item.product_id}
                </TableCell>
                <TableCell align="right" sx={{ border: 0, fontSize: "16px" }}>
                  ${item.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}

            {/* PREVIOUS BALANCE — value from extra_params, not subtotal */}
            {previousBalance > 0 && (
              <TableRow sx={{ bgcolor: colors["blue.4"], "& td": { py: 1 } }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, border: 0 }}>
                  PREVIOUS BALANCE
                </TableCell>
                <TableCell align="right" sx={{ border: 0, fontSize: "16px" }}>
                  ${previousBalance.toFixed(2)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mb: 2 }}>
        <Box sx={{ width: { xs: "100%", sm: 320 } }}>
          {/* SUBTOTAL */}
          <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, px: 2 }}>
            <Typography sx={{ fontWeight: 500, fontSize: 18 }}>SUB TOTAL:</Typography>
            <Typography sx={{ fontWeight: 500, fontSize: 18 }}>${grandTotal.toFixed(2)}</Typography>
          </Box>

          {/* TAX */}
          <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, borderBottom: "1px solid #ddd" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 500 }}>Tax:</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 500 }}>
              $ {(Number(billingAmount) - Number(grandTotal)).toFixed(2)}
            </Typography>
          </Box>

          {/* TOTAL DUE */}
          <Box sx={{ display: "flex", justifyContent: "space-between", borderRadius: 1, py: 1.5, px: 2, bgcolor: "#38699C" }}>
            <Typography sx={{ fontWeight: 500, fontSize: 18, color: "#fff" }}>Total Due:</Typography>
            <Typography sx={{ fontWeight: 500, fontSize: 18, color: "#fff" }}>${billingAmount}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
