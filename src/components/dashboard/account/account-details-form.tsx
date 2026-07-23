import * as React from "react";
import {
  getAccountInfo,
  updateAccountCustomerInfo,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
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
import Grid from "@mui/material/Grid";
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
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";
import { setRouteChecker } from "@/state/features/dashBoardSlice";

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

  const [isEditEnable, setIsEditEnable] = React.useState(false);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const {
    control,
    handleSubmit,
    reset,

    formState: { errors, isDirty },
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

  const initialState = {
    account_name: "",
    account_number: "",
    meter_number: "",
    service_address: "",
    email: "",
    billing_address: "",
    primary_phone: "",
    alt_phone: "",
    role: "",
    comment: "",
  };

  const [newInfo, setNewInfo] = React.useState(initialState);

  const handleCancel = () => {
    setNewInfo(initialState);
  };

  //   React.useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     if (isEditEnable && isDirty) {
  //       e.preventDefault();
  //       e.returnValue = ""; // Required for Chrome
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [isDirty, isEditEnable]);
  React.useEffect(() => {

    if (isDirty && isEditEnable) {
      dispatch(setRouteChecker(true));

    }
    return () => {
      dispatch(setRouteChecker(false));
    }
  }, [isDirty, isEditEnable]);
  React.useEffect(() => {

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && isEditEnable) {
        // Show confirmation dialog
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message; // Some browsers require this for custom messages
        return message; // For some older browsers
      }
      // Clean up builder data only if there are no unsaved changes
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isEditEnable]);

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
    dispatch(getAccountInfo(roleId, userId));
  };

  const onSubmit = (data: FormSchema) => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;

    const userData = new FormData();
    userData.append("acl_role_id", roleId);
    userData.append("customer_id", userId);
    userData.append("is_form", "1");
    userData.append("comment", data.comment || "");
    userData.append("accountName", data.account_name);
    userData.append("primaryPhone", data.primary_phone);
    userData.append("altPhone", data.alt_phone || "");
    userData.append("amthe", data.role);

    dispatch(updateAccountCustomerInfo(userData, successCallback));
  };

  const successCallback = () => {
    getUserDetails();
    setNewInfo(initialState);
  };

  const handleNewInfoSubmit = () => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;

    const userData = new FormData();

    userData.append("acl_role_id", roleId);
    userData.append("customer_id", userId);
    userData.append("is_form", "1");
    userData.append("comment", newInfo.comment);
    userData.append("accountName", newInfo.account_name);
    userData.append("primaryPhone", newInfo.primary_phone);
    userData.append("altPhone", newInfo.alt_phone);
    userData.append("amthe", newInfo.role);

    dispatch(updateAccountCustomerInfo(userData, successCallback));
  };


 const InfoBox = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <Box
    sx={{
      border: "1px solid #E5E7EB",
      borderRadius: 1,
      px: 2,
      py: 1,
      minHeight: 48, // instead of height: 100%
      backgroundColor: "#fff",
    }}
  >
    <Typography
      fontSize={15}
      fontWeight={600}
      sx={{ lineHeight: 1, mb:0.25 }}
    >
      {label}
    </Typography>

    <Typography
      fontSize={14}
      color="text.secondary"
      sx={{ display: "block", }}
    >
      {value || "-"}
    </Typography>
  </Box>
);

