import React, { useEffect, useState } from "react";

import { getCompanyDetails } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import {
  Avatar,
  Backdrop,
  Box,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";

import { useDispatch, useSelector } from "react-redux";

import Button from "../CommonComponents/Button";
import { Logo } from "../core/logo";
import { ResetPasswordForm } from "./reset-password-form";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { Link, useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import OneTimePaymentModal from "./onetime-payment-modal";
import { SkeletonWrapper } from "../core/withSkeleton";
import { useLoading } from "../core/skeletion-context";
import RegisterSuccess from "./RegisterSuccess";
import { useTheme } from "@mui/material/styles";
import { UpdatePasswordScreen } from "../dashboard/account/UpdatePasswordScreen";
import { ForgotLoginForm } from "./forget-login-form";
import OneTimePaymentScreen from "./onetime-payment-screen";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
import { ClipboardText } from "@phosphor-icons/react/dist/ssr/ClipboardText";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Info } from "@phosphor-icons/react";


export default function PaymentInfoSection() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const [onetimePaymentModalOpen, setOneTimePaymentModalOpen] = useState(false);
  const { accountLoading, companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  const routeChecker = useSelector(
    (state: RootState) => state?.DashBoard?.routeChecker
  );
const [showFullText, setShowFullText] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const slug = pathname?.split("/")[1];
  console.log(slug, 'fdeffgfgffg')
  const hasCompanySlug =
    slug?.startsWith("login-") || slug?.startsWith("register-") || slug?.startsWith("reset-password-") || slug?.startsWith("onetime-payment-") ||
    slug?.startsWith("forgot-") && slug !== 'forgot-login';

  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    const formData = new FormData();

    // if (
    //   pathname?.split("/")[1] !== "login" &&
    //   pathname?.split("/")[1]?.includes("login-")
    // ) {
    //   formData.append("alias", pathname?.split("/")[1]?.split("login-")[1]);
    //   dispatch(
    //     getCompanyDetails(formData, undefined, failureCallBack, () => {
    //       setContextLoading(false);
    //     })
    //   );
    // } else {
    //   setContextLoading(false);
    // }

    const slug = pathname?.split("/")[1];



    if (slug?.startsWith("login-") || slug?.startsWith("register-") || slug?.startsWith("onetime-payment-")||
  slug?.startsWith("forgot-login-")
  ) {
      const alias = slug.replace('forgot-login-', '').replace("login-", "").replace("register-success-", "").replace("register-", "").replace('onetime-payment-', '')

      formData.append("alias", alias);

      dispatch(
        getCompanyDetails(formData, undefined, failureCallBack, () => {
          setContextLoading(false);
        })
      );
    } else {
      setContextLoading(false);
    }

  }, []);
  const failureCallBack = () => {
    navigate("/login");
  };
  // useEffect(() => {
  //   if (
  //     pathname !== "/login" &&
  //     pathname !== "/sign-up" &&
  //     pathname !== "/reset-password" &&
  //     !pathname?.includes("login-") &&
  //      !pathname?.includes("register-")
  //   ) {
  //     navigate("/login");
  //   }
  // }, [pathname]);

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

    if (!allowed) {
      navigate("/login");
    }
  }, [pathname]);

  // const getRequiredForms = () => {
  //   const pathSplit = pathname?.split("/");
  //   if (pathSplit[1] == "reset-password") {
  //     return <ResetPasswordForm />;
  //   }
  //   if (pathname?.includes("login")) {
  //     return <SignInForm user={true} />;
  //   }
  //   if (pathname?.includes("sign-up")) {
  //     return <SignUpForm />;
  //   }
  // };

  const getRequiredForms = () => {
    const pathSplit = pathname?.split("/");

    if (pathname?.includes("onetime-payment")) {
      return <OneTimePaymentScreen />;
    }
    if (pathname?.includes("reset-password")) {
      return <ResetPasswordForm />;
    }
    if (pathname?.includes("forgot-login")) {
      return <ForgotLoginForm />;
    }
    if (pathname?.includes("update-password")) {
      return <UpdatePasswordScreen />;
    }

    if (pathname.includes("login-")) {
      return <SignInForm user={true} />;
    }

    if (pathname.includes("login")) {
      return <SignInForm user={true} />;
    }
    if (pathname.includes("register-success-")) {
      return <RegisterSuccess />;
    }
    if (pathname.includes("register") || pathname === "/sign-up") {
      return <SignUpForm />;
    }

  };

  const pathSplit = pathname?.split("/");


  const getRequiredText = () => {
    if (pathSplit[1]?.includes("register-success")) {
      return "Register Success";
    }
    if (pathname?.includes("onetime-payment")) {
      return 'One Time Payment';
    }
    if (pathSplit[1]?.includes("reset-password")) {
      return "Reset password";
    }
    if (pathSplit[1]?.includes("forgot-login")) {
      return "Forgot Login";
    }
    if (pathSplit[1]?.includes("update-password")) {
      return "Update password";
    }
    if (pathname?.includes("login")) {
      return "Login";
    }
    if (pathname?.includes("sign-up")) {
      return "Sign Up Request";
    }
  };

  const rawHTML =
    companyInfo?.company?.optional_instructions ??
    `<p><a href="https://www.google.com">Google</a>&nbsp;
       <a href="https://test-web.pay.waterbill.com/">
         https://test-web.pay.waterbill.com/
       </a>
     </p>`;

  const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
    ADD_ATTR: ["target", "rel"],
  });

  // force links to open in new tab
  const finalHTML = sanitizedHTML.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  );


  const handlePayNow = () => {
    navigate(paths.auth.oneTimePayment(companyInfo?.company?.alias));

  }
  const rawMessage = companyInfo?.company?.biller_login_page_message;

  const getImportantAlert=()=>{




  // HTML string: sanitize and render
  const sanitized = DOMPurify.sanitize(rawMessage);

  return (
    <>
      {/* Desktop */}
      <Box
        component="span"
        sx={{ display: { xs: "none", sm: "inline" } }}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />

      {/* Mobile */}
      <Box
        component="span"
        sx={{ display: { xs: "inline", sm: "none" } }}
      >
        {showFullText ? (
          <Box
            component="span"
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        ) : (
          // Strip tags for truncated preview
          <>{DOMPurify.sanitize(rawMessage, { ALLOWED_TAGS: [] }).slice(0, 60).trimEnd()}...</>
        )}
      </Box>
    </>
  );

  }
  return (
    <SkeletonWrapper>
      <Box
        sx={{
          // backgroundImage: !reset
          //   ? 'url(/assets/depositphotos_527571100-stock-photo-water-splash-isolated-on-white.jpg)'
          //   : 'url(/assets/pngtree-a-drop-of-water-background-material-in-the-ocean-image_140350.jpg)',
          // backgroundColor: "#f9fafb",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#0d1b2a",
          py: 2,
          // px: 2,
          px: { xs: 0, sm: 2 },  // 0 below 600px, 2 above
          paddingBottom: 0,
        }}
      >
        <Stack sx={{ maxWidth: "100%", mx: "auto" }}>
          <Grid
            container
            sx={{ maxWidth: "1440px", width: "90%", mx: "auto", }}
            mt={0}
            columnSpacing={3} // space between columns
            rowSpacing={3} // space between rows (on small screens)
            justifyContent="space-between"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",

                // marginLeft: 'auto',
              }}
            >

              {hasCompanySlug ? (
                companyInfo?.company?.logo ?
                  <Avatar
                    src={companyInfo?.company?.logo}
                    sx={{ width: 80, height: 80, mr: 1.5 }}
                  /> : null
              ) : (
                <Box


                  onClick={() => {
                    if (routeChecker) {
                      const confirmLeave = window.confirm(
                        "You have unsaved changes. Are you sure you want to leave this page?"
                      );
                      if (confirmLeave) {
                        return navigate(paths.auth.newLogin())
                      }
                    }
                    else {

                      navigate(paths.auth.newLogin())
                    }
                  }}
                  sx={{ display: "inline-flex" }}
                >
                  <Logo color="dark" height={50} width={140} />
                </Box>
              )}

              {hasCompanySlug && (
                <Box sx={{ display: "flex", flexDirection: "column", mr: 1 }}>
                  <Typography variant="h5" noWrap>
                    {companyInfo?.company?.company_name}
                  </Typography>

                </Box>
              )}
            </Box>
          </Grid>

          {(pathname === "/login" || pathname.includes("login-")) &&
            !pathname.includes("forgot-login") && rawMessage && (
              <Box
                sx={{
                  px: { xs: 2.5, sm: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    // backgroundColor: "#FFF9C4",
                    // border: "1px solid #FAEA8F",
                    borderRadius: "10px",
                    px: 2,
                    py: 1.5,
                    mt: 2,
                    mb: 1.5,
                    maxWidth: "700px",
                    mx: "auto",
                    textAlign: "left",
                    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Info
                    size={20}
                    color={colors.blue}
                    weight="regular"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />

                  <Typography variant="body2" color="text.primary">
                    <strong>Announcements:</strong>{" "}  
                    <>
{getImportantAlert()}
</>
  <Box
    component="span"
    onClick={() => setShowFullText(!showFullText)}
    sx={{
      color: colors.blue,
      cursor: "pointer",
      fontWeight: 600,
      ml: 0.5,
      display: { xs: "inline", sm: "none" },
    }}
  >
    {showFullText ? "Read less" : "Read more"}
  </Box>
                  </Typography>
                </Box>
              </Box>
            )}

          <Grid
            container


            sx={{ maxWidth: "1440px", width:{xs:"90%", sm:"95%"}, height: "100%", mx: "auto" }}

            py={1.9}

            pb={2.4}

            justifyContent={
              pathname?.split("/")[1] !== "login" && pathname?.includes("login") &&
                !pathname?.includes("forgot")

                ? "space-between"
                : "center"
            }
          >
            <Grid item xs={12} md={6}>
              <Grid
                // elevation={3}
                sx={{

                  overflow: "hidden",
                  width: "100%",
                  height: "100%",

                  marginTop: 0,
                  border: "1px solid #eaecf0",
                  borderRadius: "16px",
                  boxShadow: "0px 2px 16px rgba(99, 132, 200, 0.08), 0px 1px 4px rgba(0,0,0,0.04)",

                  backgroundColor: "#fff",
                }}
              >

                <CardContent
                  sx={{
                    p: {
                      xs: 3,
                      sm: 4,
                    },
                  }}>
                  {getRequiredForms()}


                </CardContent>
              </Grid>
            </Grid>
            {pathname?.split("/")[1] !== "login" &&
              pathname?.includes("login") &&
              !pathname?.includes("forgot")

              && (
                <>

                  <Grid
                    xs={12}
                    md={6}
                    sx={{
                      display: { xs: "none", md: "block" },  // 👈 Add this line

                      // borderRight: '1px solid #e0e0e0',
                      pl: { xs: 0, md: "20px" },
                      pt: { xs: "20px", md: 0 },
                      // border: '1px solid #e0e0e0',
                      // borderTop: '0px',
                      maxWidth: "1440px",
                      width: "90%",
                      mx: "auto",

                    }}
                  >
                    <Box
                      sx={{
                        overflow: "hidden",
                        width: "100%",
                        height: "100%",
                        border: "1px solid #eaecf0",
                        borderRadius: "16px",
                        boxShadow: "0px 2px 16px rgba(99, 132, 200, 0.08), 0px 1px 4px rgba(0,0,0,0.04)",
                        backgroundColor: "#fff",
                        px: { xs: 3, sm: 4 },
                        py: { xs: 3, sm: 4 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            backgroundColor: "#e6f4ea",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CreditCard size={28} color="#2e7d32" weight="regular" />
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="#0d1b3e">
                          Pay as Guest
                        </Typography>
                      </Box>

                      <Divider sx={{ borderColor: "#212636", opacity: "30%" }} />

                      {/* Feature 1 - Quick & Easy */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "14px",
                            backgroundColor: "#eef2fb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ClipboardText size={28} color={colors.blue} weight="regular" />
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={700} color="#0d1b3e" mb={0.5}>
                            Quick & Easy
                          </Typography>
                          <Typography fontSize={"14px"} variant="body1" color="text.secondary">
                            No registration or login required! Pay your bill in just a few easy
                            steps. All you need is your account number, original billing invoice
                            amount, and email address.
                          </Typography>
                        </Box>
                      </Box>

                      {/* Feature 2 - Instant Confirmation */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "14px",
                            backgroundColor: "#eef2fb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <EnvelopeSimple size={28} color={colors.blue} weight="regular" />
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={700} color="#0d1b3e" mb={0.5}>
                            Instant Confirmation
                          </Typography>
                          <Typography fontSize={"14px"} variant="body1" color="text.secondary">
                            Payments made will be posted to your account during business hours.
                            For each payment you will receive an email confirmation for your
                            records.
                          </Typography>
                        </Box>
                      </Box>



                      {/* Pay Now Button */}
                      <Box
                        mt={'auto'}
                      >
                        {companyInfo?.company?.allow_payments == 0 ? (
                          <Box
                            className="instructions-html"
                            sx={{ "& a": { color: "red !important", textDecoration: "none" } }}
                            dangerouslySetInnerHTML={{ __html: finalHTML }}
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="contained"
                            onClick={handlePayNow}
                            style={{
                              borderRadius: "12px",
                              height: "48px",
                              width: "160px",
                              backgroundColor: colors.blue,
                              fontSize: "1rem",
                              fontWeight: 600,

                            }}
                            textTransform='none'
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors["blue.3"])}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.blue)}
                          >
                            <CreditCard size={20} style={{ marginRight: 8 }} weight="regular" />
                            Pay Now
                          </Button>
                        )}
                      </Box>


                    </Box>

                  </Grid>

                  {/* Mobile View */}

                  <Grid
                    xs={12}
                    md={6}
                    sx={{
                      display: { xs: "block", md: "none" },  // 👈 Add this line

                      // borderRight: '1px solid #e0e0e0',
                      pl: { xs: 0, md: "20px" },
                      pt: { xs: "20px", md: 0 },
                      // border: '1px solid #e0e0e0',
                      // borderTop: '0px',
                      maxWidth: "1440px",
                      width: "90%",
                      mx: "auto",

                    }}
                  >
                    <Box
                      sx={{
                        overflow: "hidden",
                        width: "100%",
                        height: "100%",
                        border: "1px solid #eaecf0",
                        borderRadius: "16px",
                        boxShadow: "0px 2px 16px rgba(99, 132, 200, 0.08), 0px 1px 4px rgba(0,0,0,0.04)",
                        backgroundColor: "#fff",
                        px: { xs: 3, sm: 4 },
                        py: { xs: 3, sm: 4 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            backgroundColor: "#e6f4ea",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CreditCard size={28} color="#2e7d32" weight="regular" />
                        </Box>
                        <Box>

                        <Typography variant="h5" fontWeight={700} color="#0d1b3e">
                          Pay as Guest
                        </Typography>
                         <Typography variant="body2" color="text.secondary">
                                   No registration or login required!
                                </Typography>
                        </Box>


                      </Box>
                      {/* <Typography fontSize={"14px"} variant="body1" color="text.secondary">
                        No registration or login required! Pay your bill in just a few easy
                        steps.
                      </Typography> */}

                      {/* Pay Now Button */}
                      <Box
                        mt={'auto'}
                      >
                        {companyInfo?.company?.allow_payments == 0 ? (
                          <Box
                            className="instructions-html"
                            sx={{ "& a": { color: "red !important", textDecoration: "none" } }}
                            dangerouslySetInnerHTML={{ __html: finalHTML }}
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="contained"
                            onClick={handlePayNow}
                            style={{
                              borderRadius: "12px",
                              height: "48px",
                              width: "160px",
                              backgroundColor: colors.blue,
                              fontSize: "1rem",
                              fontWeight: 600,

                            }}
                            textTransform='none'
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors["blue.3"])}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.blue)}
                          >
                            <CreditCard size={20} style={{ marginRight: 8 }} weight="regular" />
                            Pay Now
                          </Button>
                        )}
                      </Box>


                    </Box>

                  </Grid>
                </>
              )}{" "}
          </Grid>

          {(pathname === "/login" || pathname.includes("login-")) &&
            !pathname.includes("forgot-login") && (
              <Box
                sx={{
                  px: { xs: 2.5, sm: 0 },
                }}
              >
                <Box
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
                    mb: 1.5,
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
                </Box>
              </Box>
            )}
        </Stack>
        <Backdrop open={accountLoading} style={{ zIndex: 1300, color: "#fff" }}>
          <CircularProgress color="success" />
        </Backdrop>

        <OneTimePaymentModal
          open={onetimePaymentModalOpen}
          onClose={() => setOneTimePaymentModalOpen(false)}
        />
      </Box>
    </SkeletonWrapper>
  );
}
