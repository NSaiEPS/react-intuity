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
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

import Button from "../CommonComponents/Button";
import QuickActionsBox from "./register-actions";
import { Link, useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";

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
  console.log(pathname?.split("/"), "pathname");

  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    // async (values: Values): Promise<void> => {
    //need to add required
    async (values: any): Promise<void> => {
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
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";
        setError("root", { type: "server", message });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, setError]
  );
  const dispatch = useDispatch();
  const successCallBack = async (res: any) => {
    dispatch(setUserInfo(res));
    // await checkSession?.();
    console.log(res, "resresresresres");
    // return;
    if (res?.body?.is_verified == 1) {
      await checkSession?.();

      if (pathname?.split("/")[2] !== "auth") {
        // console.log(res, 'resresresresres');

        // router.replace(paths.dashboard.overview(res?.body?.alias));
        navigate(paths.dashboard.overview(res?.body?.alias));
      } else {
        // console.log(res, 'resresresresres');

        // router.replace(`/${res?.body?.alias}/dashboard`);
        navigate(`/${res?.body?.alias}/dashboard`);
      }
    } else {
      // router.replace(paths.auth.confirmInfo(res?.body?.alias));
      navigate(paths.auth.confirmInfo(res?.body?.alias));
    }
    console.log(res?.body?.is_verified, "successCallBack");
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
                  color: "primary.main",
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
                textTransform="none"
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
                Sign In
              </Button>

              <Link
                to={paths.auth.resetPassword()}
                style={{
                  color: colors.blue,
                  justifyContent: "center",
                  marginTop: "auto",
                  marginBottom: "auto",
                  marginLeft: "15px",
                  textDecoration: "none",
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
            <Typography variant="subtitle2" marginTop={1}>
              Don't have an account {` `}
              <Link to="/sign-up" style={{ color: colors.blue }}>
                Register Now
              </Link>{" "}
              to view your account details
            </Typography>
          )}
        </Stack>
      </form>
    </Stack>
  );
}
