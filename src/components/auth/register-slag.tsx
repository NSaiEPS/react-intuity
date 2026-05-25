import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { getCompanyDetails } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import {
  Avatar, Backdrop, Box, CardContent, CircularProgress,
  Divider, Grid, Stack, Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { SkeletonWrapper } from "../core/withSkeleton";
import { useLoading } from "../core/skeletion-context";
import { useTheme } from "@mui/material/styles";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
import { ClipboardText } from "@phosphor-icons/react/dist/ssr/ClipboardText";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Info } from "@phosphor-icons/react";
import { Logo } from "../core/logo";
import Button from "../CommonComponents/Button";

// ✅ lazy load heavy components — not needed on first paint
const OneTimePaymentModal = React.lazy(() => import("./onetime-payment-modal"));
const SignInForm = React.lazy(() => import("./sign-in-form").then(m => ({ default: m.SignInForm })));
const SignUpForm = React.lazy(() => import("./sign-up-form").then(m => ({ default: m.SignUpForm })));
const ResetPasswordForm = React.lazy(() => import("./reset-password-form").then(m => ({ default: m.ResetPasswordForm })));
const ForgotLoginForm = React.lazy(() => import("./forget-login-form").then(m => ({ default: m.ForgotLoginForm })));
const UpdatePasswordScreen = React.lazy(() => import("../dashboard/account/UpdatePasswordScreen").then(m => ({ default: m.UpdatePasswordScreen })));
const RegisterSuccess = React.lazy(() => import("./RegisterSuccess"));

// Reserves the form card height while lazy chunks load — prevents CLS jump from 0px → full form
const FormFallback = () => (
  <Box sx={{ minHeight: 340 }} />
);
const OneTimePaymentScreen = React.lazy(() => import("./onetime-payment-screen"));

