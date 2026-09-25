import * as React from "react";
import { contactCustomerService } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors, fileToBase64, formatUSPhone, US_STATES } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { toast } from "@/lib/custom-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";
import { Button } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";

import { useLoading } from "@/components/core/skeleton-context";
import { setRouteChecker } from "@/state/features/dashBoardSlice";
import {
  Gauge,
  MapPin,
  House,
  Phone,
  DeviceMobile,
  EnvelopeSimple,
} from "@phosphor-icons/react";

// Form Schema - all update fields are optional
const formSchema = z.object({
  accountName: z.string().optional(),
  primaryPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const digits = val.replace(/\D/g, "");
        return digits.length === 10;
      },
      { message: "Primary phone must be 10 digits" }
    ),
  altPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const digits = val.replace(/\D/g, "");
        return digits.length === 10;
      },
      { message: "Alternate phone must be 10 digits" }
    ),
  preferredOwnerMethod: z.string().optional(),
  billingAddress1: z.string().optional(),
  billingAddress2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  question: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  files: z
    .any()
    .refine(
      (files) => !files || files instanceof FileList || Array.isArray(files),
      "Invalid file list"
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerDetailsForm(): React.JSX.Element {
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [customerData, setCustomerData] = React.useState<any>(null);

  const { setContextLoading } = useLoading();
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: "",
      primaryPhone: "",
      altPhone: "",
      preferredOwnerMethod: "",
      billingAddress1: "",
      billingAddress2: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      question: "",
      preferredContactMethod: "",
      files: [],
    },
  });

  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const roleId = stored?.body?.acl_role_id;
  const customer_id = stored?.body?.customer_id;

  const onSubmit = async (data: FormValues) => {
    const hasAnyField =
      Boolean(data.accountName?.trim()) ||
      Boolean(data.primaryPhone?.trim()) ||
      Boolean(data.altPhone?.trim()) ||
      Boolean(data.preferredOwnerMethod?.trim()) ||
      Boolean(data.billingAddress1?.trim()) ||
      Boolean(data.billingAddress2?.trim()) ||
      Boolean(data.billingCity?.trim()) ||
      Boolean(data.billingState?.trim()) ||
      Boolean(data.billingZip?.trim()) ||
      Boolean(data.question?.trim()) ||
      Boolean(data.preferredContactMethod?.trim()) ||
      Boolean(data.files && (Array.isArray(data.files) ? data.files.length > 0 : (data.files as FileList).length > 0));

    if (!hasAnyField) {
      toast.error("Please complete at least one field to submit changes or ask a question.");
      return;
    }

    const files: File[] = data.files ? Array.from(data.files) : [];

    const base64Files = await Promise.all(
      files.map((file) => fileToBase64(file))
    );

    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "1");

    // Append update fields only when provided
    if (data.accountName && data.accountName.trim() !== "") {
      formData.append("accountName", data.accountName.trim());
      formData.append("account_name", data.accountName.trim());
    }

    if (data.primaryPhone && data.primaryPhone.trim() !== "") {
      formData.append("primaryPhone", data.primaryPhone.trim());
      formData.append("phone", data.primaryPhone.trim());
    }

    if (data.altPhone && data.altPhone.trim() !== "") {
      formData.append("altPhone", data.altPhone.trim());
      formData.append("phone2", data.altPhone.trim());
    }

    if (data.preferredOwnerMethod && data.preferredOwnerMethod.trim() !== "") {
      formData.append("amthe", data.preferredOwnerMethod.trim());
      formData.append("role", data.preferredOwnerMethod.trim().toLowerCase());
    }

    if (data.billingAddress1 && data.billingAddress1.trim() !== "") {
      formData.append("billingAddress1", data.billingAddress1.trim());
      formData.append("billing_address_1", data.billingAddress1.trim());
      formData.append("billing_address1", data.billingAddress1.trim());
    }

    if (data.billingAddress2 && data.billingAddress2.trim() !== "") {
      formData.append("billingAddress2", data.billingAddress2.trim());
      formData.append("billing_address_2", data.billingAddress2.trim());
      formData.append("billing_address2", data.billingAddress2.trim());
    }

    if (data.billingCity && data.billingCity.trim() !== "") {
      formData.append("billingCity", data.billingCity.trim());
      formData.append("billing_city", data.billingCity.trim());
    }

    if (data.billingState && data.billingState.trim() !== "") {
      // State abbreviation only
      formData.append("billingState", data.billingState.trim());
      formData.append("billing_state", data.billingState.trim());
    }

    if (data.billingZip && data.billingZip.trim() !== "") {
      formData.append("billingZip", data.billingZip.trim());
      formData.append("billing_zip", data.billingZip.trim());
      formData.append("billing_zip_code", data.billingZip.trim());
    }

    if (data.question && data.question.trim() !== "") {
      formData.append("question", data.question.trim());
      formData.append("comment", data.question.trim());
    }

    if (data.preferredContactMethod && data.preferredContactMethod.trim() !== "") {
      formData.append("preferMethod", data.preferredContactMethod.trim());
    }

    base64Files.forEach((base64) => {
      formData.append("attachment_file", base64);
    });

    dispatch(contactCustomerService(formData, handleReset));
  };

  const handleReset = () => {
    reset({
      accountName: "",
      primaryPhone: "",
      altPhone: "",
      preferredOwnerMethod: "",
      billingAddress1: "",
      billingAddress2: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      question: "",
      preferredContactMethod: "",
      files: [],
    });
    setHasUnsavedChanges(false);
  };

  React.useEffect(() => {
    if (hasUnsavedChanges) {
      dispatch(setRouteChecker(true));
    }
    return () => {
      dispatch(setRouteChecker(false));
    };
  }, [hasUnsavedChanges]);

  React.useEffect(() => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "0");

    dispatch(
      contactCustomerService(
        formData,
        successCallBack,
        false,
        setContextLoading
      )
    );
  }, [customer_id]);

  const successCallBack = (res: any) => {
    const customer = res?.customer_data?.[0];
    setCustomerData(customer || null);
    setHasUnsavedChanges(false);
  };

  const rawFiles = watch("files");
  const files: File[] = Array.isArray(rawFiles)
    ? rawFiles
    : Array.from(rawFiles || []);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setValue("files", [...files, ...selectedFiles], { shouldValidate: true });
    setHasUnsavedChanges(true);

    e.target.value = ""; // reset input for duplicate file names
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setValue("files", updatedFiles, { shouldValidate: true });
    setHasUnsavedChanges(true);
  };

  React.useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const leftColFields = [
    {
      label: "Service Address",
      value: customerData?.service_address || "-",
      icon: MapPin,
    },
    {
      label: "Meter #",
      value: customerData?.meterNumber || "-",
      icon: Gauge,
    },
    {
      label: "Primary Phone",
      value: formatUSPhone(customerData?.phone) || "-",
      icon: Phone,
    },
  ];

  const rightColFields = [
    {
      label: "Email",
      value: customerData?.email || "-",
      icon: EnvelopeSimple,
    },
    {
      label: "Billing Address",
      value: customerData?.address || "-",
      icon: House,
    },
    {
      label: "Secondary Phone",
      value: formatUSPhone(customerData?.phone2) || "-",
      icon: DeviceMobile,
    },
  ];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ borderRadius: 0, boxShadow: "none" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Read-Only Compact Information Section */}
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Stack spacing={1}>
                  {leftColFields.map(({ label, value, icon: Icon }) => (
                    <Card
                      key={label}
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      }}
                    >
                      <CardContent
                        sx={{
                          py: 0.75,
                          px: 0,
                          "&:last-child": { pb: 0.75 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 0,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: "#EEF4FF",
                              color: "#2563EB",
                            }}
                          >
                            <Icon size={20} />
                          </Avatar>

                          <Box flex={1}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1.2, display: "block" }}
                            >
                              {label}
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Stack spacing={1}>
                  {rightColFields.map(({ label, value, icon: Icon }) => (
                    <Card
                      key={label}
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      }}
                    >
                      <CardContent
                        sx={{
                          py: 0.75,
                          px: 0,
                          "&:last-child": { pb: 0.75 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 0,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: "#EEF4FF",
                              color: "#2563EB",
                            }}
                          >
                            <Icon size={20} />
                          </Avatar>

                          <Box flex={1}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1.2, display: "block" }}
                            >
                              {label}
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>

            {/* Form Title & Instructions */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="text.primary"
                sx={{ mb: 0.5 }}
              >
                Request changes to your information with the utility provider.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: colors.blue,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                <strong>Only complete the fields you want to update</strong>. You may also use the message box to ask a question or leave a comment.
                <br />
                Changes will be sent to your utility provider for review and will appear after your next bill is posted.
              </Typography>
            </Box>

            {/* Form Fields Grid */}
            <Grid container spacing={2}>
              {/* Row 1: Account Name & Primary Phone */}
              <Grid xs={12} md={6}>
                <Controller
                  name="accountName"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.accountName}>
                      <InputLabel>Account Name</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Account Name"
                      />
                      {errors.accountName && (
                        <FormHelperText>{errors.accountName.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <Controller
                  name="primaryPhone"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.primaryPhone}>
                      <InputLabel>Primary Phone</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Primary Phone"
                        type="tel"
                        value={formatUSPhone(field.value || "")}
                        onChange={(e) => field.onChange(formatUSPhone(e.target.value))}
                        inputProps={{ maxLength: 14 }}
                      />
                      {errors.primaryPhone && (
                        <FormHelperText>{errors.primaryPhone.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Row 2: Alternate Phone & I am the */}
              <Grid xs={12} md={6}>
                <Controller
                  name="altPhone"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.altPhone}>
                      <InputLabel>Alternate Phone</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Alternate Phone"
                        type="tel"
                        value={formatUSPhone(field.value || "")}
                        onChange={(e) => field.onChange(formatUSPhone(e.target.value))}
                        inputProps={{ maxLength: 14 }}
                      />
                      {errors.altPhone && (
                        <FormHelperText>{errors.altPhone.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    height: "100%",
                    minHeight: 40,
                    flexWrap: "wrap",
                    pl: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={500} whiteSpace="nowrap">
                    I am the
                  </Typography>
                  <Controller
                    name="preferredOwnerMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        row
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        <FormControlLabel
                          value="Owner"
                          control={<Radio size="small" />}
                          label="Owner"
                        />
                        <FormControlLabel
                          value="Tenant"
                          control={<Radio size="small" />}
                          label="Tenant"
                        />
                      </RadioGroup>
                    )}
                  />
                </Box>
              </Grid>

              {/* Row 3: Billing Address Line 1 */}
              <Grid xs={12}>
                <Controller
                  name="billingAddress1"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.billingAddress1}>
                      <InputLabel>Billing Address Line 1</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Billing Address Line 1"
                      />
                      {errors.billingAddress1 && (
                        <FormHelperText>{errors.billingAddress1.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Row 4: Billing Address Line 2 */}
              <Grid xs={12}>
                <Controller
                  name="billingAddress2"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.billingAddress2}>
                      <InputLabel>Billing Address Line 2</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Billing Address Line 2"
                      />
                      {errors.billingAddress2 && (
                        <FormHelperText>{errors.billingAddress2.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Row 5: Billing City, Billing State, Billing ZIP Code */}
              <Grid xs={12} sm={4}>
                <Controller
                  name="billingCity"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.billingCity}>
                      <InputLabel>Billing City</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Billing City"
                      />
                      {errors.billingCity && (
                        <FormHelperText>{errors.billingCity.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <Controller
                  name="billingState"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.billingState}>
                      <InputLabel>Billing State</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ""}
                        label="Billing State"
                        renderValue={(selected) => selected || ""}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {US_STATES.map((state) => (
                          <MenuItem key={state.code} value={state.code}>
                            {`${state.code} – ${state.name}`}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.billingState && (
                        <FormHelperText>{errors.billingState.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <Controller
                  name="billingZip"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.billingZip}>
                      <InputLabel>Billing Zip Code</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Billing Zip Code"
                        inputProps={{ maxLength: 10 }}
                      />
                      {errors.billingZip && (
                        <FormHelperText>{errors.billingZip.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Row 6: Comment or Question (optional) */}
              <Grid xs={12}>
                <Controller
                  name="question"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.question}>
                      <InputLabel>Comment or Question (optional)</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Comment or Question (optional)"
                        multiline
                        minRows={3}
                      />
                      {errors.question && (
                        <FormHelperText>{errors.question.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Row 7: Preferred Contact Method (optional) */}
              <Grid xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    pl: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={500} whiteSpace="nowrap">
                    Preferred Contact Method (optional)
                  </Typography>
                  <Controller
                    name="preferredContactMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        row
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        <FormControlLabel
                          value="Email"
                          control={<Radio size="small" />}
                          label="Email"
                        />
                        <FormControlLabel
                          value="Telephone"
                          control={<Radio size="small" />}
                          label="Telephone"
                        />
                      </RadioGroup>
                    )}
                  />
                </Box>
              </Grid>

              {/* Row 8: Upload Supporting Documents (optional) */}
              <Grid xs={12}>
                <FormControl fullWidth error={!!errors.files}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Upload Supporting Documents (optional)
                  </Typography>
                  <OutlinedInput
                    type="file"
                    size="small"
                    inputProps={{ multiple: true }}
                    onChange={handleFilesChange}
                  />
                  {!!errors.files && (
                    <FormHelperText>
                      {errors.files.message as string}
                    </FormHelperText>
                  )}
                </FormControl>

                {/* File Preview List */}
                {files.length > 0 && (
                  <Grid container spacing={1} mt={1}>
                    {files.map((file, index) => (
                      <Grid key={`${file.name}-${file.lastModified}-${index}`}>
                        <Chip
                          label={file.name}
                          onDelete={() => handleFileRemove(index)}
                          deleteIcon={<XSquare />}
                          variant="outlined"
                          color="primary"
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </CardContent>

          <Divider />

          <CardActions sx={{ justifyContent: "flex-end", px: 3, py: 2, gap: 1.5 }}>
            <Button
              variant="outlined"
              disabled={accountLoading}
              textTransform="none"
              onClick={() => {
                handleReset();
                setHasUnsavedChanges(false);
              }}
              style={{
                color: colors.blue,
                borderColor: colors.blue,
                backgroundColor: "white",
                borderRadius: "12px",
                height: "41px",
                minWidth: "100px",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={accountLoading}
              loading={accountLoading}
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{ borderRadius: "12px", height: "41px", minWidth: "100px" }}
            >
              Submit
            </Button>
          </CardActions>
        </Card>
      </form>
    </>
  );
}
