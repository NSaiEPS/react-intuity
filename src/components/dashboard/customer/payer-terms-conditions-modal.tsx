import { useEffect, useState } from "react";
import { updatePaperLessInfo } from "@/state/features/accountSlice";
import { getNotificationList } from "@/state/features/dashBoardSlice";
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
} from "@mui/material";
import { X } from "@phosphor-icons/react";
import { Button } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";
import Header from '@/components/CommonComponents/Header';


const PayerTermsConditionsModal = () => {
  const [payerTermsModalOpen, setPayerTermsModalOpen] = useState(false);
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: CustomerInfo = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  const [isPaperLessOn, setIsPaperLessOn] = useState(false);
  const dispatch = useDispatch();
  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  useEffect(() => {
    setIsPaperLessOn(CustomerInfo?.paperless === 1 ? true : false);
  }, [CustomerInfo?.paperless]);
  const handleChange = () => {
    setIsPaperLessOn((prev) => !prev);
  };

  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  // let roleId = stored?.user?.body?.acl_role_id;
  // let userId = stored?.user?.body?.id;
  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const handleSave = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("paperless", isPaperLessOn ? "on" : "off");
    dispatch(updatePaperLessInfo(formData, "", successCallBack));
  };
  const successCallBack = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("onlyread", "0");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");
    // formData.append('is_form', '0');

    dispatch(getNotificationList(formData));
    updateLocalStorageValue(
      "intuity-customerInfo",
      "paperless",
      isPaperLessOn ? 1 : 0
    );
  };

  return (
    <Grid>
      <Header title="Paperless" />
      <Divider />

      <CardContent>
        <Grid container spacing={6} wrap="wrap" justifyContent="space-between">
          <Grid m={5} sm={6} xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox onChange={handleChange} checked={isPaperLessOn} />
                }
                label={
                  <>
                    By enabling Paperless, I agree to the{" "}
                    <Typography
                      component="span" // ensures it stays inline with the text
                      sx={{
                        color: colors.blue,

                        cursor: "pointer",
                        display: "inline-block",
                        transition: "border-bottom 0.2s ease",
                        borderBottom: "2px solid transparent",
                        "&:hover": {
                          borderBottom: "2px solid",
                          borderColor: colors["blue.1"],
                        },
                      }}
                      // Optional: onClick handler if you want to trigger something
                      onClick={() => {
                        setPayerTermsModalOpen(true);
                      }}
                    >
                      Payer Terms and Conditions
                    </Typography>
                  </>
                }
              />
            </FormGroup>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          textTransform="capitalize"
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            borderRadius: "12px",
            height: "41px",
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={
            accountLoading ||
            (CustomerInfo?.paperless === 1 && isPaperLessOn) ||
            (CustomerInfo?.paperless !== 1 && !isPaperLessOn)
          }
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
            // backgroundColor: 'red',
          }}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </CardActions>
      <Dialog open={payerTermsModalOpen} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ ml: 1, p: 2 }}>
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

        <DialogContent>
          <Typography variant="h6"></Typography>
          <Typography
            component="span" // ensures it stays inline with the text
            sx={{
              display: "inline-block",
              transition: "border-bottom 0.2s ease",
              borderBottom: "2px solid transparent",
            }}
          >
            Payer is electing to receive an electronic record of their bill.
            When Payer selects to receive an electronic record of their bill,
            Payer agrees to be automatically enrolled in and consents to
            paperless billing. Payer may withdraw its consent to Paperless at
            any time by updating Payer’s online profile, which can be achieved
            from the Payer’s online account, or by contacting the Biller.
          </Typography>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default PayerTermsConditionsModal;
