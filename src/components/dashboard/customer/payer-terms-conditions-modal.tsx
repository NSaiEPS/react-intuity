import { useState } from "react";
import { updatePaperLessInfo } from "@/state/features/accountSlice";
import { getNotificationList, getDashboardInfo } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors, CustomerInfo } from "@/utils";
import { getLocalStorage, updateLocalStorageValue, IntuityUser } from "@/utils/auth";
import {
  CardActions,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { X } from "@phosphor-icons/react";
import { Button } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";
import Header from '@/components/CommonComponents/header-common';


const PayerTermsConditionsModal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [payerTermsModalOpen, setPayerTermsModalOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: CustomerInfo = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : dashBoardInfo?.customer
      ? dashBoardInfo?.customer
      : getLocalStorage("intuity-customerInfo");

  const isPaperLessOn = CustomerInfo?.paperless === 1;
  const dispatch = useDispatch();
  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;

  const handleSave = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("paperless", isPaperLessOn ? "off" : "on");
    dispatch(updatePaperLessInfo(formData, "paperless", successCallBack));
  };

  const successCallBack = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("onlyread", "0");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");

    dispatch(getNotificationList(formData));
    updateLocalStorageValue(
      "intuity-customerInfo",
      "paperless",
      isPaperLessOn ? 0 : 1
    );
    if (roleId && userId) {
      dispatch(getDashboardInfo(roleId, userId));
    }
    setAgreeTerms(false);
  };

  return (
    <Grid>
      <Header title="Paperless Billing" />
      <Divider />

      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography
          variant="h5"
          sx={{
            color: colors.blue,
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
        >
          {isPaperLessOn ? "Turn Off Paperless Billing?" : "Go Paperless?"}
        </Typography>

        <Typography
          sx={{
            color: "#374151",
            fontSize: { xs: "0.95rem", sm: "1rem" },
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          {isPaperLessOn
            ? "You’re about to eliminate paperless billing. Future bills will be sent by mail and available online."
            : "You’re about to enroll in paperless billing. Future bills will be available online and you’ll no longer receive paper bills by mail."}
        </Typography>

        {!isPaperLessOn && (
          <FormGroup sx={{ mb: 1 }}>
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
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1.5,
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outlined"
          textTransform="none"
          fullWidth={isMobile}
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            backgroundColor: "white",
            borderRadius: "10px",
            height: "41px",
            paddingLeft: isMobile ? "16px" : "20px",
            paddingRight: isMobile ? "16px" : "20px",
            fontSize: isMobile ? "0.9rem" : "0.95rem",
            fontWeight: 600,
            width: isMobile ? "100%" : "auto",
          }}
          disabled={accountLoading}
          onClick={() => {
            setAgreeTerms(false);
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={accountLoading || (!isPaperLessOn && !agreeTerms)}
          loading={accountLoading}
          type="submit"
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          fullWidth={isMobile}
          style={{
            borderRadius: "10px",
            height: "41px",
            minHeight: "41px",
            fontSize: isMobile ? "0.9rem" : "0.95rem",
            fontWeight: 600,
            paddingLeft: isMobile ? "16px" : "20px",
            paddingRight: isMobile ? "16px" : "20px",
            width: isMobile ? "100%" : "auto",
          }}
          onClick={handleSave}
        >
          {isPaperLessOn ? "Turn Off Paperless Billing" : "Enroll in Paperless Billing"}
        </Button>
      </CardActions>

      {/* Payer Terms and Conditions Dialog */}
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
            <X size={24} color={colors.blue} />
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
    </Grid>
  );
};

export default PayerTermsConditionsModal;
