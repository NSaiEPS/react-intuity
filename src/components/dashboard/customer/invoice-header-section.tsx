import * as React from "react";
import { Grid, Stack, Typography } from "@mui/material";
import HeaderSectionReact from "../layout/header-section-react";

interface InvoiceHeaderSectionProps {
  companyName?: string;
  invoiceSubheadline?: string;
  invoiceTextHeaderEmail?: string;
  companyWebsite?: string;
  invoiceTextHeaderWeb?: string;
}

export function InvoiceHeaderSection({
  companyName,
  invoiceSubheadline,
  invoiceTextHeaderEmail,
  companyWebsite,
  invoiceTextHeaderWeb,
}: InvoiceHeaderSectionProps): React.JSX.Element {
  return (
    <Grid container spacing={2} sx={{ px: 1.5 }}>
      <Grid item xs={12} sm={6}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: 18, sm: 20, md: 18 },
            letterSpacing: 0.4,
          }}
        >
          {companyName}
        </Typography>
        <Typography sx={{ color: "#999", fontSize: "16px", mt: 1 }}>{invoiceSubheadline}</Typography>
        <Typography sx={{ color: "#888", fontSize: "16px", mt: 1, mb: 2 }}>{invoiceTextHeaderEmail}</Typography>
      </Grid>

      <Grid item xs={12} sm={6} sx={{ textAlign: { xs: "left", sm: "right" } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="flex-end"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <HeaderSectionReact
            customerDetails={{
              company_website: companyWebsite,
              company_phone: invoiceTextHeaderWeb,
              company_email: invoiceTextHeaderEmail,
            }}
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
