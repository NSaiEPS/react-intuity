import * as React from "react";
import {
  updateAccountInfo,
  updateVoicePreference,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage, updateLocalStorageValue } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  // Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Button, CustomBackdrop, Loader } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as z from "zod";

import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import { useLoading } from "@/components/core/skeletion-context";

const schema = z.object({
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be no more than 15 digits")
    .regex(/^[0-9]+$/, "Phone must contain only digits"),
});

type FormData = z.infer<typeof schema>;

const IOSSwitch = styled((props: any) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 70,
  height: 30,
  padding: 0,
  display: "flex",
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 3,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(40px)",
      color: "#fff",
      "& .MuiSwitch-thumb": {
        backgroundColor: "#fff", // 👈 white when ON
      },
      "& + .MuiSwitch-track": {
        backgroundColor: "#00C853", // green ON
        opacity: 1,
        border: 0,
        "&::before": {
          opacity: 1,
          color: "white",
        },
        "&::after": {
          opacity: 0,
          color: "white",
        },
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 24,
    height: 24,
    backgroundColor: "#bdbdbd", // 👈 black when OFF
  },
  "& .MuiSwitch-track": {
    borderRadius: 30 / 2,
    backgroundColor: "#bdbdbd50", // OFF track color
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    position: "relative",
    "&::before, &::after": {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 10,
      fontWeight: 600,
      fontFamily: "Inter",
      color: "#fff",
      width: 20,
      textAlign: "center",
    },
    "&::before": {
      content: '"ON"',
      left: 8,
      opacity: 1,
    },
    "&::after": {
      content: '"OFF"',
      right: 8,
      opacity: 1,
      color: "#555",
    },
  },

  "& .Mui-checked + .MuiSwitch-track": {
    "&::before": {
      color: "#fff",
      opacity: 1,
    },
    "&::after": {
      color: "#fff",
      opacity: 0,
    },
  },
}));

