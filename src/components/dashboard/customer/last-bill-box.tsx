import * as React from "react";
import { RootState } from "@/state/store";
import { colors, CustomerInfo, formatToMMDDYYYY } from "@/utils";
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
import DOMPurify from "dompurify";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useSelector } from "react-redux";

import UtilityList from "./last-bill-item-info";
import { PaymentModal } from "./paymnet-modal";
import { formatCurrency } from "@/utils/formatters";
import { downloadInvoicePdf } from "@/utils/pdfHelper";

const CustomModal = React.lazy(() => import("../layout/invoice-pdf-modal"));



interface BillingItem {
  amount: string | number;
  product_id?: string;
}

// These line-item charges must be excluded from the Previous Balance total.
const EXCLUDED_FROM_PREV_BALANCE = new Set([
  "Charge A",
  "Charge B",
  "Charge C",
  "Charge D",
  "Charge E",
  "Taxes",
  "MiscOther1",
  "MiscOther2",
  "Late Fee Charge",
]);

/**
 * Returns true if the product_id should be excluded from Previous Balance.
 * Handles both plain ids ("Charge A") and utility-prefixed ids ("WATER-1 Charge A").
 */
const isExcludedFromPrevBalance = (productId: string = ""): boolean => {
  if (EXCLUDED_FROM_PREV_BALANCE.has(productId)) return true;
  // Strip any "UTILITY-N " prefix (e.g. "WATER-1 Charge A" → "Charge A")
  const withoutPrefix = productId.replace(/^[\w-]+\s+/, "");
  return EXCLUDED_FROM_PREV_BALANCE.has(withoutPrefix);
};

