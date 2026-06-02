
import * as React from "react";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardActions,
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
} from "@mui/material";
import { Question } from "@phosphor-icons/react";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";
import { setRouteChecker } from "@/state/features/dashBoardSlice";

const passwordSchema = z
  .string()
  .min(5, "Password must be at least 5 characters");

const schema = z
  .object({
    password: passwordSchema,
    new_password: passwordSchema,
    repassword: z.string(),
  })
  .refine((data) => data.new_password === data.repassword, {
    message: "Passwords don't match",
    path: ["repassword"],
  });

type FormData = z.infer<typeof schema>;

export function UpdatePasswordForm(): React.JSX.Element {
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const [show, setShow] = React.useState({
    password: false,
    new_password: false,
    repassword: false,
  });

  const toggleVisibility = (key: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      new_password: "",
      repassword: "",
    },
  });

  const watchedValues = watch();

  const dispatch = useDispatch();

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const onSubmit = (data: FormData) => {
    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("new_password", data?.new_password);
    formData.append("repassword", data?.repassword);
    formData.append("password", data?.password);

    dispatch(updateAccountInfo(formData, true));
  };

  React.useEffect(() => {
    if (isDirty) {
      dispatch(setRouteChecker(true));
    }
    return () => {
      dispatch(setRouteChecker(false));
    };
  }, [isDirty]);

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
      <Card sx={{ borderRadius: 0 }}>
        <CardHeader subheader="Change Password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: "sm" }}>

            {/* Old Password */}
            <FormControl fullWidth error={!!errors.password}>
              <InputLabel shrink={!!watchedValues.password}>
                Old Password *
              </InputLabel>
              <OutlinedInput
                label="Old Password *"
                notched={!!watchedValues.password}
                type={show.password ? "text" : "password"}
                {...register("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => toggleVisibility("password")} edge="end">
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
            <FormControl fullWidth error={!!errors.new_password}>
              <InputLabel shrink={!!watchedValues.new_password}>
                New Password *
              </InputLabel>
              <OutlinedInput
                label="New Password *"
                notched={!!watchedValues.new_password}
                type={show.new_password ? "text" : "password"}
                {...register("new_password")}
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip
                      title="Passwords must be a minimum of 5 characters. Special characters (!@#$%^&*) are allowed."
                      placement="top"
                      arrow
                          componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
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
                    <IconButton onClick={() => toggleVisibility("new_password")} edge="end">
                      {!show.new_password ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.new_password && (
                <FormHelperText>{errors.new_password.message}</FormHelperText>
              )}
            </FormControl>

            {/* Confirm Password */}
            <FormControl fullWidth error={!!errors.repassword}>
              <InputLabel shrink={!!watchedValues.repassword}>
                Confirm Password *
              </InputLabel>
              <OutlinedInput
                label="Confirm Password *"
                notched={!!watchedValues.repassword}
                type={show.repassword ? "text" : "password"}
                {...register("repassword")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => toggleVisibility("repassword")} edge="end">
                      {!show.repassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.repassword && (
                <FormHelperText>{errors.repassword.message}</FormHelperText>
              )}
            </FormControl>

          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            textTransform="none"
            style={{
              color: colors.blue,
              borderColor: colors.blue,
              borderRadius: "12px",
              height: "41px",
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
            Update
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
