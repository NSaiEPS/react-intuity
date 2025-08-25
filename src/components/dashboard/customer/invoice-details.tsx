// pages/invoice.js (or any component file)

import * as React from "react";

import {
  getInvoiceDetails,
  setDashboardLoader,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors, formatToMMDDYYYY } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Button from "@/components/CommonComponents/Button";
import { useSearchParams } from "react-router";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";

export default function InvoiceDetails() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const dashboardLoader = useSelector(
    (state: RootState) => state.DashBoard.dashboardLoader
  );

  // const raw = getLocalStorage('intuity-user');
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    if (!id) {
      toast.error("Invalid ID");
    } else {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", id ?? "");

      dispatch(getInvoiceDetails(formData, token, setContextLoading));
    }
  }, [id]);

  const {
    company,
    company_settings,
    customer,
    unique_by_utility = {},

    last_bill = [],
    extra_params = [],
    //   } = InvoiceDetails?.body ?? {};
  } = invoiceDetails ?? {};

  const pdfRef = React.useRef<HTMLDivElement>(null);

  // const handleDownloadPDF = async () => {
  //   dispatch(setDashboardLoader(true));

  //   // window.print();
  //   // return;

  //   const input = pdfRef.current;
  //   if (!input) {
  //     dispatch(setDashboardLoader(false));

  //     return;
  //   }

  //   const canvas = await html2canvas(input, { scale: 2 });
  //   const imgData = canvas.toDataURL('image/png');

  //   const pdf = new jsPDF('p', 'mm', 'a4');

  //   const imgProps = pdf.getImageProperties(imgData);
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  //   dispatch(setDashboardLoader(false));

  //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //   pdf.save(`invoice_${customer?.customer_name || 'customer'}.pdf`);
  // };

  const handleDownloadPDF = async () => {
    dispatch(setDashboardLoader(true));

    const original = pdfRef.current;
    if (!original) {
      dispatch(setDashboardLoader(false));
      return;
    }

    // Clone content
    const clone = original.cloneNode(true) as HTMLElement;

    // Force desktop look (disable breakpoints)
    clone.style.width = "1024px";
    clone.style.maxWidth = "1024px";
    clone.style.padding = "24px";
    clone.style.background = "#fff";
    clone.style.position = "fixed";
    clone.style.top = "-9999px"; // hide offscreen
    clone.style.left = "0";
    clone.style.zIndex = "-1";

    document.body.appendChild(clone);

    // Capture
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      windowWidth: 1024, // simulate desktop viewport
    });

    // Remove clone
    document.body.removeChild(clone);

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");

    dispatch(setDashboardLoader(false));
  };

  // const handleDownloadPDF = async () => {
  //   dispatch(setDashboardLoader(true));

  //   const input = pdfRef.current;
  //   if (!input) {
  //     dispatch(setDashboardLoader(false));
  //     return;
  //   }

  //   // Clone node & force desktop width
  //   const clonedElement = input.cloneNode(true) as HTMLElement;
  //   clonedElement.style.width = '1224px'; // Force desktop view
  //   clonedElement.style.maxWidth = '1224px';
  //   clonedElement.style.position = 'absolute';
  //   clonedElement.style.top = '-9999px'; // Hide off-screen
  //   clonedElement.style.left = '0';
  //   clonedElement.style.zIndex = '-1';
  //   document.body.appendChild(clonedElement);

  //   // Capture desktop view
  //   const canvas = await html2canvas(clonedElement, {
  //     scale: 2, // High resolution
  //     useCORS: true,
  //   });

  //   document.body.removeChild(clonedElement); // Cleanup

  //   const imgData = canvas.toDataURL('image/png');
  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //   pdf.save(`invoice_${invoiceDetails?.customer?.customer_name || 'customer'}.pdf`);

  //   dispatch(setDashboardLoader(false));
  // };

  return (
    <SkeletonWrapper>
      {/* <Button variant="contained" onClick={handleDownloadPDF} sx={{ mb: 2 }}>
        Download Invoice PDF
      </Button> */}
      <div
        style={{
          marginLeft: "auto",
          maxWidth: "180px",
        }}
      >
        <Button
          onClick={handleDownloadPDF}
          type="button"
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          // onClick={onSubmit}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{
            borderRadius: "12px",
            height: "41px",
          }}
        >
          Download Invoice PDF
        </Button>
      </div>

      <div ref={pdfRef} id="print-section">
        <Box
          sx={{ mx: "auto", my: 4, p: { xs: 1.5, sm: 2 }, bgcolor: "#F7F7F7" }}
        >
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
                sx={{ mb: 1 }}
              >
                <Typography sx={{ fontSize: 14, color: "#888" }}>
                  {company_settings?.invoice_text_header_email}
                </Typography>
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
          {/* Invoice + Total Due Row */}
          <Grid container spacing={2} mt={3} alignItems="center">
            <Grid item xs={12} sm={7}>
              <Typography sx={{ mb: 1, color: "#777" }}>INVOICE TO</Typography>
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
                  p: 2,
                  mt: 1,
                  width: "100%",
                  maxWidth: 300,
                  ml: { xs: 0, sm: "auto" },
                }}
              >
                <Grid container>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: 15 }}>Invoice Date:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                      {formatToMMDDYYYY(
                        last_bill?.[0]?.billing_date,
                        false,
                        false,
                        true
                      )}
                      {/* {last_bill?.[0]?.billing_date} */}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: 15 }}>Total Due:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
                      ${last_bill?.[0]?.amount}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
          {/* Item Descriptions */}
          {Object?.entries(unique_by_utility).map(([key, items]: any) => {
            const [utilityName, , meterNumber, ...addressParts] =
              key.split(";");
            const serviceAddress = addressParts.join(";");
            const utilityDetails = items?.[0] ?? {};

            return (
              <Box key={key}>
                <Typography
                  sx={{
                    mt: 4,
                    mb: 0.3,
                    fontWeight: 700,
                    color: colors.darkBlue,
                  }}
                >
                  Item Description
                </Typography>
                <Typography sx={{ mb: 1, fontWeight: 700, color: colors.blue }}>
                  <strong>{utilityName}</strong> - {meterNumber} -{" "}
                  {serviceAddress}
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ mb: 2, boxShadow: 0, overflowX: "auto" }}
                >
                  <Table>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow
                          key={item.item}
                          sx={{
                            bgcolor:
                              index % 2 !== 0 ? colors["blue.4"] : "white",
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
                      <TableRow>
                        <TableCell colSpan={2} sx={{ py: 3 }}>
                          <Box
                            sx={{
                              mt: 3,
                              p: 2,
                              border: "1px solid #ddd",
                              borderRadius: 2,
                              backgroundColor: "#f9f9f9",
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
                                  {formatToMMDDYYYY(
                                    utilityDetails?.start_date,
                                    false,
                                    false,
                                    true
                                  )}
                                  <br />
                                  To:{" "}
                                  {formatToMMDDYYYY(
                                    utilityDetails?.end_date,
                                    false,
                                    false,
                                    true
                                  )}
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
              mb={3}
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
            textAlign="right"
            sx={{
              bgcolor: "#38699C",
              color: "white",
              borderRadius: 1,
              p: 2,
              // width: '100%',
              maxWidth: 250,
              ml: "auto",
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 } }}>
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
            }}
          >
            {"- ".repeat(200)}
          </Box>
          {/* Bottom Details */}
          <Paper sx={{ p: 3, maxWidth: "100%", mx: "auto" }}>
            <Stack
              direction="column"
              alignItems="flex-end"
              spacing={2}
              sx={{ pb: 1 }}
            >
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                Please detach and return with your payment. Make Checks Payable
                to:
                <b> Berkely Springs Water Works</b>
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="I would like to go paperless."
                  sx={{ m: 0, ".MuiFormControlLabel-label": { fontSize: 13 } }}
                />
                <Typography variant="body2" sx={{ fontSize: 13 }}>
                  Here is my email address:
                </Typography>
                {/* looks like an underline on the bill */}
                <TextField
                  variant="standard"
                  size="small"
                  placeholder=""
                  sx={{ minWidth: 240 }}
                  InputProps={{ disableUnderline: false }}
                />
              </Box>
            </Stack>
            <Grid container key={1} spacing={2}>
              {/* Left Section */}
              <Grid item xs={12} md={6} mt={"auto"}>
                <Box
                  sx={{
                    border: "1px solid black",
                    px: 1,
                    py: 1,
                    mb: 2,
                    width: "90%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      bgcolor: colors["blue.4"],
                      color: "black",
                      px: 2,
                      padding: 1,
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    BILL PAYMENT
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 600 }}>
                  {customer?.name}
                </Typography>
                <Typography>{customer?.address}</Typography>
                {/* <Typography>{customer?.city}</Typography> */}
              </Grid>

              {/* Right Section with vertical borders */}
              <Grid item xs={12} md={6}>
                <Table
                  size="small"
                  sx={{ border: "1px solid black", borderCollapse: "collapse" }}
                >
                  <TableBody>
                    <TableRow sx={{ bgcolor: colors["blue.4"] }}>
                      <TableCell
                        sx={{
                          color: "black",
                          fontWeight: 600,
                          borderRight: "1px solid black",
                        }}
                      >
                        ACCOUNT NUMBER
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "black",
                          fontWeight: 600,
                          borderRight: "1px solid black",
                        }}
                      >
                        DUE DATE
                      </TableCell>
                      <TableCell sx={{ color: "black", fontWeight: 600 }}>
                        AMOUNT DUE
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ borderRight: "1px solid black" }}>
                        {customer?.acctnum}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid black" }}>
                        {last_bill?.[0]?.due_date}
                      </TableCell>
                      <TableCell>${last_bill?.[0]?.amount}</TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: colors["blue.4"] }}>
                      <TableCell
                        sx={{
                          color: "black",
                          fontWeight: 600,
                          borderRight: "1px solid black",
                        }}
                      >
                        BILL DATE
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "black",
                          fontWeight: 600,
                          borderRight: "1px solid black",
                        }}
                      >
                        LATE DATE
                      </TableCell>
                      <TableCell sx={{ color: "black", fontWeight: 600 }}>
                        LATE AMOUNT
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ borderRight: "1px solid black" }}>
                        {last_bill?.[0]?.billing_date}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid black" }}>
                        {last_bill?.[0]?.late_date}
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

                <Box
                  sx={{
                    border: "1px solid black",
                    mt: 2,
                    display: "inline-block",
                    px: 2,
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2">
                    Invoice#: <b>{last_bill?.[0]?.invoice_number}</b>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          {/* Footer */}
          <Divider sx={{ my: 2 }} />
          <Grid container p={3} pt={0} pb={0}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "#444", fontSize: 14 }}>
                {last_bill?.[0]?.last_payment_info}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography align="right" sx={{ color: "#444", fontSize: 14 }}>
                {company_settings?.invoice_footer_column_3}
              </Typography>
            </Grid>
          </Grid>
          <CustomBackdrop
            open={dashboardLoader}
            style={{ zIndex: 1300, color: "#fff" }}
          >
            <Loader />
          </CustomBackdrop>
        </Box>
      </div>
    </SkeletonWrapper>
  );
}
