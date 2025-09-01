import React, { useEffect, useReducer } from "react";
import { getConfirmInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@/hooks/use-user";
import EmailDialog from "./confirm-email-modal";
import PhoneModal from "./confirm-phone-modal";
import { paths } from "@/utils/paths";
import { useNavigate } from "react-router";
import TwoFAModal from "./2fa-login";

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

  const { accountLoading, confirmInfo } = useSelector(
    (state: RootState) => state?.Account
  );

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const user_id = stored?.body?.customer_id;

  const reqCustomer = () => {
    if (Array.isArray(confirmInfo?.customers)) {
      const customer = confirmInfo?.customers?.filter(
        (item) => item?.id == user_id
      );
      return customer?.[0];
    }
    return [];
  };

  const hanldeConfirm = () => {
    const role_id = stored?.body?.acl_role_id;
    const token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", role_id);
    formData.append("customer_id", user_id);
    formData.append("is_post", "1");
    formData.append("company_login", "cape-royale1");
    dispatch(getConfirmInfo(token, formData, successCallBack));
  };

  const { checkSession } = useUser();

  const successCallBack = async () => {
    await checkSession?.();
    navigate(paths.dashboard.overview());
  };

  useEffect(() => {
    if (
      confirmInfo?.company?.require_2fa == 1 &&
      reqCustomer()?.is_phone_verified == 1
    ) {
      // setTwoFAModalVisible(true);
      localDispatch({ type: "TWO_FA_MODAL", payload: true });
    }
  }, [confirmInfo]);

  return (
    <Box>
      <Typography variant="subtitle1" mb={3}>
        Hi, {confirmInfo?.user?.name}
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={4}>
        For <strong>additional security</strong> on your{" "}
        {confirmInfo?.company?.company_name} utility account profile, please
        review and confirm your contact information.
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

                  {/* Email Info */}
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

      <Grid container spacing={2} mt={2} alignItems="center">
        <Grid item xs={6}>
          <Link
            href={paths.dashboard.overview()}
            underline="none"
            fontWeight="bold"
            sx={{
              display: "inline-block",
              color: colors.blue,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            SKIP
          </Link>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Button
            fullWidth={isMobile}
            variant="contained"
            sx={{
              px: 4,
              backgroundColor: colors.blue,
              "&:hover": {
                backgroundColor: colors["blue.3"],
              },
              fontSize: { xs: "0.8rem", sm: "1rem" },
            }}
            onClick={hanldeConfirm}
          >
            CONFIRM
          </Button>
        </Grid>
      </Grid>

      {/* Modals */}
      <PhoneModal
        open={phoneModalOpen}
        clickedDetails={clickedDetails}
        onClose={() => localDispatch({ type: "PHONE_MODAL", payload: false })}
      />
      <EmailDialog
        open={emailModalOpen}
        clickedDetails={clickedDetails}
        onClose={() => localDispatch({ type: "EMAIL_MODAL", payload: false })}
      />
      <TwoFAModal
        open={twoFAModalVisible}
        onClose={() => {
          localDispatch({ type: "TWO_FA_MODAL", payload: false });
        }}
        customerData={reqCustomer()}
      />

      {accountLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
