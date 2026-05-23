import * as React from "react";

import { updatePaperLessInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors, CustomerInfo, decryptFunction } from "@/utils";
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
import dayjs, { Dayjs } from "dayjs";
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
  const userInfo: CustomerInfo = getLocalStorage("intuity-customerInfo") as CustomerInfo;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
//   interface CustomerInfo {
//   acctnum: React.ReactNode;
//   customer_name: React.ReactNode;
//   autopay: number;
//   id?: number;
//   company_logo?: string;
//   paperless?: 0 | 1;
//   allow_overpayments?: number;
//   balance?: number;
// }
  const CustomerInfo: CustomerInfo | null = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  const [isAutoPay, setisAutoPay] = React.useState(false);
  const dispatch = useDispatch();
  const [autoPayDetails, setAutoPayDetails] = React.useState(null);
  const [autoPaySettings, setAutoPaySettings] = React.useState(null);
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  interface CardInfo {
    card_type?: string;
    account_type?: string;
    card_number?: string;
    bank_account_number?: string;
    date_used?: string | number | Date | Dayjs;
    [key: string]: unknown;
  }

  interface CardDetails {
    card?: CardInfo;
    token?: string;
    date_used?: string | number | Date | Dayjs;
    account_type?: string;
    card_number?: string;          
    bank_account_number?: string;  
    card_type?: string;
    card_token?: string;
    id?: string;
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
    [key: string]: unknown;
  }
  const [selectedCardDetails, setSelectedCardDetails] =
    React.useState<CardDetails>(null);

  //console.log(autoPayDetails, selectedCardDetails, "autoPayDetails");

  React.useEffect(() => {
    setisAutoPay(CustomerInfo?.autopay === 1 ? true : false);

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    dispatch(
      updatePaperLessInfo(
        token,
        formData,
        "autopay",
        setAutoPayDetails,
        true,
        setAutoPaySettings
      )
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

      formData.append("payment_method_id_model", selectedCardDetails?.token as string);

      formData.append("is_form", "1");
      formData.append("auto_pay", isAutoPay ? "1" : "0");

      formData.append("id_select_card", autoPaySettings?.id ?? "");
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
  //console.log(selectedCardDetails, "selectedCardDetails");
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
            <Grid
              container
              alignItems="center"
              spacing={2}
              sx={{
                flexWrap: "wrap",
              }}
            >
              {/* Saved Details */}
              <Grid xs={12} sm={6} md={3}>
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={1}
                  sx={{ wordBreak: "break-word" }}
                >
                  <Typography variant="h6" mr={1}>
                    Saved Details:
                  </Typography>

                  <Typography variant="subtitle2">
                    {selectedCardDetails?.card?.card_type ??
                      selectedCardDetails?.card?.account_type ??
                      autoPayDetails.card_type ??
                      autoPayDetails.account_type}
                  </Typography>
                </Stack>
              </Grid>

              {/* Card Number */}
              <Grid xs={12} sm={6} md={3}>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {selectedCardDetails?.card?.card_number ??
                    decryptFunction(
                      selectedCardDetails?.card?.bank_account_number ??
                        autoPayDetails.card_number ??
                        autoPayDetails.bank_account_number
                    )}
                </Typography>
              </Grid>

              {/* Card Type */}
              <Grid xs={12} sm={6} md={3}>
                <Typography>
                  {selectedCardDetails?.card?.card_type ||
                  autoPayDetails?.card_type
                    ? "Card"
                    : "Bank Account"}
                </Typography>
              </Grid>

              {/* Date */}
              <Grid xs={12} sm={6} md={3}>
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
