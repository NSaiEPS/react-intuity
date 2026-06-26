import * as React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { formatToMMDDYYYY } from "@/utils";

interface InvoiceToBoxProps {
  customer?: {
    customer_name?: string;
    address?: string;
    city?: string;
    email?: string;
    phone?: string;
  };
  billingDate?: string;
  totalDue?: number | string;
}

export function InvoiceToBox({ customer, billingDate, totalDue }: InvoiceToBoxProps): React.JSX.Element {
  return (
    <Grid container spacing={2} alignItems="center" sx={{ px: 1.5 }}>
      <Grid item xs={12} sm={7}>
        <Typography
          sx={{
            color: "#777",
            fontWeight: 600,
            fontSize: { xs: 18, sm: 20, md: 18 },
            mb: 0.6,
          }}
        >
          INVOICE TO
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
          {customer?.customer_name}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "16px", mt: 0.7 }}>
          Billing address: {customer?.address}, {customer?.city}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "16px", mt: 0.7 }}>
          Email: {customer?.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "16px", mt: 0.7 }}>
          Phone: {customer?.phone}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={5} textAlign={{ xs: "left", sm: "right" }} alignSelf="center">
        <Typography
          sx={{
            fontWeight: 700,
            color: "#aaa",
            letterSpacing: 1,
            fontSize: { xs: 18, sm: 20, md: 48 },
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
            padding: 1,
          }}
        >
          <Grid container justifyContent={"space-between"}>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: "16px" }}>Invoice Date:</Typography>
            </Grid>
            <Grid item xs={5} textAlign="right">
              <Typography sx={{ fontSize: "16px" }}>{formatToMMDDYYYY(billingDate, false, false, true)}</Typography>
            </Grid>
            <Grid item xs={6} marginTop={1}>
              <Typography sx={{ fontSize: "16px" }}>Total Due:</Typography>
            </Grid>
            <Grid item xs={6} textAlign="right" marginTop={1}>
              <Typography sx={{ fontSize: "16px" }}>${totalDue}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
