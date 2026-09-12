import * as React from "react";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { setUserInfo } from "@/state/features/accountSlice";
import { resetDashboardStore } from "@/state/features/dashBoardSlice";
import { resetPaymentStore } from "@/state/features/paymentSlice";

import { colors } from "@/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";

import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";

import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/lib/custom-toast";

import Button from '../CommonComponents/button-comp';


import { Link, useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { setLocalStorage } from "@/utils/auth";
import { RootState } from "@/state/store";
import { CompanyInfoBody } from "@/types/domain";




const schema = zod.object({
  // email: zod.string().min(1, { message: 'Email is required' }).email(),
  email: zod.string().min(1, { message: "Username is required" }),
  password: zod.string().min(6, { message: "Enter a password with at least 6 characters " }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: "", password: "" } satisfies Values;

export function SignInForm({ user: _user }: { user?: boolean } = {}): React.JSX.Element {
  const navigate = useNavigate();

  const { checkSession } = useUser();
  const location = useLocation();
  const pathname = location.pathname;
  const { companyInfo } = useSelector((state: RootState) => state?.Account);
  console.log(companyInfo, 'successCallBack')
  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  type Values = {
    email: string;
    password: string;
  }

  // const slug = pathname?.split("/")[1];

  // const alias = slug?.split('login-');

  const rawSlug = pathname?.split("/")[1];
  const alias = rawSlug
    ?.replace("login-", "")
    ?.replace("register-", "")
    ?.replace("reset-password-", "")
    ?.replace("onetime-payment-", "")
    ?.replace("forgot-login-", "");

  const hasShownActivationToastRef = React.useRef(false);

  React.useEffect(() => {
    if (hasShownActivationToastRef.current) return;

    const params = new URLSearchParams(location.search);
    const hasActivatedParam =
      params.get("activated") === "true" ||
      params.get("activated") === "1" ||
      params.get("account_activated") === "true" ||
      params.get("account_activated") === "1" ||
      params.get("activation") === "true" ||
      params.get("activation") === "1" ||
      params.get("activation") === "success" ||
      params.get("status") === "activated" ||
      params.get("activate") === "true" ||
      params.get("accountActivated") === "true";

    const hasActivatedState = Boolean(
      (location.state as any)?.accountActivated ||
      (location.state as any)?.activated
    );

    if (hasActivatedState || hasActivatedParam) {
      hasShownActivationToastRef.current = true;
      toast.success("Thank you for activating your account. You may now log in.");

      if (hasActivatedState) {
        window.history.replaceState({}, document.title);
      }
      if (hasActivatedParam) {
        params.delete("activated");
        params.delete("account_activated");
        params.delete("activation");
        params.delete("status");
        params.delete("activate");
        params.delete("accountActivated");
        const newSearch = params.toString() ? `?${params.toString()}` : "";
        navigate(`${pathname}${newSearch}`, { replace: true });
      }
    }
  }, [location.search, location.state, pathname, navigate]);

  const handleRegisterClick = async () => {
    const slug = pathname?.split("/")[1];

    if (slug === "login") {
      navigate("/sign-up");
      return;
    }
    else {
      const alias = slug?.split('login-');

      navigate(`/register-${alias[1]}`);

    }



  };




  const onSubmit: SubmitHandler<Values> = React.useCallback(
    async (values): Promise<void> => {
      setIsPending(true);

      try {
        const { error } = await authClient.signInWithPassword(
          values,
          (res) => successCallBack(res, companyInfo)
        );

        if (error) {
          setError("root", { type: "server", message: error });
          setIsPending(false);
          return;
        }


      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";

        setError("root", { type: "server", message });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, setError, companyInfo]
  );

  const dispatch = useDispatch();

  type AuthResponse = {
    body?: {
      alias?: string;
      is_verified?: number;
      is_two_fa_required?: boolean;
      number_of_days_for_confirmation?: number
    };
  };

  const successCallBack = async (res: AuthResponse, companyInfo: CompanyInfoBody | null) => {
    console.log(pathname, res, companyInfo, 'successCallBack')
    dispatch(resetDashboardStore());
    dispatch(resetPaymentStore());
    dispatch(setUserInfo(res));
    if (pathname?.split("/")[1] !== "login" && pathname?.includes("login")) {

      setLocalStorage("alias-details", companyInfo?.company);

    } else {
      setLocalStorage("alias-details", null);

    }
    const companyAlias = res?.body?.alias || "intuityfe";
    if (res?.body?.is_verified == 1 && !res?.body?.is_two_fa_required && res?.body?.number_of_days_for_confirmation) {
      await checkSession?.();

      if (pathname?.split("/")[2] !== "auth") {
        navigate(paths.dashboard.overview(companyAlias));
      } else {
        navigate(`/${companyAlias}/dashboard`);
      }
    } else {

      navigate(paths.auth.confirmInfo(companyAlias));
    }
  };
  const [usernameFocused, setUsernameFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  return (

    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#e8f0fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={26} color={colors.blue} weight="regular" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Login to access your account
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={0}>
          {/* Username */}
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel shrink={usernameFocused || Boolean(field.value)}
                  sx={{
                    "&:not(.MuiInputLabel-shrink)": {
                      left: "36px", // push placeholder right when not focused/filled
                    },
                  }}
                >
                  Username
                </InputLabel>
                <OutlinedInput
                  {...field}
                  notched={usernameFocused || Boolean(field.value)}
                  label="Username"
                  type="text"
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => {
                    field.onBlur();
                    setUsernameFocused(false);
                  }}
                  startAdornment={
                    <User
                      size={18}
                      color="#9aa5b4"
                      weight="regular"
                      style={{ marginRight: 8 }}
                    />
                  }
                />
                <FormHelperText sx={{ minHeight: "20px" }}>
                  {errors?.email?.message ?? ""}
                </FormHelperText>
              </FormControl>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel shrink={passwordFocused || Boolean(field.value)}
                  sx={{
                    "&:not(.MuiInputLabel-shrink)": {
                      left: "36px", // push placeholder right when not focused/filled
                    },
                  }}
                >
                  Password
                </InputLabel>
                <OutlinedInput
                  {...field}
                  notched={passwordFocused || Boolean(field.value)}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    field.onBlur();
                    setPasswordFocused(false);
                  }}
                  startAdornment={
                    <Lock
                      size={18}
                      color="#9aa5b4"
                      weight="regular"
                      style={{ marginRight: 8 }}
                    />
                  }
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                />
                <FormHelperText sx={{ minHeight: "20px" }}>
                  {errors?.password?.message ?? ""}
                </FormHelperText>
              </FormControl>

            )}
          />

          {/* Important Notice Box */}
          {/* <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            backgroundColor: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: "10px",
            px: 1.5,
            py: 1.5,
            mb: 2,
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

          {/* Register Now */}
          {/* {alias?.[1] && ( */}
          {alias && alias !== 'login' && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Don't have an account?{" "}
              <span
                onClick={handleRegisterClick}
                style={{
                  color: colors.blue,
                  cursor: "pointer",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Register Now
              </span>{" "}
              to view your account details
            </Typography>
          )}

          {errors.root && (
            <Alert color="error" sx={{ mb: 1 }}>
              {errors.root.message}
            </Alert>
          )}

          {/* Divider + links */}
          {/* <Box
            sx={{
              display: "flex",
              alignItems: "center",
              // ml: { xs: 0, sm: 2 },
              mb: 3,
              gap: 1,
            }}
          > */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              mb: 3,
              gap: 1,
            }}
          >
            <Link
              to={paths.auth.resetPassword(
                pathname?.split("/")[1] === "login"
                  ? undefined
                  : pathname?.split("login-")[1]
              )}
              style={{
                color: colors.blue,
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Forgot password?
            </Link>

            <Typography variant="body2" color="text.secondary">
              |
            </Typography>

            <Link
              to={paths.auth.forgotLogin(
                pathname?.split("/")[1] === "login"
                  ? undefined
                  : pathname?.split("login-")[1]
              )}
              style={{
                color: colors.blue,
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Forgot login username?
            </Link>
          </Box>

          {/* Login button + links row */}
          {/* <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 1.5, sm: 0 },
            }}
          > */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              width: "100%",
            }}
          >
            <Button
              disabled={isPending}
              loading={isPending}
              onClick={handleSubmit(onSubmit)}
              type="submit"
              variant="contained"
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{
                borderRadius: "12px",
                height: "44px",
                minWidth: "120px",
                fontWeight: 600,
                fontSize: "1rem",
              }}

            >
              <Lock size={18} style={{ marginRight: 8 }} weight="regular" />
              Login
            </Button>

            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.5,
              }}
            >
              <Link
                to={paths.auth.resetPassword(
                  pathname?.split("/")[1] === "login"
                    ? undefined
                    : pathname?.split("login-")[1]
                )}
                style={{
                  color: colors.blue,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Forgot password?
              </Link>

              <Link
                to={paths.auth.forgotLogin(
                  pathname?.split("/")[1] === "login"
                    ? undefined
                    : pathname?.split("login-")[1]
                )}
                style={{
                  color: colors.blue,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Forgot login username?
              </Link>
            </Box>


          </Box>
        </Stack>
      </form>

    </Stack>
  );

}
