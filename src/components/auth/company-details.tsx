// import React, { memo } from "react";
// import { RootState } from "@/state/store";
// import { colors } from "@/utils";
// import { Box, Link, Typography } from "@mui/material";
// import { useSelector } from "react-redux";
// import { useLocation } from "react-router";
// import { Phone, EnvelopeSimple, Globe } from "@phosphor-icons/react/dist/ssr";

// // ✅ memo — prevents re-render when parent re-renders
// const CompanyDetails = memo(function CompanyDetails() {
//   const { companyInfo } = useSelector((state: RootState) => state?.Account);
//   const location = useLocation();
//   const pathname = location.pathname;

//   // ✅ useMemo — slug computed once, not every render
//   const slug = React.useMemo(() => pathname?.split("/")[1], [pathname]);

//   const hasCompanySlug = React.useMemo(() =>
//     slug?.startsWith("login-") ||
//     slug?.startsWith("register-") ||
//     slug?.startsWith("reset-password-") ||
//     slug?.startsWith("onetime-payment-") ||
//     slug?.startsWith("forgot-login-"),
//     [slug]
//   );

//   const phone = hasCompanySlug
//     ? `${companyInfo?.company?.country ?? ""}${companyInfo?.company?.phone ?? ""}`
//     : "+1 234 567 8900";
//   const email = hasCompanySlug ? companyInfo?.company?.email ?? "" : "info@intuity.com";
//   const website = hasCompanySlug ? companyInfo?.company?.company_website ?? "" : "www.intuity.com";
//   const companyUrl = hasCompanySlug ? companyInfo?.company?.company_website_URL ?? "" : "www.intuity.com";

//   const iconBoxStyle = {
//     width: 40,
//     height: 40,
//     borderRadius: "50%",
//     backgroundColor: "#e8f0fb",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   };

//   const contactItemStyle = {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     whiteSpace: "nowrap",
//   };

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         mt: "auto",
//         mb: 3,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         gap: "20px",
//       }}
//     >
//       {/* Contact Us divider */}
//       <Box sx={{ display: "flex", alignItems: "center", width: "80%", maxWidth: "700px", gap: 2 }}>
//         <Box sx={{ flex: 1, height: "1px", backgroundColor: "#d0d8e8" }} />
//         <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: colors.blue, whiteSpace: "nowrap" }}>
//           Contact Us
//         </Typography>
//         <Box sx={{ flex: 1, height: "1px", backgroundColor: "#d0d8e8" }} />
//       </Box>

//       {/* Contact icons row */}
//       <Box
//         sx={{
//           display: "flex",
//           flexWrap: "wrap",
//           justifyContent: "center",
//           alignItems: "center",
//           gap: { xs: "12px", sm: "32px" },
//           flexDirection: { xs: "column", sm: "row" },
//         }}
//       >
//         <Box sx={contactItemStyle}>
//           <Box sx={iconBoxStyle}>
//             <Phone size={18} color={colors.blue} weight="regular" />
//           </Box>
//           <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>{phone}</Typography>
//         </Box>

//         <Box sx={contactItemStyle}>
//           <Box sx={iconBoxStyle}>
//             <EnvelopeSimple size={18} color={colors.blue} weight="regular" />
//           </Box>
//           <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>{email}</Typography>
//         </Box>

//         {website && (
//           <Box
//             sx={{ ...contactItemStyle, cursor: "pointer" }}
//             onClick={() => window.open(companyUrl, "_blank")}
//           >
//             <Box sx={iconBoxStyle}>
//               <Globe size={18} color={colors.blue} weight="regular" />
//             </Box>
//             <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>{website}</Typography>
//           </Box>
//         )}
//       </Box>

//       {/* ✅ Logo — eager + high priority = fixes LCP */}
//       <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
//         <img
//           alt="Intuity"

//           height={36}
//           width={231}
//           src="/assets/intuity-footer.png"
//           loading="eager"
//           fetchPriority="high"    // ✅ LCP fix
//         />
//       </Box>

//       <Link
//         href="https://pay.waterbill.com/terms-of-use"
//         target="_blank"
//         underline="always"
//         sx={{ color: colors.blue, fontSize: "0.875rem", mt: "-10px" }}
//       >
//         Terms of use
//       </Link>
//     </Box>
//   );
// });

// export default CompanyDetails;

import React, { memo, useEffect } from "react";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { Box, Link, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Phone, EnvelopeSimple, Globe } from "@phosphor-icons/react/dist/ssr";
import { getCompanyDetailsApi } from "@/api/dashboard";

// ✅ import your api action
// import { getCompanyDetailsApi } from "@/state/Account/actions";

