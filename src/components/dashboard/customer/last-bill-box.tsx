import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";
import { colors, formatToMMDDYYYY } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";

import { paths } from "@/utils/paths";

import PdfViewer from "../layout/invoice-pdf-view";
import UtilityList from "./last-bill-itemInfo";
import { PaymentModal } from "./paymnet-modal";

export function LastBill(): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);
  const [pdfModal, setPdfModal] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");

  // const raw = getLocalStorage('intuity-user');

  const [balanceCount, setBalanceCount] = React.useState(0);
  React.useEffect(() => {
    let totalAmount = 0;

    if (lastBillInfo?.billing_list) {
      {
        Object?.entries(lastBillInfo?.billing_list).map(([key, items]: any) => {
          totalAmount = items?.reduce(
            (sum, item) => sum + Number(item.amount),
            0
          );
        });
      }
    }

    const safeAmount = Number(lastBillInfo?.last_bill?.amount);
    const balance = (!isNaN(safeAmount) ? safeAmount : 0) - totalAmount;
    setBalanceCount(Number(balance.toFixed(2)));
  }, [lastBillInfo?.billing_list]);

  // React.useEffect(() => {
  //   if (lastBillInfo?.last_bill?.id) {
  //     router.prefetch(paths.dashboard.invoiceDetails(lastBillInfo?.last_bill?.id));
  //   }
  // }, [lastBillInfo]);
  return (
    <Paper elevation={2} sx={{ p: 4, backgroundColor: "#f5f9fc" }}>
      <Grid container spacing={4}>
        {/* Left Side */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{ backgroundColor: "#f5f9fc", width: "95%", p: 2 }}
        >
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#dceaf7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                }}
              >
                📄
              </Box>
              <Typography variant="h6" fontWeight="bold">
                LAST BILL
              </Typography>
            </Box>

            <Divider />

            {/* Bill details table */}
            {/* <Grid container spacing={2}>
              <Grid item xs={6} md={8}>
                <Typography fontWeight="bold" gutterBottom>
                  Utility
                </Typography>
                <Typography>
                  <strong>WATER</strong> - 48699537 - 40 PECAN COVE CT
                </Typography>
              </Grid>
              <Grid item xs={3} md={2}>
                <Typography fontWeight="bold" gutterBottom>
                  Units
                </Typography>
                <Typography>1,000</Typography>
              </Grid>
              <Grid item xs={3} md={2}>
                <Typography fontWeight="bold" gutterBottom>
                  Amount
                </Typography>
                <Typography>$129.00</Typography>
              </Grid>
            </Grid> */}
            <UtilityList data={lastBillInfo?.billing_list ?? {}} />

            <Box
              sx={{
                backgroundColor: "#e7f0f7",
                px: 2,
                py: 1,
                borderRadius: 1,
                mt: 2,
              }}
            >
              <Grid container justifyContent="space-between">
                <Typography fontWeight="bold">PREVIOUS BALANCE</Typography>
                <Typography fontWeight="medium">${balanceCount}</Typography>
              </Grid>
            </Box>

            {/* Due and Invoice Info */}
            <Grid container mt={2} spacing={2}>
              <Grid item xs={6}>
                <Typography gutterBottom>Due date</Typography>
                <Box
                  sx={{
                    backgroundColor: "#e7f0f7",

                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: "100%", // Full width
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "14px", sm: "16px", md: "18px" },
                      // textAlign: 'center',
                    }}
                  >
                    {lastBillInfo?.last_bill?.due_date
                      ? formatToMMDDYYYY(
                          lastBillInfo?.last_bill?.due_date,
                          false,
                          true
                        )
                      : ""}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography gutterBottom>Invoice Amount</Typography>
                <Box
                  sx={{
                    backgroundColor: "#e7f0f7",

                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    width: "100%", // Full width
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "14px", sm: "16px", md: "18px" },
                      // textAlign: 'center',
                    }}
                  >
                    ${lastBillInfo?.last_bill?.amount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* Right Side */}
        <Grid
          item
          xs={12}
          md={4}
          mt={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          sx={{ backgroundColor: "#ffffff", borderRadius: 2, p: 3 }}
        >
          <Typography variant="subtitle1">
            INVOICE NO: {lastBillInfo?.last_bill?.invoice_number}
          </Typography>
          <Typography variant="h6" mt={1} gutterBottom>
            {CustomerInfo?.acctnum} {CustomerInfo?.customer_name}
          </Typography>

          <Typography variant="body2" mt={4}>
            Total Account Balance
          </Typography>
          <Typography variant="h3" color={colors.blue} fontWeight="bold">
            {/* $84.00 */}${lastBillInfo?.customer?.balance}
          </Typography>

          <Button
            onClick={() => {
              setOpen(true);
            }}
            variant="contained"
            sx={{
              mt: 3,
              mb: 1,
              px: 4,
              fontWeight: "bold",

              backgroundColor: colors.blue,
              "&:hover": {
                backgroundColor: colors["blue.3"], // or any other hover color
              },
            }}
          >
            MAKE A PAYMENT
          </Button>
          <Typography
            onClick={() => {
              // setPdfModal(true);
              navigate(
                paths.dashboard.invoiceDetails(lastBillInfo?.last_bill?.id)
              );
            }}
            variant="body2"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            PREVIEW INVOICE
          </Typography>
          <Typography
            fontWeight="bold"
            // onClick={() => {
            //   // setPdfModal(true);
            //   router.replace(paths.dashboard.invoiceDetails(lastBillInfo?.last_bill?.id));
            // }}
            variant="body2"
            sx={{ cursor: "pointer", color: "red" }}
          >
            {lastBillInfo?.payment_pending}
          </Typography>
        </Grid>
      </Grid>
      <PaymentModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      <PdfViewer
        open={pdfModal}
        onClose={() => {
          setPdfModal(false);
        }}
        fileUrl=""
      />
      <CustomBackdrop
        open={paymentLoader}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Paper>
  );
}
