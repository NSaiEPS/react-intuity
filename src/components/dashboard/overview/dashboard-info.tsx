import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  updateAccountInfo,
  updatePaperLessInfo,
} from "@/state/features/accountSlice";
import {
  getNotificationList,
  getDashboardInfo,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage, updateLocalStorageValue } from "@/utils/auth";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { ListBullets as ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useDispatch, useSelector } from "@/hooks/redux";

import { paths } from "@/utils/paths";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import {
  Avatar,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
} from "@mui/material";
import { Button } from "nsaicomponents";

export interface DashboardInfoProps {
  sx?: SxProps;
  type?: string;
  isActive?: boolean;
  value: string;
  typeofUser: string;
  apiCall?: boolean;
}

// Styled Switch with ON/OFF labels
const IOSSwitch = styled((props: SwitchProps) => (
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

export function DashboardInfo({
  sx,
  type,
  value,
  typeofUser,
  apiCall = false,
}: DashboardInfoProps): React.JSX.Element {
  const navigate = useNavigate();
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const [checked, setChecked] = React.useState(() => {
    if (type === "notification") {
      const val = dashBoardInfo?.body?.[typeofUser]?.[value];
      return val !== undefined && val !== null && val != 4 && val !== "4" && val !== "None";
    }
    const val = dashBoardInfo?.body?.[typeofUser]?.[value];
    if (val !== undefined && val !== null) {
      return Number(val) === 1;
    }
    const localInfo = getLocalStorage("intuity-customerInfo") as any;
    return Number(localInfo?.autopay) === 1;
  });

  React.useEffect(() => {
    if (type === "notification") {
      const val = dashBoardInfo?.body?.[typeofUser]?.[value];
      if (val !== undefined && val !== null) {
        setChecked(val != 4 && val !== "4" && val !== "None");
      }
    } else {
      const val = dashBoardInfo?.body?.[typeofUser]?.[value];
      if (val !== undefined && val !== null) {
        setChecked(Number(val) === 1);
      } else {
        const localInfo = getLocalStorage("intuity-customerInfo") as any;
        setChecked(Number(localInfo?.autopay) === 1);
      }
    }
  }, [dashBoardInfo?.body, type, typeofUser, value]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setChecked();
    if (type === "autoPay") {
      navigate(paths.dashboard.autoPay())
      return;
    }
    setClickedState(event.target.checked);
    setOpenConfirm(true);
  };
  const [clickedState, setClickedState] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [payerTermsModalOpen, setPayerTermsModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!openConfirm) {
      setAgreeTerms(false);
    }
  }, [openConfirm]);

  const dispatch = useDispatch();

  // ✅ Fix — move inside useMemo
  const { roleId, userId } = React.useMemo(() => {
    const raw = getLocalStorage("intuity-user");
    const stored = typeof raw === "object" && raw !== null ? raw as any : null;
    return {
      roleId: stored?.body?.acl_role_id,
      userId: stored?.body?.customer_id,
    };
  }, []); // ← only reads localStorage once



  const getPrefDetails = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "15");

    dispatch(
      updateAccountInfo(formData, true, notificationResponse, undefined, true)
    );
  };
  const notificationPreferenceDetails = useSelector(
    (state: RootState) => state?.Account?.notificationPreferenceDetails
  );

  const CustomerInfo = React.useMemo(() => {
    return (dashBoardInfo?.body?.customer ?? dashBoardInfo?.customer ?? getLocalStorage("intuity-customerInfo")) as any;
  }, [dashBoardInfo]);

  const { hasEmail, hasPhone } = React.useMemo(() => {
    const customerInfo = CustomerInfo;

    const phoneNo =
      notificationPreferenceDetails?.phone_no && notificationPreferenceDetails?.phone_no !== "0"
        ? notificationPreferenceDetails?.phone_no
        : (customerInfo?.phone_no || customerInfo?.mobile || "");

    const isPhoneVerified =
      notificationPreferenceDetails?.is_phone_verified !== undefined
        ? notificationPreferenceDetails?.is_phone_verified == 1
        : customerInfo?.is_phone_verified == 1;

    const hasPhone = Boolean(phoneNo && phoneNo !== "0" && isPhoneVerified);

    const email =
      notificationPreferenceDetails?.updated_email ||
      notificationPreferenceDetails?.email ||
      customerInfo?.email ||
      "";
    const hasEmail = Boolean(email && String(email).trim() !== "");

    return {
      hasEmail,
      hasPhone,
    };
  }, [dashBoardInfo, notificationPreferenceDetails]);

  const handleConfirm = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    // logic for destructive action
    if (type === "paperLess") {
      // dispatch(setPaperLessSettings(checked ? 'on' : 'off'));
      formData.append("paperless", clickedState ? "on" : "off");

      dispatch(
        updatePaperLessInfo(formData, "paperless", () =>
          successCallBack("paperless", clickedState)
        )
      );
    } else if (type === "autoPay") {
      // dispatch(setAutoPaySettings(checked ? '1' : '0'));
      formData.append("auto_pay", clickedState ? "1" : "0");
      formData.append("id", dashBoardInfo?.body?.customer?.autopay_setting_id);
      formData.append(
        "payment_method_id",
        dashBoardInfo?.body?.customer?.payment_method_id
      );
      // formData.append("is_form", "1");

      dispatch(
        updatePaperLessInfo(formData, "autopay", () =>
          successCallBack("autopay", clickedState)
        )
      );
    } else {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", userId);
      formData.append("model_open", "3");

      let reminderValue = "4"; // None
      if (clickedState) {
        if (hasPhone && hasEmail) {
          reminderValue = "3"; // Both
        } else if (hasPhone && !hasEmail) {
          reminderValue = "2"; // Text
        } else {
          reminderValue = "1"; // Email
        }
      }

      formData.append("notification_reminder", reminderValue);
      formData.append("notification_new_bill", notificationPrefrences.new_bill);
      formData.append(
        "notification_payment",
        notificationPrefrences.payment_confirmation
      );

      formData.append(
        "notification_biller",
        notificationPrefrences.biller_announcements
      );

      dispatch(
        updateAccountInfo(formData, true, () => {
          getPrefDetails();
          if (roleId && userId) {
            dispatch(getDashboardInfo(roleId, userId));
          }
        })
      );

      setChecked(clickedState ? true : false);
    }
    setOpenConfirm(false);
  };

  const successCallBack = (type: string, clickedState: boolean) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("onlyread", "0");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");

    dispatch(getNotificationList(formData));
    updateLocalStorageValue("intuity-customerInfo", type, clickedState ? 1 : 0);
    setChecked(clickedState);
    if (roleId && userId) {
      dispatch(getDashboardInfo(roleId, userId));
    }
  };
  React.useEffect(() => {
    if (apiCall) {
      getPrefDetails();
    }
  }, []);
  const TextToValueFormat = {
    Text: "2",
    Email: "1",
    Both: "3",
    None: "4",
  };
  const billerTextToValueFormat = {
    Text: "1",
    Email: "0",
    Both: "2",
    None: "3",
  };
  const [notificationPrefrences, setNotificationPrefrences] = React.useState({
    new_bill: "1",
    payment_confirmation: "1",
    reminders: "1",
    biller_announcements: "1",
  });
  const notificationResponse = (res) => {
    const value = res?.reminders?.selected;
    setNotificationPrefrences({
      new_bill: TextToValueFormat[res?.new_bill?.selected] || "1",
      payment_confirmation:
        TextToValueFormat[res?.payment_confirmation?.selected] || "1",
      reminders: TextToValueFormat[res?.reminders?.selected] || "1",
      biller_announcements:
        billerTextToValueFormat[res?.biller_announcements?.selected] || "1",
    });
    setChecked(value === "None" ? false : true);
  };
  return (
    <>
      <Card
        sx={{
          ...sx,
          cursor: "pointer",
          borderRadius: boarderRadius.card,
        }}
        onClick={() => {
          if (type === "paperLess") {
            navigate(paths.dashboard.paperless());
          } else if (type === "notification") {
            navigate(paths.dashboard.notificationSettings());
          } else {
            navigate(paths.dashboard.autoPay());
          }
        }}
      >
        <CardContent>
          <Stack spacing={4} justifyContent="space-between">
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h5" fontWeight={600}>
                {type === "paperLess"
                  ? "Paperless Billing"
                  : type === "notification"
                    ? "Bill Due Reminder"
                    : "Auto Pay"}
              </Typography>
              {type === "paperLess" ? (
                <Avatar
                  sx={{
                    backgroundColor: "var(--mui-palette-warning-main)",
                    height: "56px",
                    width: "56px",
                  }}
                >
                  <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
                </Avatar>
              ) : type === "notification" ? (
                <Avatar
                  sx={{
                    backgroundColor: "var(--mui-palette-success-main)",
                    height: "56px",
                    width: "56px",
                  }}
                >
                  <BellIcon fontSize="var(--icon-fontSize-lg)" />
                </Avatar>
              ) : (
                <Avatar
                  sx={{
                    backgroundColor: "var(--mui-palette-success-main)",
                    height: "56px",
                    width: "56px",
                  }}
                >
                  <UsersIcon fontSize="var(--icon-fontSize-lg)" />
                </Avatar>
              )}
            </Stack>
            <Stack
              component="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                if (type === "autoPay") {
                  navigate(paths.dashboard.autoPay());
                  return;
                }
                setClickedState(!clickedState);
                setOpenConfirm(true);
              }} // 👈 prevent the card click
              sx={{
                all: "unset", // Reset button styles
                display: "flex",
                width: "70px",
                cursor: "pointer",
              }}
            >
              <IOSSwitch
                checked={checked}
                // disabled={type === "autoPay"}
                onChange={handleChange}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (type === "autoPay") {
                    navigate(paths.dashboard.autoPay());
                  }
                }} // 👈 prevent the card click
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {type === "paperLess" ? (
        <>
          {/* Paperless Confirmation Modal */}
          <Dialog
            open={openConfirm}
            onClose={() => setOpenConfirm(false)}
            PaperProps={{
              sx: {
                borderRadius: "16px",
                p: { xs: 2.5, sm: 3 },
                maxWidth: { xs: "95%", sm: "460px" },
                width: "100%",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <DialogTitle
              sx={{
                color: colors.blue,
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                p: 0,
                mb: 2,
              }}
            >
              {clickedState ? "Go Paperless?" : "Turn Off Paperless Billing?"}
            </DialogTitle>

            <DialogContent sx={{ p: 0, mb: 3 }}>
              <Typography
                sx={{
                  color: "#374151",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.5,
                  mb: clickedState ? 2 : 0,
                }}
              >
                {clickedState
                  ? "You’re about to enroll in paperless billing. Future bills will be available online and you’ll no longer receive paper bills by mail."
                  : "You’re about to eliminate paperless billing. Future bills will be sent by mail and available online."}
              </Typography>

              {clickedState && (
                <FormGroup sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        sx={{
                          color: colors.blue,
                          "&.Mui-checked": {
                            color: colors.blue,
                          },
                          p: 0.5,
                          mr: 1,
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.95rem", color: "#374151" }}>
                        I agree to the{" "}
                        <Typography
                          component="span"
                          sx={{
                            color: colors.blue,
                            cursor: "pointer",
                            fontWeight: 500,
                            textDecoration: "underline",
                            "&:hover": {
                              color: colors["blue.3"],
                            },
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPayerTermsModalOpen(true);
                          }}
                        >
                          Payer Terms and Conditions
                        </Typography>
                      </Typography>
                    }
                    sx={{ alignItems: "center", ml: 0 }}
                  />
                </FormGroup>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 0, justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  backgroundColor: "white",
                  borderRadius: "10px",
                  height: "40px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
                onClick={() => setOpenConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={clickedState && !agreeTerms}
                type="button"
                variant="contained"
                textTransform="none"
                bgColor={colors.blue}
                hoverBackgroundColor={colors["blue.3"]}
                hoverColor="white"
                style={{
                  borderRadius: "10px",
                  height: "40px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  paddingLeft: "16px",
                  paddingRight: "16px",
                }}
                onClick={handleConfirm}
              >
                {clickedState ? "Enroll in Paperless Billing" : "Turn Off Paperless Billing"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Payer Terms and Conditions Modal */}
          <Dialog
            open={payerTermsModalOpen}
            maxWidth="sm"
            fullWidth
            onClose={() => setPayerTermsModalOpen(false)}
          >
            <DialogTitle sx={{ ml: 1, p: 2, pr: 6, fontWeight: 600, color: colors.blue }}>
              Payer Terms and Conditions
              <IconButton
                aria-label="close"
                onClick={() => setPayerTermsModalOpen(false)}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <XIcon size={24} color={colors.blue} />
              </IconButton>
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 3 }}>
              {CustomerInfo?.paperless_payer_terms_conditions ? (
                <Typography
                  component="div"
                  sx={{
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    color: "#333",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: CustomerInfo.paperless_payer_terms_conditions,
                  }}
                />
              ) : (
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.95rem",
                    color: "#666",
                  }}
                >
                  No Terms and Conditions found.
                </Typography>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <ConfirmDialog
          open={openConfirm}
          title={
            type === "notification"
              ? "Notifications"
              : "Auto Pay"
          }
          message={`Are you sure want to ${!checked ? "ON" : "OFF"} it`}
          confirmLabel="Yes, Confirm"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={() => setOpenConfirm(false)}
        />
      )}
    </>
  );
}
