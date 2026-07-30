import React, { useEffect, useReducer } from "react";
import { getConfirmInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import type { CustomerAccount } from "@/types/domain";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Button } from "nsaicomponents";

import { useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "@/hooks/redux";
import { useUser } from "@/hooks/use-user";
import EmailDialog from "./confirm-email-modal";
import PhoneModal from "./confirm-phone-modal";
import { paths } from "@/utils/paths";
import { useNavigate } from "react-router";
import TwoFAModal from "./2fa-login";
import secureLocalStorage from "react-secure-storage";

type State = {
  phoneModalOpen: boolean;
  emailModalOpen: boolean;
  clickedDetails: any;
  twoFAModalVisible: boolean;
};

type Action =
  | { type: "PHONE_MODAL"; payload: boolean }
  | { type: "EMAIL_MODAL"; payload: boolean }
  | { type: "TWO_FA_MODAL"; payload: boolean }
  | { type: "CLICKED_DETAILS"; payload: any };

// -------------------- Reducer --------------------
const initialState: State = {
  phoneModalOpen: false,
  emailModalOpen: false,
  clickedDetails: {},
  twoFAModalVisible: false,
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "PHONE_MODAL":
      return { ...state, phoneModalOpen: action.payload };
    case "EMAIL_MODAL":
      return { ...state, emailModalOpen: action.payload };
    case "TWO_FA_MODAL":
      return { ...state, twoFAModalVisible: action.payload };

    case "CLICKED_DETAILS":
      return { ...state, clickedDetails: action.payload };
    default:
      return state;
  }
};

