import React, { useEffect, useMemo, useState } from "react";
import { updateAccountInfo, updateVoicePreference } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors, CustomerInfo } from "@/utils";
import { getLocalStorage, updateLocalStorageValue, IntuityUser } from "@/utils/auth";
import {
  Box,
  Button,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Switch,
  type SwitchProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useLoading } from "@/components/core/skeleton-context";
import PhoneModal from "@/components/auth/confirm-phone-modal";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import Header from '@/components/CommonComponents/Header';

import EmailDialog from "@/components/auth/confirm-email-modal";
import { ContactMethodsSection, type ContactMethod } from "./contact-methods-section";
import { NotificationPreferenceRow, type NotificationPreferenceOption } from "./notification-preference-row";
import { FileText, CreditCard, Calendar, Megaphone } from "@phosphor-icons/react";

const TEXT_TO_VALUE_FORMAT: Record<string, string> = {
  Text: "2",
  Email: "1",
  Both: "3",
  None: "4",
};

const BILLER_TEXT_TO_VALUE_FORMAT: Record<string, string> = {
  Text: "1",
  Email: "0",
  Both: "2",
  None: "3",
};

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
      "& .MuiSwitch-thumb": { backgroundColor: "#fff" },
      "& + .MuiSwitch-track": {
        backgroundColor: "#00C853",
        opacity: 1,
        border: 0,
        "&::before": { opacity: 1, color: "white" },
        "&::after": { opacity: 0, color: "white" },
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 24,
    height: 24,
    backgroundColor: "#bdbdbd",
  },
  "& .MuiSwitch-track": {
    borderRadius: 30 / 2,
    backgroundColor: "#bdbdbd50",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], { duration: 500 }),
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
    "&::before": { content: '"ON"', left: 8, opacity: 1 },
    "&::after": { content: '"OFF"', right: 8, opacity: 1, color: "#555" },
  },
  "& .Mui-checked + .MuiSwitch-track": {
    "&::before": { color: "#fff", opacity: 1 },
    "&::after": { color: "#fff", opacity: 0 },
  },
}));

const phoneGatedOptions = (textValue: string, bothValue: string): NotificationPreferenceOption[] => [
  { label: "Text", value: textValue, requiresVerifiedPhone: true },
  { label: "Email", value: "1" },
  { label: "Both", value: bothValue, requiresVerifiedPhone: true },
];

