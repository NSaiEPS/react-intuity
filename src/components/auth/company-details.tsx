import React from "react";

import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { Box, Grid, Link, Stack, Typography } from "@mui/material";
// import { CustomBackdrop, Loader } from 'nsaicomponents';
// import { Button, CustomBackdrop, Loader } from 'nsaicomponents';
import { useSelector } from "react-redux";
import { useLocation } from "react-router";

export default function CompanyDetails({ reset = false }) {
  const { accountLoading, companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Grid
      container
      sx={{ maxWidth: "1440px", width: "90%", mx: "auto" }}
      py={0}
      columnSpacing={3} // space between columns
      rowSpacing={3} // space between rows (on small screens)
      justifyContent="space-between"
      marginTop="auto"
      marginBottom={3}
    >
      <Box
        sx={{
          // display: 'flex',
          alignItems: "center",
          cursor: "pointer",
          width: "100%",
          // marginLeft: 'auto',
          // backgroundColor: 'red',
        }}
      >
        <Box sx={{ mt: 0, maxWidth: "100%", mx: "auto", marginLeft: "auto" }}>
          <Stack spacing={1}>
            {pathname?.split("/")[1] !== "login" &&
              pathname?.includes("login") && (
                <Typography variant="body2" color="text.secondary">
                  <strong style={{ color: colors.blue }}>
                    {" "}
                    Company Details:{" "}
                  </strong>
                  {companyInfo?.company?.street
                    ? `${companyInfo?.company?.street},`
                    : ""}{" "}
                  {` `} {companyInfo?.company?.time_zone}, {` `}{" "}
                  {companyInfo?.company?.city} {` `}{" "}
                  {companyInfo?.company?.state} {` `}{" "}
                  {companyInfo?.company?.zip} {` `}{" "}
                  {companyInfo?.company?.country}
                  {/* VAT No.: US123456789 */}
                  {/* Company Reg. No: {companyInfo?.company?.reg_no ?? ''}, */}
                  Phone No: {companyInfo?.company?.phone ?? ""}, email :{" "}
                  {companyInfo?.company?.email ?? ""}
                </Typography>
              )}
            <Typography variant="body2" color="text.secondary">
              <strong style={{ color: colors.blue }}>Contact Us: </strong>
              📞+1 234 567 8900 &nbsp;&nbsp;&nbsp; &nbsp;
              &nbsp;📧info@intuity.com&nbsp; &nbsp; &nbsp; &nbsp;
              🌐&nbsp;www.intuity.com &nbsp; 📍&nbsp;1234 Water Ave, Suite 100
              &nbsp; &nbsp; &nbsp; Springfield, IL 62701
            </Typography>
          </Stack>
        </Box>

        {/* <Box sx={{ mt: 2, maxWidth: '85%', mx: 'auto' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              <strong style={{ color: colors.blue }}>Important:</strong> A convenience or service fee may be charged by
              the payment processor for credit/debit card, e-check or ACH online payments. The fee amount will be
              displayed before you complete your transaction.
            </Typography>

            <Typography variant="body2" sx={{ color: colors.blue, fontWeight: 500 }}>
              <Link
                href="https://pay.waterbill.com/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.blue,
                }}
              >
                Terms of use
              </Link>
              : https://pay.waterbill.com/terms-of-use
            </Typography>
          </Stack>
        </Box> */}

        <Box sx={{ mt: 2, maxWidth: "100%", mx: "auto" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            alignItems="flex-start"
            gap={1}
          >
            {/* Left content */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, minWidth: "60%" }}
            >
              <strong style={{ color: colors.blue }}>Important:</strong> A
              convenience or service fee may be charged by the payment processor
              for credit/debit card, e-check or ACH online payments. The fee
              amount will be displayed before you complete your transaction.
            </Typography>

            {/* Right content */}
            <Typography
              variant="body2"
              sx={{
                color: colors.blue,
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginLeft: "auto",
                marginRight: "10px",
              }}
            >
              <Link
                href="https://pay.waterbill.com/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.blue }}
              >
                Terms of use
              </Link>
              : https://pay.waterbill.com/terms-of-use
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}