// ✅ memo — prevents re-render when parent re-renders
const CompanyDetails = memo(function CompanyDetails() {
  const dispatch = useDispatch();

  const { companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );

  const location = useLocation();
  const pathname = location.pathname;


  const [companyData, setCompanyData] = React.useState<any>(null);
  // ✅ useMemo — slug computed once, not every render
  // const slug = React.useMemo(
  //   () => pathname?.split("/")[1],
  //   [pathname]
  // );
  // const slug = React.useMemo(() => pathname?.split("/")[1], [pathname]);
  // console.log(slug, "sliugggg")

  // const hasCompanySlug = React.useMemo(
  //   () =>
  //     slug?.startsWith("login-") ||
  //     slug?.startsWith("register-") ||
  //     slug?.startsWith("reset-password-") ||
  //     slug?.startsWith("onetime-payment-") ||
  //     slug?.startsWith("forgot-login-"),
  //   [slug]
  // );

  const rawSlug = React.useMemo(
  () => pathname?.split("/")[1],
  [pathname]
);

const slug = React.useMemo(() => {
  if (!rawSlug) return "";

  return rawSlug
    .replace("login-", "")
    .replace("register-", "")
    .replace("reset-password-", "")
    .replace("onetime-payment-", "")
    .replace("forgot-login-", "");
}, [rawSlug]);

const hasCompanySlug = React.useMemo(
  () =>
    rawSlug?.startsWith("login-") ||
    rawSlug?.startsWith("register-") ||
    rawSlug?.startsWith("reset-password-") ||
    rawSlug?.startsWith("onetime-payment-") ||
    rawSlug?.startsWith("forgot-login-"),
  [rawSlug]
);

  // ✅ call api again on refresh
// useEffect(() => {
//   const fetchCompany = async () => {
//     if (hasCompanySlug && slug && !companyInfo?.company) {

//       const formData = new FormData();
//       formData.append("alias", slug);

//       const response = await getCompanyDetailsApi({
//         formData,
//       });

//       console.log(response);
//     }
//   };

//   fetchCompany();
// }, [hasCompanySlug, slug, companyInfo]);




useEffect(() => {
  const fetchCompany = async () => {
    if (hasCompanySlug && slug) {
      const formData = new FormData();
      formData.append("alias", slug);

      const response = await getCompanyDetailsApi({
        formData,
      });

      console.log(response);

   if (response?.body?.company) {
  setCompanyData(response.body.company);
}
    }
  };

  fetchCompany();
}, [hasCompanySlug, slug]);

const company = companyData || companyInfo?.company;

  // ✅ wait until api response comes
  // if (hasCompanySlug && !companyInfo?.company) {
  //   return null;
  // }

  // const phone = hasCompanySlug
  //   ? `${companyInfo?.company?.country ?? ""}${
  //       companyInfo?.company?.phone ?? ""
  //     }`
  //   : "+1 234 567 8900";

  // const email = hasCompanySlug
  //   ? companyInfo?.company?.email ?? ""
  //   : "info@intuity.com";

  // const website = hasCompanySlug
  //   ? companyInfo?.company?.company_website ?? ""
  //   : "www.intuity.com";

  // const companyUrl = hasCompanySlug
  //   ? companyInfo?.company?.company_website_URL ?? ""
  //   : "https://www.intuity.com";


const phone = hasCompanySlug
  ? `${company?.country ?? ""}${company?.phone ?? ""}`
  : "+1 234 567 8900";

const email = hasCompanySlug
  ? company?.email ?? ""
  : "info@intuity.com";

const website = hasCompanySlug
  ? company?.company_website ?? ""
  : "www.intuity.com";

const companyUrl = hasCompanySlug
  ? company?.company_website_URL ?? ""
  : "https://www.intuity.com";

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
        <Box sx={contactItemStyle}>
          <Box sx={iconBoxStyle}>
            <Phone size={18} color={colors.blue} weight="regular" />
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "#333", fontWeight: 500 }}
          >
            {phone}
          </Typography>
        </Box>

        <Box sx={contactItemStyle}>
          <Box sx={iconBoxStyle}>
            <EnvelopeSimple
              size={18}
              color={colors.blue}
              weight="regular"
            />
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "#333", fontWeight: 500 }}
          >
            {email}
          </Typography>
        </Box>

        {website && (
          <Box
            sx={{ ...contactItemStyle, cursor: "pointer" }}
            onClick={() => window.open(companyUrl, "_blank")}
          >
            <Box sx={iconBoxStyle}>
              <Globe size={18} color={colors.blue} weight="regular" />
            </Box>

            <Typography
              variant="body2"
              sx={{ color: "#333", fontWeight: 500 }}
            >
              {website}
            </Typography>
          </Box>
        )}
      </Box>

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