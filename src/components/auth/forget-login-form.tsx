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
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
const schema = zod.object({
  email: zod.string().min(1, { message: "Account number is required" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: "" } satisfies Values;

export function ForgotLoginForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [accountFocused, setAccountFocused] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  const [open, setOpen] = React.useState(false);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
       const formData = new FormData();
          formData.append("company", companyInfo?.company?.id);
          formData.append("account", values.email);

      

      // @ts-ignore
      const { error } = await authClient.resetUserName(formData, companyInfo?.company?.alias);

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
  const { companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );
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
      position: "relative",
    }}
  >
    <User size={30} color={colors.blue} weight="regular" />
    {/* Small lock badge */}
    <Box
      sx={{
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: "#e8f0fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Lock size={12} color={colors.blue} weight="fill" />
    </Box>
  </Box>

  <Box>
    <Typography variant="h5" fontWeight={700}>
      Forgot Your Username?
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Enter your account number and we'll send your login username to the email associated with your account.
    </Typography>
  </Box>
</Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography
          variant="body1"

          mb={3.5}

        >
          {/* Please enter your account number.
          Your Login will be sent to the email on file for this account. */}

        </Typography>

        <Stack spacing={2}>
        <Controller
  control={control}
  name="email"
  render={({ field }) => (
    <FormControl fullWidth error={Boolean(errors.email)}>
      <InputLabel
        shrink={accountFocused || Boolean(field.value)}
        sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
      >
        Account Number *
      </InputLabel>
      <OutlinedInput
        {...field}
        notched={accountFocused || Boolean(field.value)}
        label="Account Number *"
        type="text"
        onFocus={() => setAccountFocused(true)}
        onBlur={(e) => { field.onBlur(); setAccountFocused(false); }}
        startAdornment={
          <CreditCard size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
        }
      />
      {errors.email && (
        <FormHelperText>{errors.email.message}</FormHelperText>
      )}
    </FormControl>
  )}
/>
         {errors.root && (
            <Alert color="error">{errors.root.message}</Alert>
          )}
       
          <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1,
   flexWrap: { xs: "wrap", sm: "nowrap" },
    gap: 1.5,

           }}>
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
              Send Username
            </Button>
          </Box>
        </Stack>
      </form>
      <UpdatePasswordModal open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
