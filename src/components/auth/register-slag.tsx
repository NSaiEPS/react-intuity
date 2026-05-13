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

  const location = useLocation();
  const pathname = location.pathname;
  const slug = pathname?.split("/")[1];
  const hasCompanySlug =
  slug?.startsWith("login-") || slug?.startsWith("register-")||slug?.startsWith("reset-password-") || slug?.startsWith("onetime-payment-")||
  slug?.startsWith("forgot-")   ;
  
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



    if (slug?.startsWith("login-") || slug?.startsWith("register-") || slug?.startsWith("onetime-payment-")) {
      const alias = slug.replace("login-", "").replace("register-success-", "").replace("register-", "").replace('onetime-payment-', '')

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
          <Grid
            container


            sx={{ maxWidth: "1440px", width: "90%", height: "100%", mx: "auto" }}
    
            py={4}

            pb={4}
         
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
                <Grid
                  xs={12}
                  md={6}
                  sx={{
                    display: { md: "block" },  // 👈 Add this line

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
      Make One Time Payment
    </Typography>
  </Box>

  {/* Feature 1 - Quick & Easy */}
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "14px",
        backgroundColor: "#e6f4ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <ClipboardText size={28} color="#2e7d32" weight="regular" />
    </Box>
    <Box>
      <Typography variant="body1" fontWeight={700} color="#0d1b3e" mb={0.5}>
        Quick & Easy
      </Typography>
      <Typography variant="body1" color="text.secondary">
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
      <Typography variant="body1" color="text.secondary">
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
              )}{" "}
          </Grid>
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
