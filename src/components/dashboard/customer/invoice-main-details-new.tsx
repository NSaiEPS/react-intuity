import * as React from "react";
import { RootState } from "@/state/store";
import { UtilityItem } from "@/utils";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useSelector } from "react-redux";
import { InvoiceHeaderSection } from "./invoice-header-section";
import { InvoiceToBox } from "./invoice-to-box";
import { UtilityBillBlock } from "./utility-bill-block";
import { InvoicePaymentStub } from "./invoice-payment-stub";

export const InvoiceMainDetails = () => {
  const invoiceDetails = useSelector((state: RootState) => state.DashBoard.invoiceDetails);
  const dashboardLoading = useSelector((state: RootState) => state.DashBoard.dashboardLoading);
  const {
    company,
    company_settings,
    customer,
    unique_by_utility = {},
    last_bill = [],
    extra_params = [],
  } = invoiceDetails ?? {};
  const billing = last_bill?.[0];
  const previousBalance = Number(extra_params?.[0]?.amount ?? 0);

  return (
    <Box sx={{ mx: "auto", bgcolor: "#F7F7F7" }}>
      <InvoiceHeaderSection
        companyName={company?.company_name}
        invoiceSubheadline={company_settings?.invoice_subheadline}
        invoiceTextHeaderEmail={company_settings?.invoice_text_header_email}
        companyWebsite={company_settings?.company_url}
        invoiceTextHeaderWeb={company_settings?.invoice_text_header_web}
      />

      <InvoiceToBox customer={customer} billingDate={billing?.billing_date} totalDue={billing?.amount} />

      {Object?.entries(unique_by_utility).map(([key, items]: [string, UtilityItem[]]) => (
        <UtilityBillBlock
          key={key}
          utilityKey={key}
          items={items}
          previousBalance={previousBalance}
          billingAmount={billing?.amount}
        />
      ))}

      {/* ── DO NOT PAY TEXT (autopay) ── */}
      {customer?.autopay ? (
        <Box textAlign="right">
          <Typography sx={{ color: "red", fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
            {invoiceDetails?.autopay_do_not_pay_text}
          </Typography>
        </Box>
      ) : null}

      <Divider sx={{ my: 2 }} />

      {/* ── FOOTER TEXT ROW ── */}
      <Grid container p={2} pt={0} pb={0} display={"flex"} mb={2}>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ color: "#444", fontSize: "16px" }}>{billing?.last_payment_info}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography align="right" sx={{ color: "#444", fontSize: "16px" }}>
            {company_settings?.invoice_footer_column_3}
          </Typography>
        </Grid>
      </Grid>

      <InvoicePaymentStub company={company} customer={customer} lastBill={billing} />

      {/* ── BACKDROP ── */}
      <CustomBackdrop open={dashboardLoading} style={{ zIndex: 1300, color: "#fff" }}>
        <Loader />
      </CustomBackdrop>
    </Box>
  );
};
