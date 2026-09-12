

import React, { memo } from "react";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { Box, Link, Typography } from "@mui/material";
import {  useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Phone, EnvelopeSimple, Globe } from "@phosphor-icons/react/dist/ssr";


// ✅ import your api action
// import { getCompanyDetailsApi } from "@/state/Account/actions";

// ✅ memo — prevents re-render when parent re-renders
const CompanyDetails = memo(function CompanyDetails() {


  const { companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  const location = useLocation();
  const pathname = location.pathname;





  const rawSlug = React.useMemo(
    () => pathname?.split("/")[1],
    [pathname]
  );

  const hasCompanySlug = React.useMemo(
    () =>
      Boolean(
        rawSlug?.startsWith("login-") ||
        rawSlug?.startsWith("register-") ||
        rawSlug?.startsWith("reset-password-") ||
        rawSlug?.startsWith("onetime-payment-") ||
        rawSlug?.startsWith("forgot-login-") ||
        (rawSlug?.startsWith("forgot-") && rawSlug !== "forgot-login") ||
        rawSlug?.startsWith("register-success-")
      ),
    [rawSlug]
  );

  const company = hasCompanySlug ? companyInfo?.company : null;

  const phone = company
    ? `${company?.country ?? ""}${company?.phone ?? ""}`.trim()
    : "";

  const email = company?.email ?? "";

  const website = company?.company_website ?? "";

  const companyUrl =
    company?.company_website_URL ||
    (website
      ? website.startsWith("http://") || website.startsWith("https://")
        ? website
        : `https://${website}`
      : "");

  const hasContactInfo = Boolean(phone || email || website);
  const showContactUs = Boolean(hasCompanySlug && company && hasContactInfo);

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
      {showContactUs && (
        <>
          {/* Contact Us divider */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "80%",
              maxWidth: "700px",
              gap: 2,
            }}
          >
            <Box
              sx={{
                flex: 1,
                height: "1px",
                backgroundColor: "#d0d8e8",
              }}
            />
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
            <Box
              sx={{
                flex: 1,
                height: "1px",
                backgroundColor: "#d0d8e8",
              }}
            />
          </Box>

          {/* Contact icons row */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: "12px", sm: "32px" },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            {/* Phone — opens native dialer */}
            {phone && (
              <Box
                component="a"
                href={`tel:${phone}`}
                sx={{ ...contactItemStyle, textDecoration: "none" }}
              >
                <Box sx={iconBoxStyle}>
                  <Phone size={18} color={colors.blue} weight="regular" />
                </Box>
                <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
                  {phone}
                </Typography>
              </Box>
            )}

            {/* Email — opens mail client */}
            {email && (
              <Box
                component="a"
                href={`mailto:${email}`}
                sx={{ ...contactItemStyle, textDecoration: "none" }}
              >
                <Box sx={iconBoxStyle}>
                  <EnvelopeSimple size={18} color={colors.blue} weight="regular" />
                </Box>
                <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
                  {email}
                </Typography>
              </Box>
            )}

            {/* Website — opens in new tab */}
            {website && (
              <Box
                component="a"
                href={companyUrl || (website.startsWith("http") ? website : `https://${website}`)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...contactItemStyle, textDecoration: "none" }}
              >
                <Box sx={iconBoxStyle}>
                  <Globe size={18} color={colors.blue} weight="regular" />
                </Box>
                <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
                  {website}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* ✅ Logo — eager + high priority = fixes LCP */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <img
          alt="Intuity"
          height={36}
          width={231}
          src="/assets/intuity-footer.png"
          loading="eager"
          fetchPriority="high"
        />
      </Box>

      <Link
        href="https://pay.waterbill.com/terms-of-use"
        target="_blank"
        underline="always"
        sx={{
          color: colors.blue,
          fontSize: "0.875rem",
          mt: "-10px",
        }}
      >
        Terms of use
      </Link>
    </Box>
  );
});

export default CompanyDetails;