import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkAnotherAccount } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import { Question } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { config } from "@/config";
import { paths } from "@/utils/paths";
import Button from "@/components/CommonComponents/Button";

export default function AddAccountPage() {
  const navigate = useNavigate();

  const page1Schema = z.object({
    // accountNumber: z.string().min(2, 'Account number must be at least 2 characters'),
    accountNumber: z
      .string()
      .min(2, "Account number must be at least 2 characters")
      .refine((val) => /^\d*\.?\d*$/.test(val), {
        message: "Only numbers or decimals are allowed",
      }),
    authenticationType: z.string().min(2, "Select an authentication type"),
    answer: z.string().min(2, "Answer must be at least 2 characters"),
  });

  const page2Schema = z
    .object({
      notificationEmail: z.string().min(2).email("Enter a valid email address"),
      confirmEmail: z.string().min(2).email("Enter a valid email address"),
    })
    .refine((data) => data.notificationEmail === data.confirmEmail, {
      message: "Emails don't match",
      path: ["confirmEmail"],
    });
  const {
    control: controlPage1,
    handleSubmit: handleSubmitPage1,
    formState: { errors: errorsPage1 },
    getValues: getValues1,
  } = useForm({
    resolver: zodResolver(page1Schema),
  });

  const {
    control: controlPage2,
    handleSubmit: handleSubmitPage2,
    formState: { errors: errorsPage2 },
    getValues: getValues2,
  } = useForm({
    resolver: zodResolver(page2Schema),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any>({});
  console.log(errorsPage2, errorsPage1, loading, "errorsPage2");

  const handleStepOne = (step) => {
    console.log("Step:", step);
    setLoading(true);
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

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    // formData.append('customer_id', userId);
    formData.append("company_id", "2");

    if (step == 1) {
      formData.append("step", "1");
      formData.append("account_no", getValues1("accountNumber"));
      formData.append("authentication", getValues1("authenticationType"));
      formData.append("authentication_field", getValues1("answer"));

      dispatch(
        linkAnotherAccount(
          token,
          formData,
          (res) => {
            setAccountDetails({
              ...accountDetails,
              ...res,
            });
            setCurrentPage(2);
          },
          setLoading
        )
      );

      //       step:1
      // account_no:0618
      // authentication:last_name
      // authentication_field:HOWARD
      // acl_role_id:4
      // company_id:2
    } else {
      // (data) => alert('Form submitted: ' + JSON.stringify(data));

      formData.append("account_number", getValues1("accountNumber"));
      formData.append("authentication", getValues1("authenticationType"));
      formData.append("authentication_field", getValues1("answer"));
      formData.append("email", getValues2("notificationEmail"));
      formData.append("confirm_email", getValues2("confirmEmail"));
      formData.append("is_autopay", "0");
      formData.append("is_payment_schedule", "0");
      formData.append("page", "1");
      formData.append("company_login", "cape-royale1");
      formData.append("customer_id", accountDetails?.customer_id);
      formData.append("acctnum", getValues1("accountNumber"));

      dispatch(
        linkAnotherAccount(
          token,
          formData,

          navigate(paths.dashboard.overview()),

          setLoading
        )
      );
    }

    //     account_number:0618
    // authentication:last_name
    // authentication_field:HOWARD
    // email:howard@gmail.com
    // confirm_email:howard@gmail.com
    // is_autopay:0
    // acctnum:0618
    // is_payment_schedule:0
    // acl_role_id:4
    // customer_id:589
    // page:1
    // company_login:cape-royale1
  };

  const handleBack = () => {
    setCurrentPage((prev) => prev - 1);
  };

  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <Grid container spacing={2} justifyContent="space-between">
        <CardHeader
          title={
            <Typography ml={1} variant="h5">
              Link Accounts
            </Typography>
          }
        />

        <CardHeader
          subheader={
            <Typography variant="h6">
              Name :{CustomerInfo?.customer_name}
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
      <Box
        sx={{
          maxWidth: 500,
          mx: "auto",
          mt: 6,
          mb: 6,
          px: 3,
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {currentPage === 1 && (
          <>
            <Typography variant="h5" fontWeight="bold" color="textSecondary">
              ADD ANOTHER ACCOUNT
            </Typography>

            {/* <TextField
              label="Account Number *"
              variant="outlined"
              fullWidth
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Authentication *</InputLabel>
              <Select
                value={authenticationType}
                label="Authentication *"
                onChange={(e) => setAuthenticationType(e.target.value)}
              >
                <MenuItem value="Last Name">Last Name</MenuItem>
                <MenuItem value="Billing Street Name">Billing Street Name</MenuItem>
                <MenuItem value="PIN">PIN</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Answer *"
              variant="outlined"
              fullWidth
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            /> */}

            <Controller
              name="accountNumber"
              control={controlPage1}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Account Number *"
                  variant="outlined"
                  fullWidth
                  error={!!errorsPage1.accountNumber}
                  helperText={
                    typeof errorsPage1.accountNumber?.message === "string"
                      ? errorsPage1.accountNumber.message
                      : ""
                  }
                  inputProps={{
                    inputMode: "decimal", // show numeric keypad on mobile
                    pattern: "[0-9]*[.]?[0-9]*", // restrict input pattern
                  }}
                />
              )}
            />

            <Controller
              name="authenticationType"
              control={controlPage1}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth error={!!errorsPage1.authenticationType}>
                  <InputLabel>Authentication *</InputLabel>
                  <Select {...field} label="Authentication *">
                    <MenuItem value="last_name">Last Name</MenuItem>
                    <MenuItem value="billing_street_name">
                      Billing Street Name
                    </MenuItem>
                    <MenuItem value="pin">PIN</MenuItem>
                  </Select>
                  <Typography variant="caption" color="error">
                    {typeof errorsPage1.authenticationType?.message == "string"
                      ? errorsPage1.authenticationType?.message
                      : ""}
                  </Typography>
                </FormControl>
              )}
            />

            <Controller
              name="answer"
              control={controlPage1}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Answer *"
                  variant="outlined"
                  fullWidth
                  error={!!errorsPage1.answer}
                  helperText={
                    typeof errorsPage1.answer?.message == "string"
                      ? errorsPage1.answer?.message
                      : ""
                  }
                />
              )}
            />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                }}
              >
                BACK
              </Button>
              <Button
                disabled={loading}
                loading={loading}
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
                // onClick={handleNext}
                onClick={handleSubmitPage1(() => handleStepOne(1))}
              >
                NEXT
              </Button>
            </Box>
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ mt: 4 }}
            >
              <strong>This is a fee-based service.</strong> A convenience fee
              will be applied to all credit card and electronic check
              transactions.
            </Typography>
          </>
        )}

        {currentPage === 2 && (
          <>
            <Typography variant="h5" fontWeight="bold" color="textSecondary">
              NOTIFICATION EMAIL
            </Typography>

            {/* <TextField
              label="Notification Email *"
              variant="outlined"
              fullWidth
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter the email where you'd like to receive notifications.">
                    <IconButton edge="end">

                      <Question size={20} color="#90caf9" weight="fill" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />

            <TextField
              label="Confirm Notification Email *"
              variant="outlined"
              fullWidth
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            /> */}

            <Controller
              name="notificationEmail"
              control={controlPage2}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notification Email *"
                  variant="outlined"
                  fullWidth
                  error={!!errorsPage2.notificationEmail}
                  helperText={
                    typeof errorsPage2.notificationEmail?.message === "string"
                      ? errorsPage2.notificationEmail?.message
                      : ""
                  }
                />
              )}
            />

            <Controller
              name="confirmEmail"
              control={controlPage2}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Notification Email *"
                  variant="outlined"
                  fullWidth
                  error={!!errorsPage2.confirmEmail}
                  helperText={
                    typeof errorsPage2.confirmEmail?.message == "string"
                      ? errorsPage2.confirmEmail?.message
                      : ""
                  }
                />
              )}
            />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                // variant="outlined"
                // sx={{
                //   color: colors.blue,
                //   borderColor: colors.blue,
                // }}
                // onClick={handleBack}

                onClick={handleBack}
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                }}
              >
                BACK
              </Button>
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
                  height: "41px",
                  // backgroundColor: 'red',
                }}
                // onClick={() => alert('Submit or move next!')}
                // onClick={() => handleSubmitPage2(() => handleStepOne(2))}
                onClick={handleSubmitPage1(() => handleStepOne(2))}
              >
                NEXT
              </Button>
            </Box>
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ mt: 4 }}
            >
              <strong>This is a fee-based service.</strong> A convenience fee
              will be applied to all credit card and electronic check
              transactions.
            </Typography>
          </>
        )}

        {/* Indicators */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: currentPage === 1 ? "#9e9e9e" : "#e0e0e0",
              mx: 0.5,
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: currentPage === 2 ? "#9e9e9e" : "#e0e0e0",
              mx: 0.5,
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}