export function Notifications(): React.JSX.Element {
  const [emailUpdated, setEmailUpdated] = React.useState(false);
  const [phoneUpdated, setPhoneUpdated] = React.useState(false);
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const [userUpdating, setUserUpdating] = React.useState("");
  const { contextLoading } = useLoading();

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  const watchEmail = watch("email");
  const watchPhone = watch("phone");

  React.useEffect(() => {
    setEmailUpdated(true);
  }, [watchEmail]);

  React.useEffect(() => {
    setPhoneUpdated(true);
  }, [watchPhone]);
  const dispatch = useDispatch();
  const [clickedState, setClickedState] = React.useState(false);

  const userInfo: any = getLocalStorage("intuity-customerInfo");

  React.useEffect(() => {
    if (userInfo) {
      setClickedState(userInfo?.is_voice_optout == 0 ? false : true);
      reset((prev) => ({
        ...prev,
        email: userInfo?.updated_email,
      }));
    }
  }, [reset]);
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
  const handleEmailUpdate = async () => {
    const valid = await trigger("email");
    if (valid) {
      console.log("Updated email:", getValues("email"));
      setUserUpdating("email");

      let roleId = stored?.body?.acl_role_id;
      let userId = stored?.body?.customer_id;
      let token = stored?.body?.token;

      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("notification_email", getValues("email"));

      dispatch(updateAccountInfo(token, formData, true, successCallBack));

      // setEmailUpdated(false);
    }
  };
  const successCallBack = (type) => {
    if (type) {
      updateLocalStorageValue(
        "intuity-customerInfo",
        "is_voice_optout",
        clickedState ? 1 : 0
      );
    }
    console.log("Email updated successfully");
  };

  const handlePhoneUpdate = async () => {
    const valid = await trigger("phone");
    if (valid) {
      console.log("Updated phone:", getValues("phone"));
      // setPhoneUpdated(false);

      if (valid) {
        console.log("Updated email:", getValues("email"));
        setUserUpdating("phone");

        let roleId = stored?.body?.acl_role_id;
        let userId = stored?.body?.customer_id;
        let token = stored?.body?.token;

        const formData = new FormData();

        formData.append("acl_role_id", roleId);
        formData.append("customer_id", userId);
        formData.append("phone", getValues("email"));

        dispatch(updateAccountInfo(token, formData, true, successCallBack));

        // setEmailUpdated(false);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Saved All:", data);
    reset(data);
    setEmailUpdated(false);
    setPhoneUpdated(false);
  };

  const [openConfirm, setOpenConfirm] = React.useState(false);

  const handleConfirm = () => {
    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    // logic for destructive action

    formData.append("is_voice_optout", clickedState ? "1" : "0");

    dispatch(
      updateVoicePreference(token, formData, () => successCallBack("voice"))
    );

    setOpenConfirm(false);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setChecked();

    setClickedState(event.target.checked);
    setOpenConfirm(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ borderRadius: boarderRadius.card }}>
        <CardHeader
          subheader="Manage Your Notifications"
          title="Notifications"
        />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: "sm" }}>
            <FormControl fullWidth error={!!errors.email}>
              <InputLabel htmlFor="email">Notification Email</InputLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    label="Notification Email"
                    type="email"
                    id="email"
                  />
                )}
              />
              {errors.email && (
                <Box color="error.main" mt={0.5} fontSize={13}>
                  {errors.email.message}
                </Box>
              )}
            </FormControl>
            {emailUpdated && (
              <Box textAlign="right">
                <Button
                  disabled={accountLoading && userUpdating === "email"}
                  loading={accountLoading && userUpdating === "email"}
                  variant="contained"
                  textTransform="none"
                  bgColor={colors.blue}
                  hoverBackgroundColor={colors["blue.3"]}
                  hoverColor="white"
                  style={{
                    borderRadius: "12px",
                    height: "41px",
                    // backgroundColor: 'red',
                  }}
                  onClick={handleEmailUpdate}
                >
                  Update Email
                </Button>
              </Box>
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            sx={{ maxWidth: "sm", marginBottom: "25px" }}
            mt={7}
          >
            <Typography variant="h5" fontWeight={600}>
              Enable Emergency Calls to My Phone
            </Typography>

            <Stack
              component="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                e.stopPropagation()
              }
              sx={{
                all: "unset",
                display: "flex",
              }}
            >
              <IOSSwitch
                checked={clickedState}
                onChange={handleChange}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  e.stopPropagation()
                }
              />
            </Stack>
          </Stack>
          <Stack spacing={3} sx={{ maxWidth: "sm" }} pt={3}>
            <FormControl fullWidth error={!!errors.phone}>
              <InputLabel htmlFor="phone">Notification Phone No.</InputLabel>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    label="Notification Phone No."
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    id="phone"
                  />
                )}
              />
              {errors.phone && (
                <Box color="error.main" mt={0.5} fontSize={13}>
                  {errors.phone.message}
                </Box>
              )}
            </FormControl>
            {phoneUpdated && (
              <Box textAlign="right">
                <Button
                  disabled={accountLoading && userUpdating === "phone"}
                  loading={accountLoading && userUpdating === "phone"}
                  variant="contained"
                  textTransform="none"
                  bgColor={colors.blue}
                  hoverBackgroundColor={colors["blue.3"]}
                  hoverColor="white"
                  style={{
                    borderRadius: "12px",
                    height: "41px",
                    // backgroundColor: 'red',
                  }}
                  onClick={handlePhoneUpdate}
                >
                  Update Phone
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
        {/* <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Box p={2} display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              color="inherit"
              variant="outlined"
              sx={{
                color: colors.blue,
                borderColor: colors.blue,
              }}
              onClick={() => reset()}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.blue,
                '&:hover': {
                  backgroundColor: colors['blue.3'],
                },
              }}
              color="primary"
              type="submit"
              disabled={!isDirty}
            >
              Save All
            </Button>
          </Box>
        </CardActions> */}
      </Card>
      <ConfirmDialog
        open={openConfirm}
        title={"Voice Call"}
        message={`Are you sure want to ${clickedState ? "ON" : "OFF"} it`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => {
          setOpenConfirm(false);
          setClickedState((prev) => !prev);
        }}
      />

      <CustomBackdrop
        open={accountLoading && !contextLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </form>
  );
}
