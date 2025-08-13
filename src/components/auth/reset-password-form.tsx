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
import { Box } from "@mui/material";

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

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      // @ts-ignore
      const { error } = await authClient.resetPassword(values);

      if (error) {
        setError("root", { type: "server", message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);
      setOpen(true);

      // Redirect to confirm password reset
    },
    [setError]
  );

  return (
    <Stack spacing={4}>
      <Typography variant="h5">{/* Reset password */}</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          {errors.root ? (
            <Alert color="error">{errors.root.message}</Alert>
          ) : null}

          <Box
            mt={5}
            sx={{
              display: "flex",
            }}
          >
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

                height: "41px",
                width: "175px",
              }}
            >
              Send recovery link
            </Button>
            <Link
              to={paths.auth.newLogin()}
              style={{
                color: colors.blue,
                // textDecoration: "underline",
                // fontSize: "0.875rem", // corresponds to subtitle2 usually
                borderColor: "transparent",
                marginLeft: "15px",
                justifyContent: "center",
                marginTop: "auto",
                marginBottom: "auto",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = colors["blue.1"];
              }}
            >
              Back to Login
            </Link>
          </Box>
        </Stack>
      </form>
      <UpdatePasswordModal open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
