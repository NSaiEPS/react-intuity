import * as React from "react";

import { updatePaperLessInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors, decryptFunction } from "@/utils";
import { getLocalStorage, updateLocalStorageValue } from "@/utils/auth";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";

import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { Button } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { SelectPaymentMethod } from "@/components/dashboard/customer/select-payment-method";
import { Radio, Stack } from "@mui/material";

export default function AutoPayDetails(): React.JSX.Element {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
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
  const userInfo: any = getLocalStorage("intuity-customerInfo");

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  const [isAutoPay, setisAutoPay] = React.useState(false);
  const dispatch = useDispatch();
  const [autoPayDetails, setAutoPayDetails] = React.useState(null);
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const [selectedCardDetails, setSelectedCardDetails] =
    React.useState<any>(null);

  console.log(autoPayDetails, selectedCardDetails, "autoPayDetails");

  React.useEffect(() => {
    setisAutoPay(CustomerInfo?.autopay === 1 ? true : false);

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    dispatch(
      updatePaperLessInfo(token, formData, "autopay", setAutoPayDetails, true)
    );
  }, [CustomerInfo?.autopay]);
  const handleChange = () => {
    setisAutoPay((prev) => !prev);
  };
  const handleSaveChanges = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    if (selectedCardDetails) {
      // "id_select_card:143
      // auto_pay_model_save_card:0
      // payment_method_id_model:0bd1349b300245c988edae9bdf131644
      // acl_role_id:4
      // customer_id:810
      // is_form:1"

      formData.append("payment_method_id_model", selectedCardDetails?.token);

      // formData.append("is_form", "1");
      formData.append("auto_pay", isAutoPay ? "1" : "0");

      formData.append("id_select_card", "635");
      formData.append("auto_pay_model_save_card", "0");
      dispatch(
        updatePaperLessInfo(token, formData, "autopay", successCallBack)
      );
      return;
    }
    formData.append("auto_pay", isAutoPay ? "1" : "0");
    // formData.append('id', dashBoardInfo?.body?.autopay_setting_id);
    // formData.append("id", userInfo?.autopay_setting_id);
    // formData.append('payment_method_id', dashBoardInfo?.body?.payment_method_id);
    formData.append("payment_method_id", userInfo?.payment_method_id);
    dispatch(updatePaperLessInfo(token, formData, "autopay", successCallBack));
  };
  const successCallBack = () => {
    updateLocalStorageValue(
      "intuity-customerInfo",
      "autopay",
      isAutoPay ? 1 : 0
    );
  };
  console.log(selectedCardDetails, "selectedCardDetails");
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <Grid container spacing={2} justifyContent="space-between">
        <CardHeader
          subheader={
            <Typography variant="h6">Current Autopay Method</Typography>
          }
          title={<Typography variant="h5">AutoPay Settings</Typography>}
        />

        <CardHeader
          subheader={
            <Typography variant="h6">
              Name :{CustomerInfo?.customer_name}
            </Typography>
          }
          title={
            <Typography variant="h6">
              Account No :{CustomerInfo?.acctnum}
            </Typography>
          }
        />
      </Grid>

      <Divider />

      <Grid
        spacing={6}
        wrap="wrap"
        m={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
        justifyContent={"space-between"}
        mt={4}
        mb={4}
        // md={4}
      >
        <Grid
          // md={8}
          // sm={6}
          // xs={12}
          sx={{
            width: "60%",
            // backgroundColor: 'red',
          }}
        >
          <Typography variant="h6">
            Autopay must be enabled 24 hours prior to your invoice autopay
            collection date to ensure processing.
          </Typography>
          <FormGroup>
            <FormControlLabel
              sx={{
                width: 150,
              }}
              control={
                <Checkbox
                  defaultChecked
                  onChange={handleChange}
                  checked={isAutoPay}
                />
              }
              label="Auto Pay ON"
            />
          </FormGroup>
          {autoPayDetails?.length ||
          autoPayDetails?.id ||
          selectedCardDetails?.token ? (
            <Grid container alignItems="center">
              {/* Radio + Name */}
              <Grid xs={3}>
                <Stack direction="row" alignItems="center">
                  <Radio
                    checked={true}
                    // onChange={handleRadioChange}
                    value={"1"}
                    disabled
                  />
                  <Typography variant="subtitle2">
                    {selectedCardDetails?.card?.card_type ??
                      selectedCardDetails?.card?.account_type ??
                      autoPayDetails.card_type ??
                      autoPayDetails.account_type}
                  </Typography>
                </Stack>
              </Grid>

              {/* Card Number */}
              <Grid xs={3} ml={2}>
                <Typography sx={{ fontFamily: "monospace" }}>
                  {selectedCardDetails?.card?.card_number ??
                    selectedCardDetails?.card?.bank_account_number ??
                    decryptFunction(
                      autoPayDetails.card_number ??
                        autoPayDetails.bank_account_number
                    )}
                </Typography>
              </Grid>

              {/* Card Type */}
              <Grid xs={3} ml={2}>
                <Typography>
                  {selectedCardDetails?.card?.card_type ||
                  autoPayDetails?.card_type
                    ? "Card"
                    : "Bank Account"}
                </Typography>
              </Grid>

              {/* Date */}
              <Grid xs={3} ml={2}>
                <Typography>
                  {dayjs
                    .tz(
                      selectedCardDetails?.card?.date_used ??
                        autoPayDetails.createdAt,
                      "America/Chicago"
                    )
                    .tz(dayjs.tz.guess())
                    .format("YYYY-MM-DD hh:mm A z")}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            ""
          )}
        </Grid>

        <Grid
          sx={{
            marginTop: "auto",
            marginBottom: "auto",
          }}
          sm={6}
          xs={12}
        >
          <SelectPaymentMethod
            setSelectedCardDetails={(details, token) => {
              setSelectedCardDetails({
                card: details,
                token: token,
              });
            }}
            text={"Change Payment Method"}
          />
        </Grid>
      </Grid>

      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
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
          //   variant="contained"
          //   sx={{
          //     backgroundColor: colors.blue,
          //     '&:hover': {
          //       backgroundColor: colors['blue.3'], // or any other hover color
          //     },
          //   }}

          disabled={
            selectedCardDetails
              ? false
              : accountLoading ||
                (CustomerInfo?.autopay === 1 && isAutoPay) ||
                (CustomerInfo?.autopay !== 1 && !isAutoPay)
          }
          loading={accountLoading}
          onClick={handleSaveChanges}
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
        >
          Save changes
        </Button>
      </CardActions>
    </Card>
  );
}
