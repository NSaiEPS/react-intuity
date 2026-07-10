import * as React from "react";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { paths } from "@/utils/paths";
import Button from '../../CommonComponents/button-comp';

import { Button as MUIButton } from "@mui/material";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";


const schema = z
  .object({


    new_password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(
        /^(?=.*[0-9]).{6,}$/,
        "Must be at least 6 characters and include 1 number"
      ),
    repassword: z.string(),
  })
  .refine((data) => data.new_password === data.repassword, {
    message: "Passwords don't match",
    path: ["repassword"],
  });

type FormValues = z.infer<typeof schema>;

const defaultValues = {
  new_password: "",
  repassword: "",
};

export function UpdatePasswordScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const hash = searchParams.get("hash") || "";

  const { accountLoading } = useSelector(
    (state: RootState) => state.Account
  );

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] =
    React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const successCallBack = () => {
    navigate(paths.auth.newLogin());
  };

  const onSubmit = (values: FormValues) => {
    if (!hash) {
      setApiError("Invalid or missing reset password link");
      return;
    }

    const formData = new FormData();
    formData.append("acl_role_id", "4");
    formData.append("step", "2");
    formData.append("newpassword", values.new_password);
    formData.append("newpassword2", values.repassword);
    formData.append("hash", hash);

    dispatch(updateAccountInfo(formData, false, successCallBack));
  };

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
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your new password
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={0}>
          {/* New Password */}
          <Controller
            control={control}
            name="new_password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.new_password)}>
                <InputLabel
                  shrink={passwordFocused || Boolean(field.value)}
                  sx={{
                    "&:not(.MuiInputLabel-shrink)": {
                      left: "36px",
                    },
                  }}
                >
                  New Password
                </InputLabel>

                <OutlinedInput
                  {...field}
                  notched={passwordFocused || Boolean(field.value)}
                  label="New Password"
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
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                />

                <FormHelperText sx={{ minHeight: "20px" }}>
                  {errors?.new_password?.message ?? ""}
                </FormHelperText>
              </FormControl>
            )}
          />

          {/* Confirm Password */}
          <Controller

            control={control}
            name="repassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.repassword)}
                sx={{ mt: 2 }}
              >
                <InputLabel
                  shrink={confirmPasswordFocused || Boolean(field.value)}
                  sx={{
                    "&:not(.MuiInputLabel-shrink)": {
                      left: "36px",
                    },
                  }}
                >
                  Confirm Password
                </InputLabel>

                <OutlinedInput
                  {...field}
                  notched={confirmPasswordFocused || Boolean(field.value)}
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => {
                    field.onBlur();
                    setConfirmPasswordFocused(false);
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
                    showConfirmPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        onClick={() => setShowConfirmPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        onClick={() => setShowConfirmPassword(true)}
                      />
                    )
                  }
                />

                <FormHelperText sx={{ minHeight: "20px" }}>
                  {errors?.repassword?.message ?? ""}
                </FormHelperText>
              </FormControl>
            )}
          />

          {apiError && (
            <Alert color="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",

              gap: 2,
              mt: 2,
              justifyContent: "space-between"
            }}
          >
            <MUIButton
              component={Link}
              to={paths.auth.newLogin()}
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                height: "44px",
                px: 3,
                color: colors.blue,
                borderColor: colors.blue,
                backgroundColor: "#fff",
                fontWeight: 600,
              }}
            >
              Back to Login
            </MUIButton>

            <Button
              disabled={accountLoading}
              loading={accountLoading}
              type="submit"
              variant="contained"
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{
                borderRadius: "12px",
                height: "44px",
                minWidth: "160px",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              <Lock size={18} style={{ marginRight: 8 }} />
              Update Password
            </Button>
          </Box>
        </Stack>
      </form>
    </Stack>
  );
}