const fields = [
  {
    label: "Meter #",
    value: accountInfo?.customer_data?.[0]?.meterNumber,
  },
  {
    label: "Service Address",
    value: accountInfo?.customer_data?.[0]?.service_address,
  },

  {
    label: "Primary Phone",
    value: accountInfo?.customer_data?.[0]?.phone,
  },
  {
    label: "Alt Phone",
    value: accountInfo?.customer_data?.[0]?.phone2,
  },
    {
    label: "Email",
    value: accountInfo?.customer_data?.[0]?.email,
  },
];



  return (
    <>
      {/* <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ borderRadius: 1 }}>
         
          <CardContent>
            <Grid container spacing={3}>
              {[
                { label: "Meter # *", name: "meter_number" },
                { label: "Service Address *", name: "service_address" },
                { label: "Email *", name: "email", disabled: true },
                { label: "Primary Phone *", name: "primary_phone", phone: true },
                { label: "Alt Phone ", name: "alt_phone", phone: true },
              ].map(({ label, name, phone, disabled = false }) => (
                <Grid key={name} md={6} xs={12}>
                  <Controller
                    name={name as keyof FormSchema}
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!errors[name as keyof FormSchema]}
                      >
                        <InputLabel>{label}</InputLabel>
                        <OutlinedInput
                          {...field}
                          disabled={disabled || !isEditEnable}
                          label={label}
                          type={phone ? "tel" : "text"}
                          inputProps={
                            phone
                              ? { inputMode: "decimal" } 
                              : undefined
                          }
                          onChange={(e) => {
                            let value = e.target.value;

                            if (!phone) {
                              field.onChange(value);
                              return;
                            }

                            // ✅ Allow ONLY digits and hyphen
                            value = value.replace(/[^0-9-]/g, "");

                            field.onChange(value);

                          }}
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

           
          </CardContent>
        
        </Card>
</form> */}

      {/* <Card sx={{ borderRadius: 1 }}>
        <CardContent>
         
          <Grid container spacing={2}>
  {fields.map(({ label, value }) => (
    <Grid item xs={12} md={6} key={label}>
      <Box>
        <Typography
          fontSize={15}
          fontWeight={600}
          mb={0.5}
        >
          {label}
        </Typography>

        <Typography
          fontSize={14}
          color="text.secondary"
          mb={1}
        >
          {value || "-"}
        </Typography>

        <Divider />
      </Box>
    </Grid>
  ))}
</Grid>
        </CardContent>
      </Card> */}


      <form>
        <Card sx={{ borderRadius: 1,  }}>
          <CardHeader
            title="New Information"
            sx={{pt:2,pb:2}}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {[
                { label: "Account name *", name: "account_name" },
                // { label: "Account # *", name: "account_number" },
                // { label: "Meter # *", name: "meter_number" },
                // { label: "Service Address *", name: "service_address" },
                // { label: "Email *", name: "email", disabled: true },
                // { label: "Billing Address *", name: "billing_address" },
                { label: "Primary Phone *", name: "primary_phone", phone: true },
                { label: "Alt Phone ", name: "alt_phone", phone: true },
              ].map(({ label, name, phone }) => (
                <>
                <Grid item xs={12} md={6} key={name}>
                  {/* <Controller
                    name={name as keyof FormSchema}
                    control={control}
                    render={({ field }) => ( */}
                  <FormControl
                    fullWidth
                    size="small"
                  // error={!!errors[name as keyof FormSchema]}
                  >
                    <InputLabel>{label}</InputLabel>
                    <OutlinedInput
                      value={newInfo[name]}
                      onChange={(e) =>
                        setNewInfo((prev) => ({
                          ...prev,
                          [name]: e.target.value,
                        }))
                      }
                      label={label}
                      type={phone ? "tel" : "text"}
                      inputProps={
                        phone
                          ? { inputMode: "decimal" } // mobile numeric keyboard
                          : undefined
                      }
                    // onChange={(e) => {
                    //   let value = e.target.value;

                    //   // 🔹 Normal input for non-phone fields
                    //   if (!phone) {
                    //     field.onChange(value);
                    //     return;
                    //   }

                    //   // ✅ Allow ONLY digits and hyphen
                    //   value = value.replace(/[^0-9-]/g, "");

                    //   field.onChange(value);

                    // }}
                    />
                    {errors[name as keyof FormSchema] ? (
                      <FormHelperText>
                        {errors[name as keyof FormSchema].message}
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                  {/* )}
                  /> */}
                </Grid>
                
</>
                
              ))}
              <Grid item xs={12} md={6}>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      height: "100%",
      gap: 2,
      paddingLeft:1.4,
      flexWrap: "wrap",
    }}
  >
    <Typography>
      I am the *
    </Typography>

    <RadioGroup
      row
      value={newInfo.role}
      onChange={(e) =>
        setNewInfo((prev) => ({
          ...prev,
          role: e.target.value,
        }))
      }
    >
      <FormControlLabel
        value="owner"
        control={<Radio />}
        label="Owner"
      />
      <FormControlLabel
        value="tenant"
        control={<Radio />}
        label="Tenant"
      />
    </RadioGroup>
  </Box>
</Grid>
            </Grid>

            {/* <Grid container
              spacing={2}
              sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Box
  sx={{
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  }}
>
  <Typography variant="body1" fontWeight={600}>
    I am the *
  </Typography>

  <RadioGroup
    row
    value={newInfo.role}
    onChange={(e) =>
      setNewInfo((prev) => ({
        ...prev,
        role: e.target.value,
      }))
    }
    sx={{ m: 0 }}
  >
    <FormControlLabel
      value="owner"
      control={<Radio />}
      label="Owner"
    />

    <FormControlLabel
      value="tenant"
      control={<Radio />}
      label="Tenant"
    />
  </RadioGroup>
</Box>
              </Grid>
            </Grid> */}

            <Grid item xs={12} sx={{ pt: 3 }}>
              <FormControl fullWidth size="small" error={!!errors.comment}>
                <InputLabel>Comment *</InputLabel>
                <OutlinedInput
                  disabled={false}
                  label="Comment *"
                  multiline
                  minRows={3}
                  value={newInfo.comment}
                  onChange={(e) =>
                    setNewInfo((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                />
                {errors.comment ? (
                  <FormHelperText>{errors.comment.message}</FormHelperText>
                ) : null}
              </FormControl>
             
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: "flex-end", border: "none", px:3.2, py:2 }}>
            <Button
              type="button"
              onClick={() => {
                setNewInfo(initialState);
              }}
              sx={{ color: colors.blue, borderColor: colors.blue }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              disabled={false}
              variant="contained"
              onClick={handleNewInfoSubmit}
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
