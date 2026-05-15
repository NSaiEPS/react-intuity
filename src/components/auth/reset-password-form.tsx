import * as React from "react";

import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";

import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";

import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import { Button } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";

import { UpdatePasswordModal } from "../dashboard/account/UpdatePasswordModal";
import { paths } from "@/utils/paths";
import Button from "../CommonComponents/Button";
import { Link } from "react-router";
import { Button as MUIButton } from "@mui/material";

import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
const schema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: "" } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  const [open, setOpen] = React.useState(false);

  const { companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  console.log(companyInfo)
  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      // @ts-ignore
      const { error } = await authClient.resetPassword(values, companyInfo?.company?.alias);

      if (error) {
        setError("root", { type: "server", message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);
      // setOpen(true);xs

      // Redirect to confirm password reset
    },
    [setError]
  );
const [emailFocused, setEmailFocused] = React.useState(false);
  return (
    <Stack spacing={4}>
       <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#e8f0fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Lock size={30} color={colors.blue} weight="regular" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will receive an email with a link to reset your password.
          </Typography>
        </Box>
      </Box>
      {/* <Typography variant="h5"></Typography> */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography
          variant="body1"

          mb={3.5}

        >
          {/* You will receive an email with a link for resetting your password. */}

        </Typography>

        <Stack spacing={2}>
      <Controller
  control={control}
  name="email"
  render={({ field }) => (
    <FormControl fullWidth error={Boolean(errors.email)}>
      <InputLabel
        shrink={emailFocused || Boolean(field.value)}
        sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
      >
        Enter login username
      </InputLabel>
      <OutlinedInput
        {...field}
        notched={emailFocused || Boolean(field.value)}
        label="Enter login username"
        type="text"
        onFocus={() => setEmailFocused(true)}
        onBlur={(e) => { field.onBlur(); setEmailFocused(false); }}
        startAdornment={
          <User size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
        }
      />
      {errors.email && (
        <FormHelperText>{errors.email.message}</FormHelperText>
      )}
    </FormControl>
  )}
/>
          {errors.root ? (
            <Alert color="error">{errors.root.message}</Alert>
          ) : null}

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
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: colors.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Info size={18} color="#fff" weight="fill" />
          </Box>
          <Box>
            <Typography variant="body2" color="text.primary">
              Please enter the username associated with your account.
            </Typography>
            <Typography variant="body2" color="text.primary">
              If you don't remember your username, contact our support team.
            </Typography>
          </Box>
        </Box> */}

      

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 ,
    flexWrap: { xs: "wrap", sm: "nowrap" },
    gap: 1.5,


        }}
  
        >
          <MUIButton
            component={Link}
            to={paths.auth.newLogin(companyInfo?.company?.alias)}
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
            disabled={isPending}
            loading={isPending}
            type="submit"
            variant="contained"
            textTransform="none"
            bgColor={colors.blue}
            hoverBackgroundColor={colors["blue.3"]}
            hoverColor="white"
            style={{
              borderRadius: "12px",
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontWeight: 600,
            }}
          >
            <PaperPlaneTilt size={18} style={{ marginRight: 8 }} weight="regular" />
            Send Recovery Link
          </Button>
        </Box>

        </Stack>
      </form>
      <UpdatePasswordModal open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
