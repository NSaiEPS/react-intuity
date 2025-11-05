import * as React from "react";
import { RootState } from "@/state/store";
import { colors, formatToMMDDYYYY } from "@/utils";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useSelector } from "react-redux";

export const InvoiceMainDetails = () => {
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const dashboardLoader = useSelector(
    (state: RootState) => state.DashBoard.dashboardLoader
  );
  const {
    company,
    company_settings,
    customer,
    unique_by_utility = {},

    last_bill = [],
    extra_params = [],
    //   } = InvoiceDetails?.body ?? {};
  } = invoiceDetails ?? {};
  return (
    <Box sx={{ mx: "auto", p: { xs: 1.5, sm: 2 }, bgcolor: "#F7F7F7" }}>
      {/* Header */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { xs: 18, sm: 20, md: 18 },
              letterSpacing: 0.4,
            }}
          >
            {company?.company_name}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#999" }}>
            {company_settings?.invoice_subheadline}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          sx={{ textAlign: { xs: "left", sm: "right" } }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography sx={{ fontSize: 14, color: "#888" }}>
              {company_settings?.invoice_text_header_open}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#888" }}>
              {company_settings?.invoice_text_header_web}
              <br />
              {company_settings?.direct_debit}
            </Typography>
          </Stack>
          <Divider />
        </Grid>
      </Grid>
      <Typography sx={{ fontSize: 14, color: "#888", padding: "3px" }}>
        {company_settings?.invoice_text_header_email}
      </Typography>
      {/* Invoice + Total Due Row */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={7}>
          <Typography sx={{ color: "#777" }}>INVOICE TO</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 0.5 }}>
            {customer?.customer_name}
          </Typography>
          <Typography variant="body2">
            Billing address: {customer?.address}, {customer?.city}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {customer?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phone: {customer?.phone}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={5}
          textAlign={{ xs: "left", sm: "right" }}
          alignSelf="center"
        >
          <Typography
            sx={{
              fontSize: { xs: 32, sm: 44 },
              color: "#aaa",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            INVOICE
          </Typography>
          <Box
            sx={{
              bgcolor: "#38699C",
              color: "white",
              borderRadius: 1,
              textAlign: "left",

              width: "100%",
              maxWidth: 300,
              ml: { xs: 0, sm: "auto" },
            }}
          >
            <Grid container>
              <Grid item xs={6} sx={{ p: 1 }}>
                <Typography sx={{ fontSize: 15 }}>Invoice Date:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right" sx={{ p: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                  {formatToMMDDYYYY(
                    last_bill?.[0]?.billing_date,
                    false,
                    false,
                    true
                  )}
                  {/* {last_bill?.[0]?.billing_date} */}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ p: 1 }}>
                <Typography sx={{ fontSize: "15px", fontWeight: 400 }}>
                  Total Due:
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right" sx={{ p: 1 }}>
                <Typography sx={{ fontSize: 15 }}>
                  ${last_bill?.[0]?.amount}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      {/* Item Descriptions */}
      {Object?.entries(unique_by_utility).map(([key, items]: any) => {
        const [utilityName, , meterNumber, ...addressParts] = key.split(";");
        const serviceAddress = addressParts.join(";");
        const utilityDetails = items?.[0] ?? {};
        const subtotal = items.reduce(
          (acc, item) => acc + (item?.amount || 0),
          0
        );
        return (
          <Box key={key}>
            <Typography
              sx={{
                fontWeight: 700,
                color: colors.darkBlue,
              }}
            >
              Item Description
            </Typography>
            <Typography sx={{ fontWeight: 700, color: colors.blue }}>
              <strong>{utilityName}</strong> - {meterNumber} - {serviceAddress}
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 0, overflowX: "auto" }}
            >
              <Table>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow
                      key={item.item}
                      sx={{
                        bgcolor: index % 2 !== 0 ? colors["blue.4"] : "white",
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: 600, fontSize: 16, border: 0 }}
                      >
                        {item.product_id}
                      </TableCell>
                      <TableCell align="right" sx={{ border: 0 }}>
                        ${item.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow
                    sx={{
                      bgcolor: colors["blue.4"],
                      borderTop: "1px solid #ddd",
                    }}
                    style={{ marginTop: 6 }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: 16,
                        border: 0,
                        pt: 2,
                      }}
                    >
                      Subtotal
                    </TableCell>
                    <TableCell align="right" sx={{ border: 0, pt: 2 }}>
                      ${subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={2}>
                      <Box
                        sx={{
                          paddingLeft: 3,
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          backgroundColor: "#f9f9f9",
                          py: 2,
                        }}
                      >
                        <Grid container spacing={3}>
                          {/* Service Address + Dates */}
                          <Grid item xs={12} sm={3}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              {utilityName} Service at
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              gutterBottom
                            >
                              {utilityDetails.service_address}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              From:{" "}
                              {utilityDetails?.start_date
                                ? formatToMMDDYYYY(
                                    utilityDetails?.start_date,
                                    false,
                                    false,
                                    true
                                  )
                                : ""}
                              <br />
                              To:{" "}
                              {utilityDetails?.end_date
                                ? formatToMMDDYYYY(
                                    utilityDetails?.end_date,
                                    false,
                                    false,
                                    true
                                  )
                                : ""}
                            </Typography>
                          </Grid>

                          {/* Number of Days */}
                          <Grid item xs={12} sm={2}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Number of Days
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {utilityDetails.consumption_days}
                            </Typography>
                          </Grid>

                          {/* Meter Readings */}
                          <Grid item xs={12} sm={4}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Meter Readings
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              Start: {utilityDetails?.previous_reading}
                              <br />
                              End: {utilityDetails?.current_reading}
                            </Typography>
                          </Grid>

                          {/* Usage Info */}
                          <Grid item xs={12} sm={3}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Usage in Gallons
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              Meter #: {utilityDetails.meter_number}
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {utilityDetails.consumption}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
      {/* Previous Balance */}
      {extra_params?.map((item, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          pl={1}
          pt={0}
          pb={0}
        >
          <Typography sx={{ fontWeight: 700, color: "#666" }}>
            PREVIOUS BALANCE
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "#666" }}>
            ${item?.amount}
          </Typography>
        </Box>
      ))}
      {/* Total Bill bar */}
      <Box
        sx={{
          bgcolor: "#38699C",
          color: "white",
          borderRadius: 1,
          textAlign: "center",
          // width: '100%',
          maxWidth: 150,
          ml: "auto",
        }}
      >
        <Typography sx={{ fontWeight: 500, fontSize: "15px" }}>
          Total Due: ${last_bill?.[0]?.amount}
        </Typography>
      </Box>
      {/* Do Not Pay Text */}
      {customer?.autopay ? (
        <Box textAlign="right">
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: "red" }}>
            {invoiceDetails?.autopay_do_not_pay_text}
          </Typography>
        </Box>
      ) : null}
      <Divider sx={{ my: 2 }} />
      <Grid container pt={0} pb={0}>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ color: "#444", fontSize: 14, paddingLeft: 1 }}>
            {last_bill?.[0]?.last_payment_info}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography align="right" sx={{ color: "#444", fontSize: 14 }}>
            {company_settings?.invoice_footer_column_3}
          </Typography>
        </Grid>
      </Grid>
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          fontSize: 14,
          letterSpacing: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "clip",
          my: 2,
          mt: 10,
        }}
      >
        {"- ".repeat(200)}
      </Box>
      {/* Bottom Details */}

      <Paper sx={{ maxWidth: "100%", mx: "auto", p: 2 }}>
        {/* Invoice Header */}

        {/* Payment Instructions */}
        <Stack
          direction="column"
          sx={{
            width: "100%",
            pb: 2,
            // textAlign: { xs: "left", md: "right" },
            // alignItems: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Typography variant="body2" sx={{ fontSize: 13, paddingLeft: 1 }}>
            Please detach and return with your payment. Make Checks Payable to:
            <b> {company?.company_name}</b>
          </Typography>

          <Grid container spacing={2}>
            {/* LEFT COLUMN - Update Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ width: "100%", pr: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: 13, fontWeight: 600, paddingLeft: 1 }}
                >
                  Update Account information:
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 13, mr: 1, paddingLeft: 1 }}
                  >
                    I would like to go paperless (email to):
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      borderBottom: "1px solid #555",
                      height: "14px",
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 13, mr: 1, paddingLeft: 1 }}
                  >
                    Update My Address:
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      borderBottom: "1px solid #555",
                      height: "14px",
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 13, mr: 1, paddingLeft: 1 }}
                  >
                    Update My Phone #:
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      borderBottom: "1px solid #555",
                      height: "14px",
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* RIGHT COLUMN - Bill Table */}
            <Grid item xs={12} md={6}>
              <Table
                size="small"
                sx={{
                  border: "1px solid black",
                  borderCollapse: "collapse",
                  width: "100%",
                }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: "#e0f0ff" }}>
                    <TableCell
                      sx={{ fontWeight: 600, borderRight: "1px solid black" }}
                    >
                      ACCOUNT NUMBER
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, borderRight: "1px solid black" }}
                    >
                      DUE DATE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>AMOUNT DUE</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ borderRight: "1px solid black" }}>
                      {customer?.acctnum}
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid black" }}>
                      {formatToMMDDYYYY(
                        last_bill?.[0]?.due_date,
                        false,
                        false,
                        true
                      )}
                    </TableCell>
                    <TableCell>${last_bill?.[0]?.amount}</TableCell>
                  </TableRow>

                  <TableRow sx={{ bgcolor: "#e0f0ff" }}>
                    <TableCell
                      sx={{ fontWeight: 600, borderRight: "1px solid black" }}
                    >
                      BILL DATE
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, borderRight: "1px solid black" }}
                    >
                      LATE DATE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>LATE AMOUNT</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ borderRight: "1px solid black" }}>
                      {formatToMMDDYYYY(
                        last_bill?.[0]?.billing_date,
                        false,
                        false,
                        true
                      )}
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid black" }}>
                      {formatToMMDDYYYY(
                        last_bill?.[0]?.late_date,
                        false,
                        false,
                        true
                      )}
                    </TableCell>
                    <TableCell>
                      $
                      {(
                        last_bill?.[0]?.amount +
                        last_bill?.[0]?.late_date_amount
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Invoice + Check info */}
              <Box
                sx={{
                  border: "1px solid black",
                  px: 1,
                  py: 0.5,
                  display: "inline-block",
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 13 }}>
                  Invoice#: <b>{last_bill?.[0]?.invoice_number}</b>
                </Typography>
              </Box>

              <Box
                sx={{
                  border: "1px solid black",
                  borderBottom: "none",

                  // ⬅️ removes bottom border
                  p: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: 13 }}
                >
                  Check Number:
                </Typography>
              </Box>

              <Box sx={{ border: "1px solid black", p: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: 13 }}
                >
                  Amount Paid:
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Stack>

        <Grid container spacing={2}>
          {/* LEFT COLUMN - COMPANY INFO */}
          <Grid item xs={12} md={6}>
            <Box sx={{ lineHeight: 1.6 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                Company Name:
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, fontStyle: "normal", ml: 0.5 }}
                >
                  {company?.company_name}
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                Address 1:
                <Typography
                  component="span"
                  sx={{ fontWeight: 500, fontStyle: "normal", ml: 0.5 }}
                >
                  {company?.add}
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                Address 2:
                <Typography
                  component="span"
                  sx={{ fontWeight: 500, fontStyle: "normal", ml: 0.5 }}
                >
                  {company?.address2}
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                City, State, zip:
                <Typography
                  component="span"
                  sx={{ fontWeight: 500, fontStyle: "normal", ml: 0.5 }}
                >
                  {[company?.city, company?.street, company?.zip].filter(
                    Boolean
                  ).length > 0 &&
                    [company?.city, company?.street, company?.zip]
                      .filter(Boolean)
                      .join(", ")}
                </Typography>
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT COLUMN - CUSTOMER INFO */}
          <Grid item xs={12} md={6}>
            <Box sx={{ lineHeight: 1.6 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                Customer Name:{" "}
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, fontStyle: "normal", ml: 0.5 }}
                >
                  {customer?.customer_name}
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                Address 1:
                <Typography
                  component="span"
                  sx={{ fontWeight: 500, fontStyle: "normal", ml: 0.5 }}
                >
                  {customer?.address}
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                Address 2:
                <Typography
                  component="span"
                  sx={{ fontWeight: 500, fontStyle: "normal", ml: 0.5 }}
                >
                  {customer?.address2}
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontStyle: "italic", paddingLeft: 1 }}
              >
                City, State, zip:
                <Typography
                  component="span"
                  sx={{ fontWeight: 500, fontStyle: "normal", ml: 0.5 }}
                >
                  {customer?.city}
                </Typography>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {/* Footer */}

      <CustomBackdrop
        open={dashboardLoader}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Box>
  );
};