function NotificationsSettings() {
  const { setContextLoading } = useLoading();
  const dispatch = useDispatch();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openVoiceConfirm, setOpenVoiceConfirm] = useState(false);
  const [clickedState, setClickedState] = useState(false);

  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const userInfo: CustomerInfo = useMemo(
    () => dashBoardInfo?.customer ?? (getLocalStorage("intuity-customerInfo") as CustomerInfo),
    [dashBoardInfo?.customer]
  );

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  const { accountLoading, notificationPreferenceDetails } = useSelector(
    (state: RootState) => state?.Account
  );

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const defaultPreferences = {
    new_bill: "1",
    payment_confirmation: "1",
    reminders: "1",
    biller_announcements: "1",
    email: "",
    email_updated_date: "",
    is_phone_verified: 0,
    phone_no: "",
    updated_email: "",
  };

  const [preferences, setPreferences] = useState<any>(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState<any>(defaultPreferences);

  const [contacts, setContacts] = useState<ContactMethod[]>([
    {
      type: "email",
      value: preferences?.email,
      verified: preferences?.email_updated_date == 1,
    }, {
      type: "phone",
      value: preferences?.phone_no,
      verified: preferences?.is_phone_verified == 1,
    },
  ]);

  useEffect(() => {
    if (notificationPreferenceDetails) {
      setContacts([
        {
          type: "email",
          value: notificationPreferenceDetails?.updated_email ?? notificationPreferenceDetails?.email,
          verified: notificationPreferenceDetails?.email_updated_date == 1,
        },
        {
          type: "phone",
          value:
            notificationPreferenceDetails?.phone_no && notificationPreferenceDetails?.phone_no != 0
              ? notificationPreferenceDetails?.phone_no
              : "",
          verified: notificationPreferenceDetails?.is_phone_verified == 1,
        },
      ]);

      const nextPrefs = {
        new_bill: TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.new_bill?.selected] || "1",
        payment_confirmation:
          TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.payment_confirmation?.selected] || "1",
        reminders: TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.reminders?.selected] || "1",
        biller_announcements:
          BILLER_TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.biller_announcements?.selected] || "1",
        email: notificationPreferenceDetails?.updated_email ?? notificationPreferenceDetails.email,
        email_updated_date: notificationPreferenceDetails?.email_updated_date,
        is_phone_verified: notificationPreferenceDetails?.is_phone_verified,
        phone_no:
          notificationPreferenceDetails?.phone_no && notificationPreferenceDetails?.phone_no != 0
            ? notificationPreferenceDetails?.phone_no
            : "",
        updated_email: notificationPreferenceDetails.updated_email,
      };
      setPreferences(nextPrefs);
      setSavedPreferences(nextPrefs);
    }
  }, [notificationPreferenceDetails]);

  useEffect(() => {
    if (userInfo) {
      setClickedState(userInfo?.is_voice_optout == 0 ? false : true);
    }
  }, [userInfo]);

  const handleVoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClickedState(event.target.checked);
    setOpenVoiceConfirm(true);
  };

  const handleVoiceConfirm = () => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("is_voice_optout", clickedState ? "1" : "0");
    dispatch(
      updateVoicePreference(formData, () => {
        updateLocalStorageValue("intuity-customerInfo", "is_voice_optout", clickedState ? 1 : 0);
      })
    );
    setOpenVoiceConfirm(false);
  };

  const handleChange = (field: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null = typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;

  const getPrefDetails = () => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "15");

    dispatch(updateAccountInfo(formData, true, successCallBack, true, setContextLoading, true));
  };

  useEffect(() => {
    getPrefDetails();
  }, [userId]);

  const successCallBack = (res) => {
    const nextPrefs = {
      new_bill: TEXT_TO_VALUE_FORMAT[res?.new_bill?.selected] || "1",
      payment_confirmation: TEXT_TO_VALUE_FORMAT[res?.payment_confirmation?.selected] || "1",
      reminders: TEXT_TO_VALUE_FORMAT[res?.reminders?.selected] || "1",
      biller_announcements: BILLER_TEXT_TO_VALUE_FORMAT[res?.biller_announcements?.selected] || "1",
      email: res?.updated_email ?? res?.email,
      email_updated_date: res?.email_updated_date,
      is_phone_verified: res?.is_phone_verified,
      phone_no: res?.phone_no && res?.phone_no != 0 ? res?.phone_no : "",
      updated_email: res?.updated_email,
    };
    setPreferences(nextPrefs);
    setSavedPreferences(nextPrefs);
    setContacts([
      {
        type: "phone",
        value: res?.phone_no && res?.phone_no != 0 ? res?.phone_no : "",
        verified: res?.is_phone_verified == 1,
      },
      {
        type: "email",
        value: res?.updated_email ?? res?.email,
        verified: res?.email_updated_date == 1,
      },
    ]);
  };

  const handleConfirm = () => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "5");
    formData.append("notification", "1");
    formData.append("remove_phone", "1");

    dispatch(
      updateAccountInfo(formData, true, () => {
        getPrefDetails();
        setOpenConfirm(false);
      })
    );
  };

  const handleResendVerification = (value: string) => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("notification_email", value);

    dispatch(updateAccountInfo(formData, true, null));
  };

  const handleCancel = () => {
    setPreferences({
      new_bill: TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.new_bill?.selected] || "1",
      payment_confirmation:
        TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.payment_confirmation?.selected] || "1",
      reminders: TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.reminders?.selected] || "1",
      biller_announcements:
        BILLER_TEXT_TO_VALUE_FORMAT[notificationPreferenceDetails?.biller_announcements?.selected] || "1",
      email: notificationPreferenceDetails?.updated_email ?? notificationPreferenceDetails.email,
      email_updated_date: notificationPreferenceDetails?.email_updated_date,
      is_phone_verified: notificationPreferenceDetails?.is_phone_verified,
      phone_no:
        notificationPreferenceDetails?.phone_no && notificationPreferenceDetails?.phone_no != 0
          ? notificationPreferenceDetails?.phone_no
          : "",
      updated_email: notificationPreferenceDetails.updated_email,
    })
  }

  const handleSave = () => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "3");
    formData.append("notification_new_bill", preferences.new_bill);
    formData.append("notification_payment", preferences.payment_confirmation);
    formData.append("notification_reminder", preferences.reminders);
    formData.append("notification_biller", preferences.biller_announcements);

    dispatch(updateAccountInfo(formData, true, getPrefDetails));
  };

  const phoneVerified =
    preferences?.is_phone_verified === 1 && !!preferences?.phone_no && preferences?.phone_no !== "0";

  const hasChanges =
    preferences.new_bill !== savedPreferences.new_bill ||
    preferences.payment_confirmation !== savedPreferences.payment_confirmation ||
    preferences.reminders !== savedPreferences.reminders ||
    preferences.biller_announcements !== savedPreferences.biller_announcements;

  return (
    <>
      <Box sx={{ pt: 0 }}>
        <Header fontWeight={600} title="Notification Settings" description="Choose how you'd like to hear from us. Your contact details are shown below." />

        {/* <Divider /> */}

        <ContactMethodsSection
          contacts={contacts}
          hasUpdatedEmail={!!preferences.updated_email}
          onAddContact={(type) => (type === "phone" ? setPhoneModalOpen(true) : setEmailModalOpen(true))}
          onResendVerification={handleResendVerification}
          onRemovePhone={() => setOpenConfirm(true)}
        />

        {/* <Divider /> */}

        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mx: 2, my: 2, px: 2, py: 1.5, border: "1px solid #DCDFE4", borderRadius: 1 }}
        >
          <Typography variant="h6" fontWeight={500}>
            Enable Emergency Calls to My Phone
          </Typography>
          <Stack
            component="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
            sx={{ all: "unset", display: "flex" }}
          >
            <IOSSwitch
              checked={clickedState}
              onChange={handleVoiceChange}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
            />
          </Stack>
        </Stack>

        {/* <Typography variant="h6" fontWeight="bold" mt={3} mb={2} px={2}>
          Select your notification preference for each type of notice
        </Typography>

        {!phoneVerified && (
          <Box sx={{ color: (theme) => theme.palette.error.dark, m: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2">
              Text messaging is not available as an option until you first validate your mobile phone number
              by selecting{" "}
              <Typography
                component="span"
                sx={{ color: "primary.main", textDecoration: "underline", cursor: "pointer" }}
                onClick={() => setPhoneModalOpen(true)}
              >
                {preferences?.phone_no && preferences?.phone_no !== "0"
                  ? "Validate mobile phone number"
                  : "Add mobile phone number"}
              </Typography>
              .
            </Typography>
          </Box>
        )} */}

        <TableContainer sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden", mt: 2, mx: 2, width: "calc(100% - 32px)", boxShadow: "none" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "#475569", fontSize: "14px", py: 2, px: 3, borderBottom: "1px solid #E2E8F0" }}>
                  Notification Type
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", fontSize: "14px", py: 2, borderBottom: "1px solid #E2E8F0", width: "12%" }}>
                  EMAIL
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", fontSize: "14px", py: 2, borderBottom: "1px solid #E2E8F0", width: "12%" }}>
                  TEXT
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", fontSize: "14px", py: 2, borderBottom: "1px solid #E2E8F0", width: "12%" }}>
                  BOTH
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", fontSize: "14px", py: 2, borderBottom: "1px solid #E2E8F0", width: "12%" }}>
                  NONE
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <NotificationPreferenceRow
                label="New Bill"
                icon={<FileText size={20} />}
                iconBgColor="#EBF3FF"
                iconColor="#1A73E8"
                badge="Required"
                description="Sent when your bill is ready to view & pay."
                value={preferences.new_bill}
                options={phoneGatedOptions("2", "3")}
                onChange={(value) => handleChange("new_bill", value)}
                phoneVerified={phoneVerified}
              />
              <NotificationPreferenceRow
                label="Payment Confirmation"
                icon={<CreditCard size={20} />}
                iconBgColor="#E6F4EA"
                iconColor="#1E8E3E"
                badge="Required"
                description="Receipt sent after each payment is processed."
                value={preferences.payment_confirmation}
                options={phoneGatedOptions("2", "3")}
                onChange={(value) => handleChange("payment_confirmation", value)}
                phoneVerified={phoneVerified}
              />
              <NotificationPreferenceRow
                label="Due Date Reminder"
                icon={<Calendar size={20} />}
                iconBgColor="#F3E8FF"
                iconColor="#9333EA"
                badge="Optional"
                description="Bill due date, upcoming autopay, etc. reminders."
                value={preferences.reminders}
                options={[...phoneGatedOptions("2", "3"), { label: "None", value: "4" }]}
                onChange={(value) => handleChange("reminders", value)}
                phoneVerified={phoneVerified}
                tooltip="Bill due reminders are sent 5 days prior to the due date. Scheduled and autopayment reminders are sent the day before they are scheduled."
              />
              <NotificationPreferenceRow
                label="Biller Announcements"
                icon={<Megaphone size={20} />}
                iconBgColor="#FFF4E5"
                iconColor="#F2994A"
                badge="Required"
                description="Service alerts, outages, emergencies, etc."
                value={preferences.biller_announcements}
                options={[
                  { label: "Text", value: "1", requiresVerifiedPhone: true },
                  { label: "Email", value: "0" },
                  { label: "Both", value: "2", requiresVerifiedPhone: true },
                ]}
                onChange={(value) => handleChange("biller_announcements", value)}
                phoneVerified={phoneVerified}
                tooltip="Biller announcements are typically service outages, emergency notices, conservation notices or general broadcast messages."
              />
            </TableBody>
          </Table>
        </TableContainer>

        <Box p={2} display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            color="inherit"
            variant="outlined"
            disabled={!hasChanges}
            sx={{
              color: hasChanges ? colors.blue : undefined,
              borderColor: hasChanges ? colors.blue : undefined,
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!hasChanges}
            sx={{ backgroundColor: colors.blue, "&:hover": { backgroundColor: colors["blue.3"] } }}
            color="primary"
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </Box>
      </Box >

      {openVoiceConfirm && (
        <ConfirmDialog
          open={openVoiceConfirm}
          title="Voice Call"
          message={`Are you sure want to ${clickedState ? "ON" : "OFF"} it`}
          confirmLabel="Yes, Confirm"
          cancelLabel="Cancel"
          onConfirm={handleVoiceConfirm}
          onCancel={() => {
            setOpenVoiceConfirm(false);
            setClickedState((prev) => !prev);
          }}
        />
      )}
      <ConfirmDialog
        open={openConfirm}
        title="Remove Phone Number"
        message={`Are you sure want to Remove this ${preferences?.phone_no} Phone Number?`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setOpenConfirm(false)}
        loader={accountLoading}
      />
      <PhoneModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        notificationPage={true}
        onSuccess={getPrefDetails}
      />
      <EmailDialog
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        clickedDetails={{ id: userId }}
        onSuccess={getPrefDetails}
      />
    </>
  );
}

export default NotificationsSettings;
