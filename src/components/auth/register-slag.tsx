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
  slug?.startsWith("login-") || slug?.startsWith("register-")||slug?.startsWith("reset-password-") ;
  
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



if (slug?.startsWith("login-") || slug?.startsWith("register-")) {
  const alias = slug.replace("login-", "").replace("register-success-", "").replace("register-", "")

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
    pathname?.includes("/update-password") ||
    pathname.includes("login-") ||
    pathname.includes("register-success-") ||
    pathname.includes("register-");

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

  if (pathname?.includes("reset-password")) {
    return <ResetPasswordForm />;
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
     if (pathSplit[1]?.includes("reset-password")) {
      return "Reset password";
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

  return (
    <SkeletonWrapper>
      <Box
        sx={{
          // backgroundImage: !reset
          //   ? 'url(/assets/depositphotos_527571100-stock-photo-water-splash-isolated-on-white.jpg)'
          //   : 'url(/assets/pngtree-a-drop-of-water-background-material-in-the-ocean-image_140350.jpg)',
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#0d1b2a",
          py: 2,
          px: 2,
          paddingBottom: 0,
        }}
      >
        <Stack sx={{ maxWidth: "100%", mx: "auto" }}>
          <Grid
            container
            sx={{ maxWidth: "1440px", width: "90%", mx: "auto" }}
            mt={0}
            columnSpacing={3} // space between columns
            rowSpacing={3} // space between rows (on small screens)
            justifyContent="space-between"
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                // marginLeft: 'auto',
              }}
            >
              {/* // pathname?.split("/")[1] !== "login" &&
              //   pathname?.includes("login") ? ( */}
              {hasCompanySlug ? (
                companyInfo?.company?.logo?
                <Avatar
                  src={companyInfo?.company?.logo}
                  sx={{ width: 80, height: 80, mr: 1.5 }}
                />:null
              ) : (
                <Box
                  // component={RouterLink}
                  // href={paths.auth.newLogin()}

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
              {/* {pathname?.split("/")[1] !== "login" &&
                pathname?.includes("login") && ( */}
                {hasCompanySlug && (
                  <Box sx={{ display: "flex", flexDirection: "column", mr: 1 }}>
                    <Typography variant="h5" noWrap>
                      {companyInfo?.company?.company_name}
                    </Typography>
                    {/* <Typography variant="caption" color="text.secondary" noWrap>
                      {companyInfo?.company?.alias}
                    </Typography> */}
                  </Box>
                )}
            </Box>
          </Grid>
          <Grid
            container
            // justifyContent="center"

            sx={{ maxWidth: "1440px", width: "90%", mx: "auto" }}
            py={
              pathname?.split("/")[1] !== "login" && pathname?.includes("login")
                ? 4
                : 0
            }

            pb={5}
            // columnSpacing={3} // space between columns
            // rowSpacing={3} // space between rows (on small screens)
            justifyContent={
              pathname?.split("/")[1] !== "login" && pathname?.includes("login")
                ? "space-between"
                : "center"
            }
          >
            <Grid item xs={12} md={6}>
              <Grid
                // elevation={3}
                sx={{
                  // borderRadius: 3,
                  overflow: "hidden",
                  width: "100%",
                  marginTop:
                    pathname?.split("/")[1] !== "login" &&
                      pathname?.includes("login")
                      ? 0
                      : 5,
                  border: "1px solid #e0e0e0",
                }}
              >
                {/* Header */}
                {
                  !pathSplit[1]?.includes("register-success") &&
                
                <Box
                  sx={{
                    // backgroundColor: '#f5f5f5',
                    backgroundColor: "#e0e0e0",

                    px: 3,
                    py: 2,
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                  }}
                >

                  <Typography variant="h6" fontWeight="bold">
                    {getRequiredText()}
                  </Typography>
                </Box>}

                {/* Content */}
                <CardContent sx={{ p: 4 }}>
                  {getRequiredForms()}

                  {/* Divider and action row */}

                  {pathname?.split("/")[1] !== "login" &&
                    pathname?.includes("login") ||
                    pathSplit[1]?.includes("register-success") ||
                    pathSplit[1]?.includes("update-password") 

                    ? null : (
                    <Divider sx={{ my: 3 }} />
                  )}
                </CardContent>
              </Grid>
            </Grid>
            {pathname?.split("/")[1] !== "login" &&
              pathname?.includes("login") && (
                <Grid
                  xs={12}
                  md={6}
                  sx={{
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
                  <>
                    <Box
                      sx={{
                        backgroundColor: "#e0e0e0",
                        px: 2,
                        py: 1.7,
                        // borderTopLeftRadius: 8,
                        // borderTopRightRadius: 8,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Make One Time Payment
                      </Typography>
                    </Box>
                    <Divider />
                    <CardContent
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderTop: "0px",
  minHeight: {
      xs: "auto",   // 👈 below 900px → no extra space
      md: "381px",  // 👈 ≥900px → keep layout height
    },
                      }}
                    >
                      <Stack>
                        <Typography variant="body1" marginTop={0}>
                         
                          Pay your bill in a few easy steps. All you need is your account number, original billing invoice amount, and email address.
                        </Typography>
                        <Typography variant="body1" marginTop={3}>
                          Payments made will be posted to your account during
                          business hours. For each payment you will receive an email confirmation for your
records.
                        </Typography>
                        <Typography variant="body1" marginTop={3}  marginBottom={3}
       sx={{
    visibility: "hidden", // default (≥900px → keep space)
    [theme.breakpoints.down(900)]: {
      display: "none", // 👈 below 900px → remove space completely
    },
  }}
                        >
                          {/* <strong>To view your account details</strong>, use the{" "} */}
                          <strong>To access your account details</strong>, click {" "}
                             
                          <Link
                            to={
                              companyInfo?.company?.alias?
                              `/register-${companyInfo.company.alias}`:
                              "/sign-up"}
                            style={{
                              color: colors.blue,
                              fontWeight: "bold",
                              textDecoration: "underline",
                            }}
                          >
                            Register Now
                          </Link>{" "}
                         link. This allows you to view billing
information, review your payment history, and take advantage of convenient options like
autopay and paperless billing.
                        </Typography>
                        <Box
                          mt={{
                            xs: 2, // small devices (phones)
                            sm: 2, // tablets and small laptops
                            md: 2, // medium devices (laptops)
                            lg: 3, // large desktops
                            xl: 4, // very large desktops
                          }}
                        >
                          {companyInfo?.company?.allow_payments == 0 ? (
                            <Box
                              className="instructions-html"
                              sx={{
                                "& a": {
                                  color: "red !important", // this WILL override MUI tabs
                                  textDecoration: "none",
                                },
                              }}
                              dangerouslySetInnerHTML={{ __html: finalHTML }}
                            />
                          ) : (
                            <Button
                              type="button"
                              variant="contained"
                              onClick={() => setOneTimePaymentModalOpen(true)}
                              style={{
                                borderRadius: "12px",
                                height: "41px",
                                width: "125px",
                                backgroundColor: colors.blue,

                              }}
                              onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                colors["blue.3"])
                              }
                              onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                colors.blue)
                              }
                            >
                              Pay Now
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </>
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
