import * as React from "react";
import { RootState } from "@/state/store";
import { colors, formatToMMDDYYYY } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { paths } from "@/utils/paths";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import UtilityList from "./last-bill-itemInfo";
import { PaymentModal } from "./paymnet-modal";
import CustomModal from "../layout/invoice-pdf-modal";
import { pdf } from "@react-pdf/renderer";
import InvoicePdfDocument from "../layout/invoice-pdf-view";

export function LastBill(): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);


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
  const invoiceDetails = useSelector(
    (state: RootState) => state?.DashBoard?.invoiceDetails
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");

  const [balanceCount, setBalanceCount] = React.useState(0);
    const [previewInvoicePdf, setPdfPreviewInvocie] = React.useState(false);

  React.useEffect(() => {
    let totalAmount = 0;

    if (lastBillInfo?.billing_list) {
      Object.entries(lastBillInfo.billing_list).forEach(
        ([_, items]: any) => {
          totalAmount = items.reduce(
            (sum, item) => sum + Number(item.amount),
            0
          );
        }
      );
    }

    const safeAmount = Number(lastBillInfo?.last_bill?.amount);
    const balance = (!isNaN(safeAmount) ? safeAmount : 0) - totalAmount;
    setBalanceCount(Number(balance.toFixed(2)));
  }, [lastBillInfo?.billing_list]);

const handlePreviewInvoice = async () => {
  if (!invoiceDetails) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // 📱 MOBILE → DOWNLOAD PDF
  if (isMobile) {
    try {
      const blob = await pdf(
        <InvoicePdfDocument invoiceDetails={invoiceDetails} />
      ).toBlob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${
        lastBillInfo?.last_bill?.invoice_number || "file"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);
    }

    return; // ⛔ EXIT: do not continue
  }

  // 💻 DESKTOP → OPEN PDF VIEWER MODAL
  setPdfPreviewInvocie(true);
};


  const rawHTML =
    lastBillInfo?.company?.optional_instructions ??
    `<p><a href="https://www.google.com">Google</a>&nbsp;
     <a href="https://test-web.pay.waterbill.com/">
       https://test-web.pay.waterbill.com/
     </a>
   </p>`;

  const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
    ADD_ATTR: ["target", "rel"],
  });

  const finalHTML = sanitizedHTML.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  );

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

            <Grid container mt={2} spacing={2}>
              <Grid item xs={6}>
                <Typography gutterBottom>Due date</Typography>
                <Box
                  sx={{
                    backgroundColor: "#e7f0f7",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {lastBillInfo?.last_bill?.due_date
                      ? formatToMMDDYYYY(
                          lastBillInfo.last_bill.due_date,
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
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
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
            ${lastBillInfo?.customer?.balance}
          </Typography>

          {!lastBillInfo?.last_bill?.id ? (
            <Typography variant="body2" mt={2} color="red" fontWeight="bold">
              No Invoice found
            </Typography>
          ) : lastBillInfo?.company?.allow_payments == 0 ? (
            <Box
              className="instructions-html"
              sx={{ "& a": { color: "red !important", textDecoration: "none" } }}
              dangerouslySetInnerHTML={{ __html: finalHTML }}
            />
          ) : lastBillInfo?.customer?.is_payments_blocked == 1 ? (
            <Typography variant="body2" mt={2} color="red" fontWeight="bold">
              {lastBillInfo?.block_individual_customer_payment_text ??
                "Payments are not allowed at this time"}
            </Typography>
          ) : (
            <Button
              onClick={() => setOpen(true)}
              variant="contained"
              sx={{
                mt: 3,
                mb: 1,
                px: 4,
                fontWeight: "bold",
                backgroundColor: colors.blue,
                "&:hover": { backgroundColor: colors["blue.3"] },
              }}
            >
              MAKE A PAYMENT
            </Button>
          )}

          {lastBillInfo?.last_bill?.id && (
            <Typography
              onClick={handlePreviewInvoice}
              variant="body2"
              sx={{ textDecoration: "underline", cursor: "pointer", mt: 1 }}
            >
              PREVIEW INVOICE
            </Typography>
          )}

          <Typography
            fontWeight="bold"
            variant="body2"
            sx={{ cursor: "pointer", color: "red" }}
          >
            {lastBillInfo?.payment_pending}
          </Typography>
          
        </Grid>
      </Grid>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
         {previewInvoicePdf && (
        <CustomModal
          open={previewInvoicePdf}
          onClose={() => {
            setPdfPreviewInvocie(false);
          }}
          id={lastBillInfo?.last_bill?.id}
        />
      )}
      <CustomBackdrop open={paymentLoader} style={{ zIndex: 1300, color: "#fff" }}>
        <Loader />
      </CustomBackdrop>
    </Paper>
  );
}
