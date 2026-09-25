import * as React from "react";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { getDashboardInfo, setRouteChecker } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors, CustomerInfo } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";

const schema = z.object({
  new_username: z
    .string()
    .min(1, "New username is required")
    .min(8, "Must be at least 8 characters. No spaces allowed.")
    .refine((val) => !/\s/.test(val), {
      message: "Must be at least 8 characters. No spaces allowed.",
    }),
});

type FormData = z.infer<typeof schema>;

export function AccountSettingsForm(): React.JSX.Element {
  const [accountLoading, setAccountLoading] = React.useState(false);

  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);
  const userInfo: CustomerInfo | undefined =
    (dashBoardInfo?.body?.customer as unknown as CustomerInfo) ||
    (getLocalStorage("intuity-customerInfo") as CustomerInfo);

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const currentUsername =
    userInfo?.loginID || stored?.body?.email || userInfo?.email || "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      new_username: "",
    },
  });

  const dispatch = useDispatch();

  const onSubmit = (data: FormData) => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("name", userInfo?.user_name || "");
    formData.append("email", data?.new_username);
    formData.append("is_form", "1");
    setAccountLoading(true);

    dispatch(
      updateAccountInfo(
        formData,
        true,
        successCallBack,
        undefined,
        false,
        setAccountLoading
      )
    );
  };

  const successCallBack = () => {
    setAccountLoading(false);
    reset({ new_username: "" });

    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    dispatch(getDashboardInfo(roleId, userId));
  };

  const handleReset = () => {
    reset({ new_username: "" });
  };

  React.useEffect(() => {
    if (isDirty) {
      dispatch(setRouteChecker(true));
    }
    return () => {
      dispatch(setRouteChecker(false));
    };
  }, [isDirty, dispatch]);

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ borderRadius: 1 }}>
        <CardHeader
          sx={{
            display: "flex",
            alignItems: "center",
            py: 2,
            px: 3,
            "& .MuiCardHeader-avatar": {
              mr: 2,
              mb: 0,
              display: "flex",
              alignItems: "center",
              alignSelf: "center",
            },
            "& .MuiCardHeader-content": {
              my: "auto",
              alignSelf: "center",
            },
          }}
          avatar={
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#EEF4FF",
                color: colors.blue,
              }}
            >
              <User size={24} weight="regular" />
            </Avatar>
          }
          title={
            <Typography variant="h6" fontWeight={700}>
              Account Username
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              This is the username you use to sign in. It may be an email address or a username you created.
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: "sm" }}>
            {/* Current Username */}
            <FormControl fullWidth size="small">
              <InputLabel>Current Username</InputLabel>
              <OutlinedInput
                label="Current Username"
                value={currentUsername}
                disabled
                readOnly
                sx={{
                  "&.Mui-disabled": {
                    backgroundColor: "#f4f6f8",
                  },
                }}
              />
            </FormControl>

            {/* New Username */}
            <FormControl fullWidth size="small" error={!!errors.new_username}>
              <InputLabel>New Username</InputLabel>
              <OutlinedInput
                label="New Username"
                type="text"
                {...register("new_username")}
              />
              <FormHelperText error={!!errors.new_username}>
                {errors.new_username?.message || "Must be at least 8 characters. No spaces allowed."}
              </FormHelperText>
            </FormControl>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                pt: 1,
              }}
            >
              <Button
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                  backgroundColor: "white",
                }}
                onClick={handleReset}
              >
                Cancel
              </Button>
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
                  height: "41px",
                }}
              >
                Save New Username
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </form>
  );
}