// -------------------- Component --------------------
export function ConfirmInfoDetails(): React.JSX.Element {
  const [
    { phoneModalOpen, emailModalOpen, clickedDetails, twoFAModalVisible },
    localDispatch,
  ] = useReducer(reducer, initialState);
  const location = useLocation();

  console.log(twoFAModalVisible, 'twoFAModalVisible');


  const two_fa_status = location.state?.two_fa_status ?? false;
  const { accountLoading: loading, confirmInfo } = useSelector(
    (state: RootState) => state?.Account
  );

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const user_id = stored?.body?.customer_id;

  // const skip2FARef = React.useRef(false);
  const suppress2FAModalRef = React.useRef(false);

  const reqCustomer = (): CustomerAccount | undefined => {
    if (Array.isArray(confirmInfo?.customers)) {
      const customer = confirmInfo?.customers?.filter(
        (item: CustomerAccount) => item?.id == user_id
      );
      return customer?.[0];
    }
    return undefined;
  };

  const hanldeConfirm = () => {
    const role_id = stored?.body?.acl_role_id;
    const formData = new FormData();

    formData.append("acl_role_id", role_id);
    formData.append("customer_id", user_id);
    formData.append("is_post", "1");
    formData.append("company_login", "cape-royale1");
    dispatch(getConfirmInfo(formData, successCallBack));
  };

  const refreshData = () => {
    suppress2FAModalRef.current = true;

    const role_id = stored?.body?.acl_role_id;
    const formData = new FormData();
    console.log("refreshData");

    formData.append("acl_role_id", role_id);
    formData.append("customer_id", user_id);
    formData.append("company_login", "cape-royale1");

    dispatch(getConfirmInfo(formData));
  };

  const { checkSession } = useUser();

  const successCallBack = async (action?: string) => {
    if (action) {
      secureLocalStorage.setItem("is_skipped", action);
    }
    await checkSession?.();
    navigate(paths.dashboard.overview());
  };

  useEffect(() => {
    if (suppress2FAModalRef.current) {
      console.log("Effect Fired", suppress2FAModalRef.current);
      setTimeout(() => {
        suppress2FAModalRef.current = false;
      }, 0);
      return;
    }

    if (
      confirmInfo?.company?.require_2fa == 1 &&
      reqCustomer()?.is_phone_verified == 1 && !two_fa_status
    ) {
      // setTwoFAModalVisible(true);
      localDispatch({ type: "TWO_FA_MODAL", payload: true });
    }
  }, [confirmInfo, two_fa_status]);

  const isSingleCard = confirmInfo?.customers?.length === 1;

  return (
    <Box>
      {/* <Typography variant="subtitle1" mb={3}>
        Hi, {confirmInfo?.user?.name}
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={4}>
        For <strong>additional security</strong> on your{" "}
        {confirmInfo?.company?.company_name} utility account profile, please
        review and confirm your contact information.
      </Typography> */}

      <Typography variant="h5" fontWeight={700} mb={3}>
        Please confirm your account information

      </Typography>

      <Grid container spacing={3}>
        {confirmInfo?.customers?.map((account, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card
              sx={{
                borderRadius: boarderRadius.card,
                height: "100%",
              }}
              variant="outlined"
            >
              <CardContent>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  mb={2}
                  fontWeight="bold"
                  textAlign={isMobile ? "center" : "left"}
                >
                  Account No. {account.acctnum}
                </Typography>

                <Stack spacing={3}>
                  {/* Mobile Number Info */}
                  <Stack spacing={1}>
                    <Box
                      bgcolor="grey.300"
                      p={1}
                      fontWeight="bold"
                      borderRadius={1}
                    >
                      Mobile No. Information
                    </Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body1">
                        {account?.country_code?.toString()
                          ? `+${account?.country_code}`
                          : ""}
                        {account.phone_no}
                      </Typography>
                      <Typography
                        onClick={() => {
                          localDispatch({
                            type: "CLICKED_DETAILS",
                            payload: account,
                          });
                          localDispatch({ type: "PHONE_MODAL", payload: true });
                        }}
                        sx={{
                          fontSize: "0.875rem",
                          color: colors.blue,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Edit
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Box
                      bgcolor="grey.300"
                      p={1}
                      fontWeight="bold"
                      borderRadius={1}
                    >
                      Notification Email Address
                    </Box>
                    <Typography variant="body2">
                      This is the email address you will use to receive
                      notifications
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", mt: 1 }}
                      >
                        {account.email}
                      </Typography>
                      <Typography
                        onClick={() => {
                          localDispatch({
                            type: "CLICKED_DETAILS",
                            payload: account,
                          });
                          localDispatch({ type: "EMAIL_MODAL", payload: true });
                        }}
                        sx={{
                          fontSize: "0.875rem",
                          color: colors.blue,
                          cursor: "pointer",
                          ml: { xs: 0, sm: 1 },
                          mt: { xs: 1, sm: 0 },
                          whiteSpace: "nowrap",
                        }}
                      >
                        Edit
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mt={2} alignItems="center"
        sx={
          isSingleCard
            ? { maxWidth: { md: "50%" } }
            : {}
        }
      >
        <Grid item xs={6}>
          {/* <MUILink
            to={paths.dashboard.overview()}
            component={RouterLink}
            onClick={successCallBack}
            underline="none"
            fontWeight="bold"
            sx={{
              display: "inline-block",
              color: colors.blue,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            SKIP
          </MUILink> */}
          <Button
            variant="outlined"
            textTransform="none"
            onClick={() => successCallBack('skip')}
            style={{
              borderRadius: "12px",
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontWeight: 600,
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: "#fff",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Skip
          </Button>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Button
            disabled={loading}
            loading={loading}
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
              width: isMobile ? "100%" : "auto",
            }}
            onClick={hanldeConfirm}
          >
            Confirm
          </Button>
        </Grid>
      </Grid>

      {/* Modals */}
      <PhoneModal
        open={phoneModalOpen}
        clickedDetails={clickedDetails}
        onClose={() => localDispatch({ type: "PHONE_MODAL", payload: false })}
        onSuccess={refreshData}
      />
      <EmailDialog
        open={emailModalOpen}
        clickedDetails={clickedDetails}
        onClose={() => localDispatch({ type: "EMAIL_MODAL", payload: false })}
        onSuccess={refreshData}
      />
      <TwoFAModal
        open={twoFAModalVisible}
        onClose={() => {
          localDispatch({ type: "TWO_FA_MODAL", payload: false });
        }}
        customerData={reqCustomer() as any}
      />

    </Box>
  );
}