export function LastBill(): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);


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

  const CustomerInfo: CustomerInfo = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");

  const [previewInvoicePdf, setPdfPreviewInvocie] = React.useState(false);

  React.useEffect(() => {
    let totalAmount = 0;

    if (lastBillInfo?.billing_list) {
      Object.entries(lastBillInfo.billing_list as Record<string, BillingItem[]>).forEach(
        ([_, items]) => {
          // += accumulates across all utility groups (was = before — bug)
          // Exclude the specified charge types from the Previous Balance total
          totalAmount += items
            .filter((item) => !isExcludedFromPrevBalance(item.product_id))
            .reduce((sum, item) => sum + Number(item.amount), 0);
        }
      );
    }

    // totalAmount computed for potential future balance display
  }, [lastBillInfo?.billing_list]);

  const handlePreviewInvoice = async () => {
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (typeof navigator !== "undefined" &&
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1 &&
        window.innerWidth <= 1024) ||
      (typeof window !== "undefined" && window.innerWidth < 768);

    if (isMobile) {
      const invoiceNum =
        lastBillInfo?.get_invoices?.[0]?.invoice_number ||
        lastBillInfo?.last_bill?.invoice_number ||
        invoiceDetails?.last_bill?.[0]?.invoice_number;

      try {
        await downloadInvoicePdf({
          invoiceNumber: invoiceNum,
          lastBillInfo,
          invoiceDetails,
          dashBoardInfo,
        });
      } catch (error) {
        console.error("PDF Download Error:", error);
      }
      return;
    }

    setPdfPreviewInvocie(true);
  };



  const paymentUrl = import.meta.env.VITE_PAYMENT_URL ?? "";
  const rawHTML =
    lastBillInfo?.company?.optional_instructions ??
    `<p><a href="${paymentUrl}">${paymentUrl}</a></p>`;

  const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
    ADD_ATTR: ["target", "rel"],
  });

  const finalHTML = sanitizedHTML.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  );

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "#f5f9fc",
        borderRadius: 2,
      }}
    >
      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
        {/* Left Side */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <UtilityList data={lastBillInfo?.billing_list ?? {}} />

            {
              invoiceDetails?.extra_params?.map((item) => {
                return (
                  <Box
                    key={item?.product_id}
                    sx={{
                      backgroundColor: "#e7f0f7",
                      px: 2,
                      py: 1,
                      borderRadius: 1,

                    }}
                  >
                    <Grid container justifyContent="space-between">
                      <Typography fontWeight="bold">{item?.product_id}</Typography>
                      <Typography fontWeight="medium">{formatCurrency(item?.amount)}</Typography>
                    </Grid>
                  </Box>
                )
              })
            }




            <Grid container mt={2} spacing={2} alignItems="stretch">
              <Grid item xs={6} sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  Due date
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "#e7f0f7",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {lastBillInfo?.last_bill?.due_date
                      ? formatToMMDDYYYY(lastBillInfo.last_bill.due_date, false, true)
                      : ""}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textAlign="right">
                  Invoice Amount
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "#e7f0f7",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    textAlign: "right",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {/* {Number(lastBillInfo?.last_bill?.amount) < 0
                      ? `-$${Math.abs(Number(lastBillInfo?.last_bill?.amount)).toFixed(2)}`
                      : `$${Number(lastBillInfo?.last_bill?.amount ?? 0).toFixed(2)}`} */}
                    {formatCurrency(lastBillInfo?.last_bill?.amount)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Late fee row */}
            {lastBillInfo?.last_late_fee_count?.total_late_fee != null && (
              <>
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
                    <Typography fontWeight="bold">
                      Late fee assessed on{" "}
                      {lastBillInfo?.last_late_fee?.transaction_date
                        ? formatToMMDDYYYY(lastBillInfo.last_late_fee.transaction_date, false, true)
                        : ""}
                    </Typography>
                    <Typography fontWeight="bold" color="red">
                      {formatCurrency(lastBillInfo?.last_late_fee_count?.total_late_fee)}
                    </Typography>
                  </Grid>
                </Box>

                {/* Total invoice amount plus new late fee */}
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
                    <Typography fontWeight="bold">
                      Total invoice amount plus new late fee
                    </Typography>
                    <Typography fontWeight="bold">
                      {formatCurrency(
                        Number(lastBillInfo?.last_bill?.amount || 0) +
                          Number(lastBillInfo?.last_late_fee_count?.total_late_fee || 0)
                      )}
                    </Typography>
                  </Grid>
                </Box>
              </>
            )}
          </Stack>
        </Grid>

        {/* Right Side */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Box
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 2,
              p: { xs: 3, sm: 4 },
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              INVOICE NO: {lastBillInfo?.last_bill?.invoice_number}
            </Typography>

            <Typography variant="body2" mt={3} color="text.secondary">
              Total Account Balance
            </Typography>
            <Typography variant="h3" color={colors.blue} fontWeight="bold" my={1}>
              {formatCurrency(Number(lastBillInfo?.customer?.balance ?? 0))}
            </Typography>

            {!lastBillInfo?.last_bill?.id ? (
              <Typography variant="body2" mt={2} color="red" fontWeight="bold">
                No Invoice found
              </Typography>
            ) : lastBillInfo?.company?.allow_payments == 0 ? (
              <Box
                className="instructions-html"
                sx={{ color: "red", "& a": { color: "red !important", textDecoration: "none" } }}
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
                  py: 1,
                  fontWeight: "bold",
                  backgroundColor: colors.blue,
                  "&:hover": { backgroundColor: colors["blue.3"] },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: "240px",
                }}
              >
                MAKE A PAYMENT
              </Button>
            )}

            {lastBillInfo?.last_bill?.id && (
              <Typography
                onClick={handlePreviewInvoice}
                variant="body2"
                sx={{ textDecoration: "underline", cursor: "pointer", mt: 1.5, color: colors.blue, fontWeight: 500 }}
              >
                PREVIEW INVOICE
              </Typography>
            )}

            {lastBillInfo?.payment_pending && (
              <Typography
                fontWeight="bold"
                variant="body2"
                sx={{ cursor: "pointer", color: "red", mt: 1 }}
              >
                {lastBillInfo?.payment_pending}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
      {previewInvoicePdf && (
        <React.Suspense fallback={null}>
          <CustomModal
            open={previewInvoicePdf}
            onClose={() => setPdfPreviewInvocie(false)}
            id={lastBillInfo?.last_bill?.id}
            invoiceNumber={
              lastBillInfo?.get_invoices?.[0]?.invoice_number ||
              lastBillInfo?.last_bill?.invoice_number
            }
          />
        </React.Suspense>
      )}
      <CustomBackdrop open={paymentLoader} style={{ zIndex: 1300, color: "#fff" }}>
        <Loader />
      </CustomBackdrop>
    </Paper>
  );
}
