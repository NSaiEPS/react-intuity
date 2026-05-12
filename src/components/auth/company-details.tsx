import React from "react";

import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { Box, Grid, Link, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";

export default function CompanyDetails({ reset = false }) {
  const { accountLoading, companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  const location = useLocation();
  const pathname = location.pathname;
   const slug = pathname?.split("/")[1];
   const hasCompanySlug =
    slug?.startsWith("login-") || slug?.startsWith("register-") || slug?.startsWith("reset-password-") || slug?.startsWith("onetime-payment-") || slug?.startsWith("forgot-login-") ;

  return (
    <Grid
      container
      sx={{ maxWidth: "1440px", width: "90%", mx: "auto", }}
      py={0}
      columnSpacing={3}
      rowSpacing={3}
      justifyContent="space-between"
      marginTop="auto"
      marginBottom={3}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          width: "100%",
          // backgroundColor: "#f9fafb",
        }}
      >
        <Box
          sx={{
            pt: 2,
            maxWidth: "100%",
            mx: "auto",
            textAlign: "center",
            cursor: "auto",
          }}
        >
          <Stack spacing={1}>

            {/* {pathname?.split("/")[1] !== "login" &&
            (pathname?.includes("login")|| pathname?.includes("register-")||pathname?.includes("reset-password-") )? (
              <Typography variant="body1" >
                <strong style={{ color: colors.blue }}>Contact Us: 📞 </strong>
                {companyInfo?.company?.country}
                {companyInfo?.company?.phone ?? ""} &nbsp;
                &nbsp;📧 {companyInfo?.company?.email ?? ""}
                &nbsp; {companyInfo?.company?.company_website ? "🌐" : ""}
                {companyInfo?.company?.company_website ?? ""} &nbsp;
                
                 
              </Typography>
            ) : (
              <Typography variant="body1" >
                <strong style={{ color: colors.blue }}>Contact Us: </strong>
                📞+1 234 567 8900 &nbsp;&nbsp;&nbsp; &nbsp;
                &nbsp;📧info@intuity.com&nbsp; &nbsp; &nbsp; &nbsp;
                🌐www.intuity.com &nbsp; 
              </Typography>
            )} */}
            {
              (hasCompanySlug ? (
              // <Typography variant="body1">
              //   <strong style={{ color: colors.blue }}>Contact Us: 📞 </strong>

              //   <span style={{ marginRight: "16px" }}>
              //     {companyInfo?.company?.country}
              //     {companyInfo?.company?.phone ?? ""}
              //   </span>

              //   <span style={{ marginRight: "16px" }}>
              //     📧{companyInfo?.company?.email ?? ""}
              //   </span>

              //   {companyInfo?.company?.company_website ? (
              //     <span>
              //       🌐 {companyInfo?.company?.company_website}
              //     </span>
              //   ) : null}
              // </Typography>
              <Typography
  variant="body1"
  sx={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent:"center",
    alignItems: "center",
    gap: "12px",
  }}
>
  <strong style={{ color: colors.blue }}>Contact Us:</strong>

  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      whiteSpace: "nowrap",
    }}
  >
    <span>📞</span>
    <span>
      {companyInfo?.company?.country}
      {companyInfo?.company?.phone ?? ""}
    </span>
  </span>

  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent:"center",
      gap: "4px",
      whiteSpace: "nowrap",
    }}
  >
    <span>📧</span>
    <span>{companyInfo?.company?.email ?? ""}</span>
  </span>

  {companyInfo?.company?.company_website && (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
    >
      <span>🌐</span>
      <span>{companyInfo?.company?.company_website}</span>
    </span>
  )}
</Typography>
            ) : (
              <Typography variant="body1">
                <strong style={{ color: colors.blue }}>Contact Us: </strong>

                <span style={{ marginRight: "16px" }}>
                  📞 +1 234 567 8900
                </span>

                <span style={{ marginRight: "16px" }}>
                  📧 info@intuity.com
                </span>

                <span>
                  🌐 www.intuity.com
                </span>
              </Typography>
            ))}
          </Stack>
        </Box>



        <Box sx={{ mt: 2, maxWidth: "100%", mx: "auto" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            alignItems="flex-start"
            gap={1}
            sx={{
              cursor: "auto",
            }}
          >

          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",

            cursor: "auto",
          }}
        >
          <Box
            alt="logo"
            component="img"
            height={40}
            width={220}
            src={"/assets/intuity-footer.png"}
            loading="lazy"
          />

          <Link
            href="https://pay.waterbill.com/terms-of-use"
            target="_blank"
            underline="always"
            sx={{ color: colors.blue, fontSize: "0.875rem" }}
          >
            Terms of use
          </Link>
        </Box>
      </Box>
    </Grid>
  );
}
