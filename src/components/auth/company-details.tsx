import React from "react";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { Box, Link, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Phone, EnvelopeSimple, Globe } from "@phosphor-icons/react/dist/ssr";
import { Info } from "@phosphor-icons/react";

export default function CompanyDetails({ reset = false }) {
  const { companyInfo } = useSelector((state: RootState) => state?.Account);
  const location = useLocation();
  const pathname = location.pathname;
  const slug = pathname?.split("/")[1];
  const hasCompanySlug =
    slug?.startsWith("login-") ||
    slug?.startsWith("register-") ||
    slug?.startsWith("reset-password-") ||
    slug?.startsWith("onetime-payment-") ||
    slug?.startsWith("forgot-login-");

  const phone = hasCompanySlug
    ? `${companyInfo?.company?.country ?? ""}${companyInfo?.company?.phone ?? ""}`
    : "+1 234 567 8900";

  const email = hasCompanySlug
    ? companyInfo?.company?.email ?? ""
    : "info@intuity.com";

  const website = hasCompanySlug
    ? companyInfo?.company?.company_website ?? ""
    : "www.intuity.com";

  const iconBoxStyle = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#e8f0fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const contactItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    whiteSpace: "nowrap",
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: "auto",
        mb: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >

      {/* <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          backgroundColor: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          mt: 1,
          maxWidth: "700px",
          mx: "auto",
          textAlign: "left",
        }}
      >
        <Info
          size={20}
          color={colors.blue}
          weight="regular"
          style={{ flexShrink: 0, marginTop: 2 }}
        />

        <Typography variant="body2" color="text.primary">
          <strong>Important:</strong> A convenience or service fee may be
          charged by the payment processor for credit/debit card, e-check or
          ACH online payments. The fee amount will be displayed before you
          complete your transaction.
        </Typography>
      </Box> */}
      {/* Contact Us with divider lines */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "80%",
          maxWidth: "700px",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, height: "1px", backgroundColor: "#d0d8e8" }} />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: colors.blue,
            whiteSpace: "nowrap",
          }}
        >
          Contact Us
        </Typography>
        <Box sx={{ flex: 1, height: "1px", backgroundColor: "#d0d8e8" }} />
      </Box>

      {/* Contact icons row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* Phone */}
        <Box sx={contactItemStyle}>
          <Box sx={iconBoxStyle}>
            <Phone size={18} color={colors.blue} weight="regular" />
          </Box>
          <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
            {phone}
          </Typography>
        </Box>

        {/* Email */}
        <Box sx={contactItemStyle}>
          <Box sx={iconBoxStyle}>
            <EnvelopeSimple size={18} color={colors.blue} weight="regular" />
          </Box>
          <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
            {email}
          </Typography>
        </Box>

        {/* Website */}
        {website && (
          <Box sx={contactItemStyle}>
            <Box sx={iconBoxStyle}>
              <Globe size={18} color={colors.blue} weight="regular" />
            </Box>
            <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
              {website}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Powered by Intuity */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* <Typography sx={{ fontSize: "1rem", color: "#555", fontWeight: 400 }}>
          powered by
        </Typography> */}
        <Box
          alt="logo"
          component="img"
          height={36}
          // width={160}
          src={"/assets/intuity-footer.png"}
          loading="lazy"
        />
      </Box>

      {/* Terms of use */}
      <Link
        href="https://pay.waterbill.com/terms-of-use"
        target="_blank"
        underline="always"
        sx={{ color: colors.blue, fontSize: "0.875rem", mt: "-10px" }}
      >
        Terms of use
      </Link>
    </Box>
  );
}