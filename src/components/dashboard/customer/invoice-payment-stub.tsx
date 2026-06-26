import * as React from "react";
import { Box, Grid, Paper, Stack, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { formatToMMDDYYYY } from "@/utils";

interface InvoicePaymentStubProps {
  company?: {
    company_name?: string;
    address?: string;
    street?: string;
    address2?: string;
    city?: string;
    state_abbrev?: string;
    zip?: string;
  };
  customer?: {
    customer_name?: string;
    address?: string;
    address2?: string;
    city?: string;
    state_abbrev?: string;
    zipcode?: string;
    acctnum?: string | number;
  };
  lastBill?: {
    invoice_number?: string;
    due_date?: string;
    amount?: number;
    billing_date?: string;
    late_date?: string;
    late_date_amount?: number;
  };
}

export function InvoicePaymentStub({ company, customer, lastBill }: InvoicePaymentStubProps): React.JSX.Element {
  return (
    <Paper sx={{ py: 3, px: 2, maxWidth: "100%", mx: "auto" }}>
      {/* Dotted tear line */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          letterSpacing: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "clip",
          marginBottom: 1.6,
        }}
      >
        {"- ".repeat(210)}
      </Box>

      <Stack direction="column" sx={{ width: "100%", pb: 2, fontSize: "16px" }}>
        <Typography variant="body2" sx={{ mb: 2.5 }}>
          Please detach and return with your payment. Make Checks Payable to:
          <b> {company?.company_name}</b>
        </Typography>

        <Grid container display={"flex"} justifyContent={"space-between"} marginBottom={2}>
          {/* LEFT — Invoice / Check Number / Amount Paid */}
          <Grid>
            <Box
              sx={{
                border: "1px solid black",
                px: 1.5,
                py: 0.5,
                display: "flex",
                mb: 2,
                width: "360px",
                maxWidth: "360px",
                height: 50,
                alignItems: "center",
              }}
            >
              <Typography variant="body2">
                Invoice#: <b>{lastBill?.invoice_number}</b>
              </Typography>
            </Box>

            <Box
              sx={{
                border: "1px solid black",
                borderBottom: "none",
                p: 1,
                width: "360px",
                maxWidth: "360px",
                height: 50,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">Check Number:</Typography>
            </Box>

            <Box sx={{ border: "1px solid black", p: 1 }}>
              <Typography variant="body2">Amount Paid:</Typography>
            </Box>
          </Grid>

          {/* RIGHT — Bill details table */}
          <Grid>
            <Table size="small" sx={{ border: "1px solid black", borderCollapse: "collapse", width: "100%", mb: 0.5 }}>
              <TableBody>
                <TableRow sx={{ bgcolor: "#e0f0ff" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "15px", borderRight: "1px solid black" }}>
                    ACCOUNT NUMBER
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "15px", borderRight: "1px solid black" }}>
                    DUE DATE
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>AMOUNT DUE</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ borderRight: "1px solid black", fontSize: "15px" }}>{customer?.acctnum}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid black", fontSize: "15px" }}>
                    {formatToMMDDYYYY(lastBill?.due_date, false, false, true)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "15px" }}>${lastBill?.amount}</TableCell>
                </TableRow>

                <TableRow sx={{ bgcolor: "#e0f0ff" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "15px", borderRight: "1px solid black" }}>
                    BILL DATE
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "15px", borderRight: "1px solid black" }}>
                    LATE DATE
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "15px" }}>LATE AMOUNT</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ borderRight: "1px solid black", fontSize: "15px" }}>
                    {formatToMMDDYYYY(lastBill?.billing_date, false, false, true)}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid black", fontSize: "15px" }}>
                    {formatToMMDDYYYY(lastBill?.late_date, false, false, true)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "15px" }}>
                    ${(lastBill?.amount + lastBill?.late_date_amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Stack>

      {/* Company + Customer address row */}
      <Grid container spacing={2} sx={{ mb: 1.5, display: "flex", justifyContent: "space-between" }}>
        {/* LEFT — Company info */}
        <Grid item>
          <Box sx={{ lineHeight: 1.6 }}>
            <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, ml: 0.2 }}>
              {company?.company_name}
            </Typography>
            {(company?.address || company?.street) && (
              <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, ml: 0.2 }}>
                {company?.address} {company?.street}
              </Typography>
            )}
            {company?.address2 && (
              <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, ml: 0.2 }}>
                {company?.address2}
              </Typography>
            )}
            <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 }, ml: 0.2 }}>
              {[company?.city, company?.state_abbrev, company?.zip].filter(Boolean).join(", ")}
            </Typography>
          </Box>
        </Grid>

        {/* RIGHT — Customer info */}
        <Grid item sx={{ width: "455px" }}>
          <Box sx={{ lineHeight: 1.6 }}>
            <Typography component="div" sx={{ fontWeight: 600 }}>
              {customer?.customer_name}
            </Typography>
            {customer?.address && (
              <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
                {customer?.address}
              </Typography>
            )}
            {customer?.address2 && (
              <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
                {customer?.address2}
              </Typography>
            )}
            <Typography component="div" sx={{ fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 18 } }}>
              {[customer?.city, customer?.state_abbrev, customer?.zipcode].filter(Boolean).join(", ")}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
