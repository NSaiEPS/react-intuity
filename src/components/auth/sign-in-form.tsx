import * as React from "react";

import { setUserInfo } from "@/state/features/accountSlice";
// import api from '@/app/api/axios';
import { colors } from "@/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
// import { Button } from '@mui/material';
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";

import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
// import Button from '@mui/material/Button';
// import { Button } from 'nsaicomponents';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

import Button from "../CommonComponents/Button";
import QuickActionsBox from "./register-actions";
import { Link, useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { setLocalStorage } from "@/utils/auth";
import { RootState } from "@/state/store";
import axios from "axios";
import { BASE_URL } from "@/api/axios";

// import Button from '../CommonComponents/Button;

const schema = zod.object({
  // email: zod.string().min(1, { message: 'Email is required' }).email(),
  email: zod.string().min(1, { message: "Email is required" }),
  password: zod.string().min(1, { message: "Password is required" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: "", password: "" } satisfies Values;

export function SignInForm({ user = false }): React.JSX.Element {
  const navigate = useNavigate();

  const { checkSession } = useUser();
  const location = useLocation();
  const pathname = location.pathname;
  const { companyInfo } = useSelector((state: RootState) => state?.Account);
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

// const handleRegisterClick = async () => {
//   try {
//     const formData = new FormData();
//     formData.append("alias", "RiverPark-1");

//     const res = await axios.post(
//       `${BASE_URL}/get-details-by-alias`,
//       formData,
//       {
//         headers: {
//           Accept: "application/json",
//         },
//         withCredentials: false, // important
//       }
//     );

//     const alias = res?.data?.body?.company?.alias;
//     console.log(res?.data?.body?.company?.alias,'resssss')

//     if (alias) {
//       navigate(paths.auth.registerWithAlias(alias));
//     }
//     console.log("Navigating to:", paths.auth.registerWithAlias(alias));

//   } catch (error) {
//     console.error("Alias fetch failed", error);
//   }
// };

const handleRegisterClick = async () => {
  const slug = pathname?.split("/")[1];

  if (slug === "login") {
    navigate("/sign-up");
    return;
  }

  if (slug?.startsWith("login-")) {
    try {
      const aliasFromUrl = slug.replace("login-", "");

      const formData = new FormData();
      formData.append("alias", aliasFromUrl);

      const res = await axios.post(
        `${BASE_URL}/get-details-by-alias`,
        formData,
        { headers: { Accept: "application/json" } }
      );

      const alias = res?.data?.body?.company?.alias;

      if (alias) {
        navigate(`/register-${alias}`);
      }
    } catch (error) {
      console.error("Alias fetch failed", error);
    }
  }
};




  const onSubmit: SubmitHandler<Values> = React.useCallback(
    async (values): Promise<void> => {
      setIsPending(true);

      try {
        const { error } = await authClient.signInWithPassword(
          values,
          successCallBack
        );

        if (error) {
          setError("root", { type: "server", message: error });
          setIsPending(false);
          return;
        }

        // await checkSession?.();

        // router.replace(paths.auth.confirmInfo);
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
    [checkSession, setError]
  );

  const dispatch = useDispatch();

  type AuthResponse = {
  body?: {
    alias?: string;
    is_verified?: number;
  };
};

  const successCallBack = async (res: AuthResponse) => {
    dispatch(setUserInfo(res));
    if (pathname?.split("/")[1] !== "login" && pathname?.includes("login")) {
      setLocalStorage("alias-details", companyInfo?.company);
    } else {
      setLocalStorage("alias-details", null);
    }
    const companyAlias = res?.body?.alias || "intuityfe";
    if (res?.body?.is_verified == 1) {
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
  return (
    <Stack spacing={4}>
      {!user && (
        <Stack spacing={1}>
          <Typography variant="h4">Sign in</Typography>
        </Stack>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Login ID or Email</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Login ID or Email"
                  type="text"
                />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? "text" : "password"}
                />
                {errors.password ? (
                  <FormHelperText>{errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          {!user && (
            <div>
              <MuiLink
                component={RouterLink}
                to={paths.auth.resetPassword()}
                sx={{
                  color: colors.blue,
                  textDecoration: "none",
                  "&:hover": {
                    color: colors["blue.1"],
                    borderBottom: "1px solid",
                  },
                }}
              >
                Forgot password?
              </MuiLink>
            </div>
          )}
          {!user && (
            <div>
              <MuiLink
                component={RouterLink}
                to={user ? paths.auth.signUp() : paths.auth.newLogin()}
                variant="subtitle2"
                sx={{
                  color: colors.blue,
                  textDecoration: "none",
                  "&:hover": {
                    color: colors["blue.1"],
                    borderBottom: `1px solid ${colors["blue.1"]}`,
                  },
                }}
              >
                {user ? "Register" : "Company Login"}
              </MuiLink>
            </div>
          )}
          {errors.root ? (
            <Alert color="error">{errors.root.message}</Alert>
          ) : null}
          {/* <Button></Button> */}

          <Box> {user && <QuickActionsBox />}</Box>

          {user ? (
            <Box
              mt={2}
              sx={{
                display: "flex",
              }}
            >
              <Button
                disabled={isPending}
                loading={isPending}
                onClick={handleSubmit(onSubmit)}
                type="submit"
                variant="contained"
                textTransform="uppercase"
                bgColor={colors.blue}
                // onClick={onSubmit}
                hoverBackgroundColor={colors["blue.3"]}
                hoverColor="white"
                style={{
                  borderRadius: "12px",
                  height: "41px",
                  width: "125px",
                  // backgroundColor: 'red',
                }}
              >
                {/* Sign In */}
                Login
              </Button>

              <Link
                to={paths.auth.resetPassword()}
                style={{
                  color: colors.blue,
                  justifyContent: "center",
                  marginTop: "auto",
                  marginBottom: "auto",
                  marginLeft: "15px",
                  textDecoration: "underline",
                  borderColor: "transparent",

                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = colors["blue.1"];
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                Forgot password?
              </Link>
            </Box>
          ) : (
            <Button
              disabled={isPending}
              loading={isPending}
              onClick={handleSubmit(onSubmit)}
              type="button"
              variant="contained"
              textTransform="none"
              bgColor={colors.blue}
              // onClick={onSubmit}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{
                borderRadius: "12px",
                height: "41px",
                // backgroundColor: 'red',
              }}
            >
              Sign In
            </Button>
          )}
          {user && (
            <Typography variant="body1" marginTop={1}>
              Don't have an account {` `}
              {/* <Link
                to="/sign-up"
                style={{
                  color: colors.blue,
                  borderColor: "transparent",
                  textDecoration: "none",
                }}
              >
                Register Now
              </Link>{" "} */}
               <span
      onClick={handleRegisterClick}
      style={{
        color: colors.blue,
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      Register Now 
    </span>{" "}
              to view your account details
            </Typography>
          )}
        </Stack>
      </form>
    </Stack>
  );
}
