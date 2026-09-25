import * as React from "react";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
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
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Question } from "@phosphor-icons/react";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";
import { setRouteChecker } from "@/state/features/dashBoardSlice";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

const schema = z
  .object({
    password: z.string().min(1, "Current password is required"),
    new_password: passwordSchema,
    repassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.repassword, {
    message: "Passwords don't match",
    path: ["repassword"],
  });

type FormData = z.infer<typeof schema>;

export function UpdatePasswordForm(): React.JSX.Element {
  const [show, setShow] = React.useState({
    password: false,
    new_password: false,
    repassword: false,
  });
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const toggleVisibility = (key: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      new_password: "",
      repassword: "",
    },
  });

  const dispatch = useDispatch();

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const onSubmit = (data: FormData) => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("new_password", data?.new_password);
    formData.append("repassword", data?.repassword);
    formData.append("password", data?.password);
    setPasswordLoading(true);
    dispatch(
      updateAccountInfo(
        formData,
        true,
        successCallBack,
        undefined,
        false,
        setPasswordLoading
      )
    );
  };

  const successCallBack = () => {
    setPasswordLoading(false);
    reset();
    setShow({
      password: false,
      new_password: false,
      repassword: false,
    });
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

  const handleReset = () => {
    reset({
      password: "",
      new_password: "",
      repassword: "",
    });
  };

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
              <Lock size={24} weight="regular" />
            </Avatar>
          }
          title={
            <Typography variant="h6" fontWeight={700}>
              Account Password
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Update your password for this portal.
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: "sm" }}>
            {/* Current Password */}
            <FormControl fullWidth size="small" error={!!errors.password}>
              <InputLabel>Current Password</InputLabel>
              <OutlinedInput
                label="Current Password"
                type={show.password ? "text" : "password"}
                {...register("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => toggleVisibility("password")} edge="end">
                      {!show.password ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.password && (
                <FormHelperText>{errors.password.message}</FormHelperText>
              )}
            </FormControl>

            {/* New Password */}
            <FormControl fullWidth size="small" error={!!errors.new_password}>
              <InputLabel>New Password</InputLabel>
              <OutlinedInput
                label="New Password"
                type={show.new_password ? "text" : "password"}
                {...register("new_password")}
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip
                      title="Passwords must be a minimum of 6 characters. Special characters (!@#$%^&*) are allowed."
                      placement="top"
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#E7E6E6",
                            color: "#000000",
                            border: "1px solid #d0cfcf",
                            fontSize: "14px",
                            lineHeight: 1.4,
                            "& .MuiTooltip-arrow": {
                              color: "#E7E6E6",
                              "&::before": {
                                border: "1px solid #d0cfcf",
                              },
                            },
                          },
                        },
                      }}
                    >
                      <IconButton size="small" edge="end">
                        <Question size={20} color="#90caf9" weight="fill" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => toggleVisibility("new_password")} edge="end">
                      {!show.new_password ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.new_password && (
                <FormHelperText>{errors.new_password.message}</FormHelperText>
              )}
            </FormControl>

            {/* Confirm New Password */}
            <FormControl fullWidth size="small" error={!!errors.repassword}>
              <InputLabel>Confirm New Password</InputLabel>
              <OutlinedInput
                label="Confirm New Password"
                type={show.repassword ? "text" : "password"}
                {...register("repassword")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => toggleVisibility("repassword")} edge="end">
                      {!show.repassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.repassword && (
                <FormHelperText>{errors.repassword.message}</FormHelperText>
              )}
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
                disabled={passwordLoading}
                loading={passwordLoading}
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
                Save New Password
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </form>
  );
}
