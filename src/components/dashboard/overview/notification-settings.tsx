import React, { useEffect, useState } from "react";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Button,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { Question, Trash, ArrowClockwise, Plus } from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import PhoneModal from "@/components/auth/confirm-phone-modal";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

function NotificationsSettings() {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const userInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");

  const { setContextLoading } = useLoading();
  const dispatch = useDispatch();
  const [openConfirm, setOpenConfirm] = useState(false);

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");

  // mock contact list (normally from API)
  const { accountLoading, notificationPreferenceDetails } = useSelector(
    (state: RootState) => state?.Account
  );

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
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

  const [preferences, setPreferences] = useState<any>({
    new_bill: "1",
    payment_confirmation: "1",
    reminders: "1",
    biller_announcements: "1",
    email: "",
    email_updated_date: "",
    is_phone_verified: 0,
    phone_no: "",
    updated_email: "",
  });

  const [contacts, setContacts] = useState([
    {
      type: "phone",
      value: preferences?.phone_no,
      verified: preferences?.is_phone_verified == 1 ? true : false,
    },
    {
      type: "email",
      value: preferences?.email,
      verified: preferences?.email_updated_date == 1 ? true : false,
    },
  ]);

  useEffect(() => {
    if (notificationPreferenceDetails) {
      setContacts([
        {
          type: "phone",
          value:
            notificationPreferenceDetails?.phone_no &&
            notificationPreferenceDetails?.phone_no != 0
              ? notificationPreferenceDetails?.phone_no
              : "",
          verified:
            notificationPreferenceDetails?.is_phone_verified == 1
              ? true
              : false,
        },
        {
          type: "email",
          value:
            notificationPreferenceDetails?.updated_email ??
            notificationPreferenceDetails?.email,
          verified:
            notificationPreferenceDetails?.email_updated_date == 1
              ? true
              : false,
        },
      ]);

      setPreferences({
        new_bill:
          TextToValueFormat[
            notificationPreferenceDetails?.new_bill?.selected
          ] || "1",
        payment_confirmation:
          TextToValueFormat[
            notificationPreferenceDetails?.payment_confirmation?.selected
          ] || "1",
        reminders:
          TextToValueFormat[
            notificationPreferenceDetails?.reminders?.selected
          ] || "1",
        biller_announcements:
          billerTextToValueFormat[
            notificationPreferenceDetails?.biller_announcements?.selected
          ] || "1",
        email:
          notificationPreferenceDetails?.updated_email ??
          notificationPreferenceDetails.email,
        email_updated_date: notificationPreferenceDetails?.email_updated_date,
        is_phone_verified: notificationPreferenceDetails?.is_phone_verified,
        phone_no:
          notificationPreferenceDetails?.phone_no &&
          notificationPreferenceDetails?.phone_no != 0
            ? notificationPreferenceDetails?.phone_no
            : "",
        // notificationPreferenceDetails?.phone_no,
        updated_email: notificationPreferenceDetails.updated_email,
      });
    }
  }, [notificationPreferenceDetails]);
  const handleChange = (field: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  // contact actions
  const handleConfirm = () => {
    // console.log(value);

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "5");
    formData.append("notification", "1");
    formData.append("remove_phone", "1");

    dispatch(
      updateAccountInfo(token, formData, true, () => {
        getPrefDetails();
        setOpenConfirm(false);
      })
    );

    // model_open:5
    // remove_phone:1
    // acl_role_id:4
    // customer_id:810"

    // setContacts((prev) => prev.filter((c) => c.value !== value));
  };

  const handleResendVerification = (value: string) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("notification_email", value);

    dispatch(updateAccountInfo(token, formData, true, null));

    console.log("Resend verification for:", value);
    // API call here
  };

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
  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const handleSave = () => {
    console.log("Saved preferences:", preferences);

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "3");
    formData.append("notification_new_bill", preferences.new_bill);
    formData.append("notification_payment", preferences.payment_confirmation);
    formData.append("notification_reminder", preferences.reminders);
    formData.append("notification_biller", preferences.biller_announcements);

    dispatch(updateAccountInfo(token, formData, true, getPrefDetails));
  };

  useEffect(() => {
    getPrefDetails();
  }, []);

  const getPrefDetails = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "15");

    dispatch(
      updateAccountInfo(
        token,
        formData,
        true,
        successCallBack,
        true,
        setContextLoading,
        true
      )
    );
  };

  const successCallBack = (res) => {
    setPreferences({
      new_bill: TextToValueFormat[res?.new_bill?.selected] || "1",
      payment_confirmation:
        TextToValueFormat[res?.payment_confirmation?.selected] || "1",
      reminders: TextToValueFormat[res?.reminders?.selected] || "1",
      biller_announcements:
        billerTextToValueFormat[res?.biller_announcements?.selected] || "1",
      email: res?.updated_email ?? res?.email,
      email_updated_date: res?.email_updated_date,
      is_phone_verified: res?.is_phone_verified,
      phone_no: res?.phone_no && res?.phone_no != 0 ? res?.phone_no : "",
      updated_email: res?.updated_email,
    });
    setContacts([
      {
        type: "phone",
        // value: res?.phone_no,
        value: res?.phone_no && res?.phone_no != 0 ? res?.phone_no : "",

        verified: res?.is_phone_verified == 1 ? true : false,
      },
      {
        type: "email",
        value: res?.updated_email ?? res?.email,
        verified: res?.email_updated_date == 1 ? true : false,
      },
    ]);
  };

  return (
    <SkeletonWrapper>
      <Box sx={{ pt: 0 }}>
        <Grid container spacing={2} justifyContent="space-between">
          <CardHeader
            title={
              <Typography ml={1} variant="h5">
                Communication Settings
              </Typography>
            }
          />

          <CardHeader
            subheader={
              <Typography variant="h6">
                Names :{CustomerInfo?.customer_name}
              </Typography>
            }
            title={
              <Typography variant="h5">
                Account No :{CustomerInfo?.acctnum}
              </Typography>
            }
          />
        </Grid>

        <Divider />

        {/* Contact methods section */}
        <Box p={2}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Your Contact Information
          </Typography>
          {contacts.map((contact) => (
            <Grid
              container
              key={contact.value}
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Grid item>
                <Typography>
                  {contact.type === "phone" ? "📱" : "📧"} {contact.value}
                </Typography>
              </Grid>
              <Grid
                item
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                gap={1}
              >
                {!contact?.value || contact?.value == "0" ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Plus size={16} />}
                    onClick={() => setPhoneModalOpen(true)}
                  >
                    Add
                  </Button>
                ) : contact.type === "email" && !preferences.updated_email ? (
                  <Chip label="Verified" color="success" size="small" />
                ) : contact.verified ? (
                  <Chip label="Verified" color="success" size="small" />
                ) : (
                  <>
                    <Chip label="Not Verified" color="warning" size="small" />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ArrowClockwise size={16} />}
                      onClick={() => handleResendVerification(contact.value)}
                    >
                      Resend
                    </Button>
                  </>
                )}
                {contact.type === "phone" &&
                  contact.value &&
                  contact.value !== "0" && (
                    <Button
                      color="error"
                      size="small"
                      variant="outlined"
                      startIcon={<Trash size={18} />}
                      onClick={() => setOpenConfirm(true)}
                      sx={{
                        borderColor: "error.main",
                        color: "error.main",
                        "& .MuiButton-startIcon svg": { color: "currentColor" }, // ensure svg follows text color
                      }}
                    >
                      Remove
                    </Button>
                  )}
              </Grid>
            </Grid>
          ))}
        </Box>

        <Divider />

        <Typography variant="h6" fontWeight="bold" mb={2} p={2}>
          Select your notification preference for each type of notice
        </Typography>
        {(userInfo?.is_phone_verified !== 1 ||
          !preferences?.phone_no ||
          preferences?.phone_no == "0") && (
          <Box
            sx={{
              // backgroundColor: (theme) => theme.palette.error.light,
              color: (theme) => theme.palette.error.dark,
              m: 2,
              borderRadius: 1,
              mb: 2,
              // p: 2,
            }}
          >
            <Typography variant="body2">
              Text messaging is not available as an option until you first
              validate your mobile phone number by selecting{" "}
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setPhoneModalOpen(true);
                }}
              >
                {preferences?.phone_no && preferences?.phone_no !== "0"
                  ? "Validate mobile phone number"
                  : "Add mobile phone number"}
              </Typography>
              .
            </Typography>
          </Box>
        )}

        <Grid container p={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography>New bill</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Select
                value={preferences.new_bill}
                onChange={(e) => handleChange("new_bill", e.target.value)}
              >
                <MenuItem
                  value="2"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Text
                </MenuItem>
                <MenuItem value="1">Email</MenuItem>
                <MenuItem
                  value="3"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Both
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container alignItems="center" p={2} pt={0}>
          <Grid item xs={12} sm={6}>
            <Typography>Payment confirmation</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Select
                value={preferences.payment_confirmation}
                onChange={(e) =>
                  handleChange("payment_confirmation", e.target.value)
                }
              >
                <MenuItem
                  value="2"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Text
                </MenuItem>
                <MenuItem value="1">Email</MenuItem>
                <MenuItem
                  value="3"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Both
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container p={2} alignItems="center" pt={0}>
          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <Typography>Due date reminder (5 days ahead)</Typography>
            <Tooltip
              title="Bill due reminders are sent 5 days prior to the due date. Scheduled and autopayment reminders are sent the day before they are scheduled."
              arrow
            >
              <IconButton edge="end">
                <Question size={20} color="#90caf9" weight="fill" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Select
                value={preferences.reminders}
                onChange={(e) => handleChange("reminders", e.target.value)}
              >
                <MenuItem
                  value="2"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Text
                </MenuItem>
                <MenuItem value="1">Email</MenuItem>
                <MenuItem
                  value="3"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Both
                </MenuItem>
                <MenuItem value="4">None</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container p={2} alignItems="center" pt={0}>
          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <Typography>Biller announcements</Typography>
            <Tooltip
              title="Biller announcements are typically service outages, emergency notices, conservation notices or general broadcast messages."
              placement="top"
              arrow
            >
              <IconButton edge="end">
                <Question size={20} color="#90caf9" weight="fill" />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Select
                value={preferences.biller_announcements}
                onChange={(e) =>
                  handleChange("biller_announcements", e.target.value)
                }
              >
                <MenuItem
                  value="1"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Text
                </MenuItem>
                <MenuItem value="0">Email</MenuItem>
                <MenuItem
                  value="2"
                  disabled={
                    userInfo?.is_phone_verified !== 1 ||
                    !preferences?.phone_no ||
                    preferences?.phone_no == "0"
                  }
                >
                  Both
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box p={2} display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            color="inherit"
            variant="outlined"
            sx={{
              color: colors.blue,
              borderColor: colors.blue,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.blue,
              "&:hover": {
                backgroundColor: colors["blue.3"],
              },
            }}
            color="primary"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>
      <ConfirmDialog
        open={openConfirm}
        title={"Remove Phone Number"}
        message={`Are you sure want to Remove this ${preferences?.phone_no} 
          Phone Number?`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setOpenConfirm(false)}
        loader={accountLoading}
      />
      <PhoneModal
        open={phoneModalOpen}
        // clickedDetails={clickedDetails}
        onClose={() => setPhoneModalOpen(false)}
        notificationPage={true}
      />
    </SkeletonWrapper>
  );
}

export default NotificationsSettings;
