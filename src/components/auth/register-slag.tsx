import React, { useEffect } from "react";

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
// import { CustomBackdrop, Loader } from 'nsaicomponents';
// import { Button, CustomBackdrop, Loader } from 'nsaicomponents';
import { useDispatch, useSelector } from "react-redux";

import Button from "../CommonComponents/Button";
import { Logo } from "../core/logo";
import { ResetPasswordForm } from "./reset-password-form";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { Link, useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";

export default function PaymentInfoSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { accountLoading, companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  const location = useLocation();
  const pathname = location.pathname;

  React.useEffect(() => {
    const formData = new FormData();

    // formData.append('alias', 'cape-royale1');
    // formData.append('alias', 'RiverPark-1');
    // formData.append('alias', 'ctutil');
    // if (pathname?.split('/')[2] === 'ctutil') {
    //   formData.append('alias', 'ctutil');
    // }
    // if (pathname?.split('/')[2] === 'RiverPark') {
    //   formData.append('alias', 'RiverPark-1');
    // }
    // if (pathname?.split('/')[2] !== 'ctutil' && pathname?.split('/')[2] !== 'RiverPark') {
    //   formData.append('alias', 'cape-royale1');
    // }

    if (
      pathname?.split("/")[1] !== "login" &&
      pathname?.split("/")[1]?.includes("login-")
    ) {
      // formData.append('alias', pathname?.split('/')[1]);
      formData.append("alias", pathname?.split("/")[1]?.split("login-")[1]);
      dispatch(getCompanyDetails(formData));
    }
  }, []);

  useEffect(() => {
    if (
      pathname !== "/login" &&
      pathname !== "/sign-up" &&
      pathname !== "/reset-password" &&
      !pathname?.includes("login-")
    ) {
      navigate("/login");
    }
  }, [pathname]);
  const getRequiredForms = () => {
    const pathSplit = pathname?.split("/");
    if (pathSplit[1] == "reset-password") {
      return <ResetPasswordForm />;
    }
    if (pathname?.includes("login")) {
      return <SignInForm user={true} />;
    }
    if (pathname?.includes("sign-up")) {
      return <SignUpForm />;
    }
  };
  const pathSplit = pathname?.split("/");

  const getRequiredText = () => {
    if (pathSplit[1] == "reset-password") {
      return "Reset password";
    }
    if (pathname?.includes("login")) {
      return "Login";
    }
    if (pathname?.includes("sign-up")) {
      return "Sign Up Request";
    }
  };
  // let time;
  // const search = (search) => {
  //   if (time) {
  //     clearTimeout(time);
  //   }

  //   time = setTimeout(() => {
  //     console.log(search);
  //   }, 2000);
  // };

  // search('hi');
  // search('hi1');
  // search('hi2');
  // search('hi3');
  // search('hi4');
  // search('hi5');
  return (
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
              cursor: "pointer",
              width: "100%",
              // marginLeft: 'auto',
            }}
          >
            {pathname?.split("/")[1] !== "login" &&
            pathname?.includes("login") ? (
              <Avatar
                src={companyInfo?.company?.logo}
                sx={{ width: 50, height: 50, mr: 1.5 }}
              />
            ) : (
              <Box
                // component={RouterLink}
                // href={paths.auth.newLogin()}
                onClick={() => navigate(paths.auth.newLogin())}
                sx={{ display: "inline-flex" }}
              >
                <Logo color="dark" height={50} width={140} />
              </Box>
            )}
            {pathname?.split("/")[1] !== "login" &&
              pathname?.includes("login") && (
                <Box sx={{ display: "flex", flexDirection: "column", mr: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {companyInfo?.company?.company_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {companyInfo?.company?.alias}
                  </Typography>
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
              ? 10
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
                {/* <Typography variant="h6" fontWeight={600}> */}
                <Typography variant="h6" fontWeight="bold">
                  {getRequiredText()}
                </Typography>
              </Box>

              {/* Content */}
              <CardContent sx={{ p: 4 }}>
                {getRequiredForms()}

                {/* Divider and action row */}
                {pathname?.split("/")[1] !== "login" &&
                pathname?.includes("login") ? null : (
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
                      minHeight: "380px",
                    }}
                  >
                    <Stack>
                      <Typography variant="body1" marginTop={0}>
                        Pay your bill in a few easy steps. All you need is your
                        account number and original billing invoice amount.
                      </Typography>
                      <Typography variant="body1" marginTop={3}>
                        Payments made will be posted to your account during
                        business hours. For each payment you will receive a
                        confirmation for your records.
                      </Typography>
                      <Typography variant="body1" marginTop={3}>
                        <strong>To view your account details</strong>, use the{" "}
                        <Link
                          to="/sign-up"
                          style={{ color: colors.blue, fontWeight: "bold" }}
                        >
                          Register Now
                        </Link>{" "}
                        feature where you can access billing, payment history,
                        and advanced features like autopay and paperless
                        billing.
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
                        <Button
                          type="button"
                          variant="contained"
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
    </Box>
  );
}