// ✅ memo — stops re-renders from parent
const MainSection = memo(function MainSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [onetimePaymentModalOpen, setOneTimePaymentModalOpen] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const { accountLoading, companyInfo } = useSelector((state: RootState) => state?.Account);
  const routeChecker = useSelector((state: RootState) => state?.DashBoard?.routeChecker);

  const location = useLocation();
  const pathname = location.pathname;

  // ✅ useMemo — not recomputed every render
  const slug = useMemo(() => pathname?.split("/")[1], [pathname]);

  const hasCompanySlug = useMemo(() =>
    slug?.startsWith("login-") ||
    slug?.startsWith("register-") ||
    slug?.startsWith("reset-password-") ||
    slug?.startsWith("onetime-payment-") ||
    (slug?.startsWith("forgot-") && slug !== "forgot-login"),
    [slug]
  );

  const { setContextLoading } = useLoading();

  // Only show skeleton when we actually need to fetch company data.
  // For plain /login (no slug) there's no API call → no skeleton → no CLS.
  React.useLayoutEffect(() => {
    if (hasCompanySlug) {
      setContextLoading(true);
    }
  }, []);

  useEffect(() => {
    const formData = new FormData();
    if (
      slug?.startsWith("login-") ||
      slug?.startsWith("register-") ||
      slug?.startsWith("onetime-payment-") ||
      slug?.startsWith("forgot-login-")
    ) {
      const alias = slug
        .replace("forgot-login-", "")
        .replace("login-", "")
        .replace("register-success-", "")
        .replace("register-", "")
        .replace("onetime-payment-", "");
      formData.append("alias", alias);
      dispatch(getCompanyDetails(formData, undefined, failureCallBack, () => {
        setContextLoading(false);
      }));
    } else {
      setContextLoading(false);
    }
  }, []); // ✅ removed slug dep — only run on mount

  useEffect(() => {
    const allowed =
      pathname === "/login" ||
      pathname === "/sign-up" ||
      pathname?.includes("/reset-password") ||
      pathname?.includes("/forgot-login") ||
      pathname?.includes("/update-password") ||
      pathname.includes("login-") ||
      pathname.includes("register-success-") ||
      pathname.includes("register-") ||
      pathname.includes("onetime-payment-");

    if (!allowed) navigate("/login");
  }, [pathname]);

  const failureCallBack = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // ✅ useCallback — stable function reference
  const handlePayNow = useCallback(() => {
    navigate(paths.auth.oneTimePayment(companyInfo?.company?.alias));
  }, [navigate, companyInfo?.company?.alias]);

  // ✅ useMemo — DOMPurify runs once not every render
  const { sanitizedHTML, finalHTML } = useMemo(() => {
    const rawHTML = companyInfo?.company?.optional_instructions ??
      `<p><a href="https://www.google.com">Google</a></p>`;
    const sanitized = DOMPurify.sanitize(rawHTML, { ADD_ATTR: ["target", "rel"] });
    const final = sanitized.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    return { sanitizedHTML: sanitized, finalHTML: final };
  }, [companyInfo?.company?.optional_instructions]);

  const rawMessage = companyInfo?.company?.biller_login_page_message;

  const plainText = useMemo(() =>
    rawMessage ? DOMPurify.sanitize(rawMessage, { ALLOWED_TAGS: [] }).trim() : "",
    [rawMessage]
  );

  const getRequiredForms = () => {
    if (pathname?.includes("onetime-payment")) return (
      <React.Suspense fallback={<FormFallback />}><OneTimePaymentScreen /></React.Suspense>
    );
    if (pathname?.includes("reset-password")) return (
      <React.Suspense fallback={<FormFallback />}><ResetPasswordForm /></React.Suspense>
    );
    if (pathname?.includes("forgot-login")) return (
      <React.Suspense fallback={<FormFallback />}><ForgotLoginForm /></React.Suspense>
    );
    if (pathname?.includes("update-password")) return (
      <React.Suspense fallback={<FormFallback />}><UpdatePasswordScreen /></React.Suspense>
    );
    if (pathname.includes("login")) return (
      <React.Suspense fallback={<FormFallback />}><SignInForm user={true} /></React.Suspense>
    );
    if (pathname.includes("register-success-")) return (
      <React.Suspense fallback={<FormFallback />}><RegisterSuccess /></React.Suspense>
    );
    if (pathname.includes("register") || pathname === "/sign-up") return (
      <React.Suspense fallback={<FormFallback />}><SignUpForm /></React.Suspense>
    );
  };

  const getImportantAlert = useCallback(() => {
    const sanitized = DOMPurify.sanitize(rawMessage ?? "");
    const isLong = plainText.length > 80;
    return (
      <Box component="span" sx={{ display: "block" }}>
        <Box
          component="span"
          sx={{
            "& p": { display: "inline", margin: 0 },
            "& *": { display: "inline" },
            ...(isLong && !showFullText
              ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
              : { display: "block" }),
          }}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
        {isLong && (
          <Box
            component="span"
            onClick={() => setShowFullText(!showFullText)}
            sx={{ color: colors.blue, cursor: "pointer", fontWeight: 600, display: "inline-block", mt: 0.5 }}
          >
            {showFullText ? "Read less" : "Read more"}
          </Box>
        )}
      </Box>
    );
  }, [rawMessage, plainText, showFullText]);

  const isLoginPath = pathname === "/login" || pathname.includes("login-");
  const showPayAsGuest = slug !== "login" && pathname?.includes("login") && !pathname?.includes("forgot");

  return (
    <SkeletonWrapper>
      <Box sx={{ backgroundSize: "cover", backgroundPosition: "center", color: "#0d1b2a", py: 2, px: { xs: 0, sm: 2 }, paddingBottom: 0 }}>
        <Stack sx={{ maxWidth: "100%", mx: "auto" }}>

          {/* Header */}
          <Grid container sx={{ maxWidth: "1440px", width: { xs: "95%", sm: "92%", md: "90%" }, mx: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "center", alignItems: "center", textAlign: { xs: "center", sm: "left" }, width: "100%", gap: { xs: 1.5, sm: 2 }, px: 1 }}>
              {hasCompanySlug ? (
                // Always reserve the avatar slot — avoids layout shift when logo loads from API
                <Avatar
                  src={companyInfo?.company?.logo || undefined}
                  sx={{
                    width: { xs: 56, sm: 70, md: 80 },
                    height: { xs: 56, sm: 70, md: 80 },
                    flexShrink: 0,
                    visibility: companyInfo?.company?.logo ? "visible" : "hidden",
                  }}
                />
              ) : (
                <Box
                  onClick={() => {
                    if (routeChecker) {
                      if (window.confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
                        navigate(paths.auth.newLogin());
                      }
                    } else {
                      navigate(paths.auth.newLogin());
                    }
                  }}
                  sx={{ display: "inline-flex" }}
                >
                  <Logo color="dark" height={50} width={140} />
                </Box>
              )}

              {hasCompanySlug && (
                <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, wordBreak: "break-word", whiteSpace: "normal", lineHeight: 1.2 }}>
                    {companyInfo?.company?.company_name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Announcement banner */}
          {isLoginPath && !pathname.includes("forgot-login") && rawMessage && (
            <Box sx={{ px: { xs: 2.5, sm: 0 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, borderRadius: "10px", px: 2, py: 1.5, mt: 2, mb: 1.5, maxWidth: "700px", mx: "auto", textAlign: "left", boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)" }}>
                <Info size={20} color={colors.blue} weight="regular" style={{ flexShrink: 0, marginTop: 0 }} />
                <Typography variant="body2" color="text.primary" component="div">
                  <strong>Announcements:</strong> {getImportantAlert()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Main grid */}
          <Grid
            container
            sx={{ maxWidth: "1440px", width: { xs: "90%", sm: "95%" }, height: "100%", mx: "auto" }}
            py={1.9}
            pb={2.4}
            justifyContent={showPayAsGuest ? "space-between" : "center"}
          >
            {/* Form card */}
            <Grid item xs={12} md={6}>
              <Grid sx={{ overflow: "hidden", width: "100%", height: "100%", marginTop: 0, border: "1px solid #eaecf0", borderRadius: "16px", boxShadow: "0px 2px 16px rgba(99, 132, 200, 0.08), 0px 1px 4px rgba(0,0,0,0.04)", backgroundColor: "#fff" }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  {getRequiredForms()}
                </CardContent>
              </Grid>
            </Grid>

            {/* Pay as Guest — desktop + mobile, only when needed */}
            {showPayAsGuest && (
              <>
                {/* Desktop */}
                <Grid xs={12} md={6} sx={{ display: { xs: "none", md: "block" }, pl: { xs: 0, md: "20px" }, pt: { xs: "20px", md: 0 }, maxWidth: "1440px", width: "90%", mx: "auto" }}>
                  <PayAsGuestCard companyInfo={companyInfo} finalHTML={finalHTML} handlePayNow={handlePayNow} showFull />
                </Grid>

                {/* Mobile */}
                <Grid xs={12} md={6} sx={{ display: { xs: "block", md: "none" }, pl: { xs: 0, md: "20px" }, pt: { xs: "20px", md: 0 }, maxWidth: "1440px", width: "90%", mx: "auto" }}>
                  <PayAsGuestCard companyInfo={companyInfo} finalHTML={finalHTML} handlePayNow={handlePayNow} showFull={false} />
                </Grid>
              </>
            )}
          </Grid>

          {/* Important fee notice */}
          {isLoginPath && !pathname.includes("forgot-login") && (
            <Box sx={{ px: { xs: 2.5, sm: 0 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, backgroundColor: "#eff6ff", border: "1px solid #dbeafe", borderRadius: "10px", px: 2, py: 1.5, mt: 1, mb: 1.5, maxWidth: "700px", mx: "auto", textAlign: "left" }}>
                <Info size={20} color={colors.blue} weight="regular" style={{ flexShrink: 0, marginTop: 2 }} />
                <Typography variant="body2" color="text.primary">
                  <strong>Important:</strong> A convenience or service fee may be charged by the payment processor for credit/debit card, e-check or ACH online payments. The fee amount will be displayed before you complete your transaction.
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>

        <Backdrop open={accountLoading} style={{ zIndex: 1300, color: "#fff" }}>
          <CircularProgress color="success" />
        </Backdrop>

        {/* ✅ Only render modal when opened */}
        {onetimePaymentModalOpen && (
          <React.Suspense fallback={null}>
            <OneTimePaymentModal open={onetimePaymentModalOpen} onClose={() => setOneTimePaymentModalOpen(false)} />
          </React.Suspense>
        )}
      </Box>
    </SkeletonWrapper>
  );
});

export default MainSection;

// ✅ extracted — prevents re-render of whole page
const PayAsGuestCard = memo(function PayAsGuestCard({ companyInfo, finalHTML, handlePayNow, showFull }:any) {
  return (
    <Box sx={{ overflow: "hidden", width: "100%", height: "100%", border: "1px solid #eaecf0", borderRadius: "16px", boxShadow: "0px 2px 16px rgba(99, 132, 200, 0.08), 0px 1px 4px rgba(0,0,0,0.04)", backgroundColor: "#fff", px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#e6f4ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CreditCard size={28} color="#2e7d32" weight="regular" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0d1b3e">Pay as Guest</Typography>
          {!showFull && <Typography variant="body2" color="text.secondary">No registration or login required!</Typography>}
        </Box>
      </Box>

      {showFull && (
        <>
          <Divider sx={{ borderColor: "#212636", opacity: "30%" }} />
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "14px", backgroundColor: "#eef2fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ClipboardText size={28} color={colors.blue} weight="regular" />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={700} color="#0d1b3e" mb={0.5}>Quick & Easy</Typography>
              <Typography fontSize="14px" variant="body1" color="text.secondary">No registration or login required! Pay your bill in just a few easy steps. All you need is your account number, original billing invoice amount, and email address.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "14px", backgroundColor: "#eef2fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <EnvelopeSimple size={28} color={colors.blue} weight="regular" />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={700} color="#0d1b3e" mb={0.5}>Instant Confirmation</Typography>
              <Typography fontSize="14px" variant="body1" color="text.secondary">Payments made will be posted to your account during business hours. For each payment you will receive an email confirmation for your records.</Typography>
            </Box>
          </Box>
        </>
      )}

      <Box mt="auto">
        {companyInfo?.company?.allow_payments == 0 ? (
          <Box className="instructions-html" sx={{ "& a": { color: "red !important", textDecoration: "none" } }} dangerouslySetInnerHTML={{ __html: finalHTML }} />
        ) : (
          <Button type="button" variant="contained" onClick={handlePayNow}
            style={{ borderRadius: "12px", height: "48px", width: "160px", backgroundColor: colors.blue, fontSize: "1rem", fontWeight: 600 }}
            textTransform="none"
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors["blue.3"])}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.blue)}
          >
            <CreditCard size={20} style={{ marginRight: 8 }} weight="regular" />
            Pay Now
          </Button>
        )}
      </Box>
    </Box>
  );
});