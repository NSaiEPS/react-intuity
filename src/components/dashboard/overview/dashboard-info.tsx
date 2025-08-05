import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  updateAccountInfo,
  updatePaperLessInfo,
} from "@/state/features/accountSlice";
import {
  getDashboardInfo,
  getNotificationList,
  setAutoPaySettings,
  setPaperLessSettings,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { boarderRadius } from "@/utils";
import { getLocalStorage, updateLocalStorageValue } from "@/utils/auth";
import { useSelect } from "@mui/base";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { ListBullets as ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { useDispatch, useSelector } from "react-redux";

import { paths } from "@/utils/paths";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

export interface DashboardInfoProps {
  sx?: SxProps;
  type?: string;
  isActive?: boolean;
  value: string;
  typeofUser: string;
  apiCall?: boolean;
}

// Styled Switch with ON/OFF labels
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

export function DashboardInfo({
  sx,
  type,
  isActive = false,
  value,
  typeofUser,
  apiCall = false,
}: DashboardInfoProps): React.JSX.Element {
  const navigate = useNavigate();
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const { allow_auto_payment, paperless, notification_reminder } =
    dashBoardInfo?.body?.company || {};
  const [checked, setChecked] = React.useState(
    dashBoardInfo?.body?.[typeofUser]?.[value] === 1 ? true : false
  );
  React.useEffect(() => {
    if (dashBoardInfo?.body) {
      setChecked(
        dashBoardInfo?.body?.[typeofUser]?.[value] === 1 ? true : false
      );
    }
  }, [dashBoardInfo?.body]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setChecked();
    setClickedState(event.target.checked);
    setOpenConfirm(true);
  };
  const [clickedState, setClickedState] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
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

  let roleId = stored?.body?.acl_role_id;
  let userId = stored?.body?.customer_id;
  let token = stored?.body?.token;

  const getPrefDetails = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("model_open", "15");

    dispatch(
      updateAccountInfo(token, formData, true, notificationResponse, true)
    );
  };
  const handleConfirm = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    // logic for destructive action
    if (type === "paperLess") {
      // dispatch(setPaperLessSettings(checked ? 'on' : 'off'));
      formData.append("paperless", clickedState ? "on" : "off");

      dispatch(
        updatePaperLessInfo(token, formData, "paperless", () =>
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
      formData.append("is_form", "1");

      dispatch(
        updatePaperLessInfo(token, formData, "autopay", () =>
          successCallBack("autopay", clickedState)
        )
      );
    } else {
      const formData = new FormData();

      let roleId = stored?.body?.acl_role_id;
      let userId = stored?.body?.customer_id;
      let token = stored?.body?.token;

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", userId);
      formData.append("model_open", "3");

      formData.append("notification_reminder", clickedState ? "3" : "4");
      formData.append("notification_new_bill", notificationPrefrences.new_bill);
      formData.append(
        "notification_payment",
        notificationPrefrences.payment_confirmation
      );

      formData.append(
        "notification_biller",
        notificationPrefrences.biller_announcements
      );

      dispatch(updateAccountInfo(token, formData, true, getPrefDetails));

      setChecked(clickedState ? true : false);
    }
    setOpenConfirm(false);
  };
  // const successCallBack = () => {
  //   const stored = (getLocalStorage('intuity-user'));

  //   let roleId = stored?.body?.acl_role_id;
  //   let userId = stored?.body?.customer_id;
  //   let token = stored?.body?.token;
  //   dispatch(getDashboardInfo(roleId, userId, token));

  // };

  const successCallBack = (type, clickedState) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("onlyread", "0");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");
    // formData.append('is_form', '0');

    dispatch(getNotificationList(token, formData));
    updateLocalStorageValue("intuity-customerInfo", type, clickedState ? 1 : 0);
    setChecked(clickedState);
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
    let value = res?.reminders?.selected;
    // console.log(res, 'successCallBack');
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
                  ? "Paperless"
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
                setClickedState(!clickedState);
                setOpenConfirm(true);
              }} // 👈 prevent the card click
              sx={{
                all: "unset", // Reset button styles
                display: "flex",

                width: "70px",
              }}
              // onChange={handleChange}
              // disabled={type === 'notification'}
            >
              <IOSSwitch
                checked={checked}
                onChange={handleChange}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  e.stopPropagation()
                } // 👈 prevent the card click
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={openConfirm}
        title={
          type === "paperLess"
            ? "Paperless"
            : type === "notification"
            ? "Notifications"
            : "Auto Pay"
        }
        message={`Are you sure want to ${!checked ? "ON" : "OFF"} it`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setOpenConfirm(false)}
      />
    </>
  );
}
