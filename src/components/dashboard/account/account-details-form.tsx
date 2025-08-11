import * as React from "react";
import {
  getAccountInfo,
  updateAccountCustomerInfo,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CardActions,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Grid from "@mui/material/Unstable_Grid2";
// import {
//   Button,
//   Card,
//   CardActions,
//   CardContent,
//   CardHeader,
//   Divider,
//   FormControl,
//   FormControlLabel,
//   Grid,
//   InputLabel,
//   OutlinedInput,
//   Radio,
//   RadioGroup,
//   Typography,
// } from '@mui/material';
import { Stack } from "@mui/system";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const schema = z.object({
  account_name: z.string().min(1, "Account name is required"),
  account_number: z.string().min(1, "Account number is required"),
  meter_number: z.string().min(1, "Meter number is required"),
  service_address: z.string().min(1, "Service address is required"),
  billing_address: z.string().min(1, "Billing address is required"),
  primary_phone: z.string().min(10, "Phone must be at least 10 digits"),
  alt_phone: z.string().optional(),
  email: z.string().email(),
  role: z.enum(["owner", "tenant"]),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

type FormSchema = z.infer<typeof schema>;

export function AccountDetailsForm(): React.JSX.Element {
  const dispatch = useDispatch();
  const { accountInfo, accountLoading, userInfo } = useSelector(
    (state: RootState) => state?.Account
  );
  const customer = accountInfo?.customer_data?.[0] || {};
  const meter = accountInfo?.body?.meterDetails?.[0] || {};

  const [isEditEnable, setIsEditEnable] = React.useState(false);
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      account_name: customer.customer_name || "",
      account_number: customer.acctnum || "",
      meter_number: customer.meterNumber || "",
      service_address: customer.service_address || "",
      billing_address: customer.address || "",
      primary_phone: customer.phone || "",
      alt_phone: customer.phone2 || "",
      email: customer.email || "",
      role: customer.role || "owner",
      comment: customer.comment || "",
    },
  });

  React.useEffect(() => {
    if (customer) {
      reset({
        account_name: customer.customer_name || "",
        account_number: customer.acctnum || "",
        meter_number: customer.meterNumber || "",
        service_address: customer.service_address || "",
        billing_address: customer.address || "",
        primary_phone: customer.phone || "",
        alt_phone: customer.phone2 || "",
        email: customer.email || "",
        role: customer.role || "owner",
        comment: customer.comment || "",
      });
    }
  }, [accountInfo]);

  const getUserDetails = () => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;
    dispatch(getAccountInfo(roleId, userId, token));
  };

  const onSubmit = (data: FormSchema) => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;

    const userData = new FormData();
    userData.append("acl_role_id", roleId);
    userData.append("customer_id", userId);
    userData.append("is_form", "1");
    userData.append("comment", data.comment || "");
    userData.append("accountName", data.account_name);
    userData.append("primaryPhone", data.primary_phone);
    userData.append("altPhone", data.alt_phone || "");
    userData.append("amthe", data.role);

    dispatch(updateAccountCustomerInfo(token, userData, successCallback));
  };

  const successCallback = () => {
    setIsEditEnable(false);
    getUserDetails();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ borderRadius: boarderRadius.card }}>
          <CardHeader
            title="Current Information"
            action={
              <Button
                startIcon={<EditIcon fontSize="var(--icon-fontSize-md)" />}
                variant="outlined"
                onClick={() => setIsEditEnable(true)}
                sx={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  "&:hover": {
                    borderColor: colors["blue.3"],
                  },
                }}
              >
                Edit
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {[
                { label: "Account name", name: "account_name" },
                { label: "Account #", name: "account_number" },
                { label: "Meter #", name: "meter_number" },
                { label: "Service Address", name: "service_address" },
                { label: "Billing Address", name: "billing_address" },
                { label: "Primary Phone", name: "primary_phone" },
                { label: "Alt Phone", name: "alt_phone" },
                { label: "Email", name: "email", disabled: true },
              ].map(({ label, name, disabled = false }) => (
                <Grid key={name} md={6} xs={12}>
                  <Controller
                    name={name as keyof FormSchema}
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!errors[name as keyof FormSchema]}
                      >
                        <InputLabel>{label}</InputLabel>
                        <OutlinedInput
                          {...field}
                          disabled={disabled || !isEditEnable}
                          label={label}
                          type={name.includes("phone") ? "tel" : "text"}
                        />
                        {errors[name as keyof FormSchema] ? (
                          <FormHelperText>
                            {errors[name as keyof FormSchema].message}
                          </FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} mt={1}>
              <Grid xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="h6">I am the *</Typography>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          disabled={!isEditEnable}
                          value="owner"
                          control={<Radio />}
                          label="Owner"
                        />
                        <FormControlLabel
                          disabled={!isEditEnable}
                          value="tenant"
                          control={<Radio />}
                          label="Tenant"
                        />
                      </RadioGroup>
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Grid md={12} xs={12} p={0} pt={3}>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.comment}>
                    <InputLabel>Comment</InputLabel>
                    <OutlinedInput
                      {...field}
                      disabled={!isEditEnable}
                      label="Comment"
                      multiline
                    />
                    {errors.comment ? (
                      <FormHelperText>{errors.comment.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              type="button"
              disabled={!isEditEnable}
              onClick={() => {
                reset();
                setIsEditEnable(false);
              }}
              sx={{ color: colors.blue, borderColor: colors.blue }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              disabled={!isEditEnable}
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: colors.blue,
                "&:hover": {
                  backgroundColor: colors["blue.3"],
                },
              }}
            >
              Send
            </Button>
          </CardActions>
        </Card>
      </form>
      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </>
  );
}
