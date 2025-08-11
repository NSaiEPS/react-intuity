import * as React from "react";
import { useNavigate } from "react-router-dom";
import { contactCustomerService } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";
import { Button } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { z } from "zod";

import { paths } from "@/utils/paths";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { useLoading } from "@/components/core/skeletion-context";

// Schema
const formSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account # is required"),
  masterNumber: z.string().optional(),
  serviceAddress: z.string().min(1, "Service Address is required"),
  billingAddress: z.string().min(1, "Billing Address is required"),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  // email: z.string().email('Invalid email address'),
  email: z.string().optional(),
  question: z.string().min(1, "This field is required"),
  preferredContactMethod: z.enum(["Phone", "Email"]),
  preferredOwnerMethod: z.enum(["Owner", "Tenant"]),
  files: z
    .any()
    .refine(
      (files) => files instanceof FileList || Array.isArray(files),
      "Invalid file list"
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerDetailsForm(): React.JSX.Element {
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const { setContextLoading } = useLoading();
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      masterNumber: "",
      serviceAddress: "",
      billingAddress: "",
      phone: "",
      altPhone: "",
      email: "",
      question: "",
      preferredContactMethod: "Phone",
      preferredOwnerMethod: "Owner",
      files: [],
    },
  });
  const dispatch = useDispatch();
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  let roleId = stored?.body?.acl_role_id;
  let customer_id = stored?.body?.customer_id;
  let token = stored?.body?.token;
  const onSubmit = (data: FormValues) => {
    let files: any = data?.files?.length ? data?.files : [];

    // if (!files?.length) {
    //   toast.warning('Please upload any file');
    //   return;
    // }
    // console.log('Form Submitted:', data);

    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "1");

    formData.append("question", data?.question);
    formData.append("preferMethod", data?.preferredContactMethod);
    formData.append("amthe", data?.preferredOwnerMethod);
    files.forEach((file, index) => {
      formData.append(`upload_file`, file);
    });
    // if (!files?.length) {
    //   formData.append(`upload_file`, '');
    // }
    // formData.append('upload_file', data?.files);

    dispatch(contactCustomerService(token, formData, handleReset));
  };
  const handleReset = () => {
    setValue("files", []);
    setValue("preferredOwnerMethod", "Owner");
    setValue("preferredContactMethod", "Phone");
    setValue("question", "");
  };
  React.useEffect(() => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "0");

    dispatch(
      contactCustomerService(
        token,
        formData,
        successCallBack,
        false,
        setContextLoading
      )
    );
  }, [customer_id]);
  const successCallBack = (res) => {
    console.log(res, "sdsdsdsdsdsdsd");
    const customer = res?.customer_data?.[0];

    setValue("accountName", customer?.customer_name);
    setValue("accountNumber", customer?.acctnum);
    setValue("masterNumber", customer?.meterNumber);
    setValue("serviceAddress", customer?.service_address);
    setValue("billingAddress", customer?.address);
    setValue("phone", customer?.phone);
    setValue("altPhone", customer?.phone2 ?? "");
    const email = customer.email;
    if (typeof email === "string" && email.trim() !== "") {
      setValue("email", email);
    } else {
      setValue("email", ""); // or omit setting it if schema allows optional
    }
  };
  const rawFiles = watch("files");
  const files: File[] = Array.isArray(rawFiles)
    ? rawFiles
    : Array.from(rawFiles || []);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setValue("files", [...files, ...selectedFiles], { shouldValidate: true });
    e.target.value = ""; // reset input for duplicate file names
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  return (
    <SkeletonWrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ borderRadius: boarderRadius.card }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <Controller
                  name="accountName"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      variant="outlined"
                      fullWidth
                      disabled
                      required
                      error={!!errors.accountName}
                    >
                      <InputLabel>Account name</InputLabel>
                      <OutlinedInput label="Account name" {...field} />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      disabled
                      fullWidth
                      required
                      error={!!errors.accountNumber}
                    >
                      <InputLabel>Account #</InputLabel>
                      <OutlinedInput label="Account #" {...field} />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="masterNumber"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      disabled
                      fullWidth
                      error={!!errors.masterNumber}
                    >
                      <InputLabel>Meter #</InputLabel>
                      <OutlinedInput label="Master #" {...field} />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="serviceAddress"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      disabled
                      fullWidth
                      required
                      error={!!errors.serviceAddress}
                    >
                      <InputLabel>Service Address</InputLabel>
                      <OutlinedInput label="Service Address" {...field} />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="billingAddress"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      disabled
                      fullWidth
                      required
                      error={!!errors.billingAddress}
                    >
                      <InputLabel>Billing Address</InputLabel>
                      <OutlinedInput label="Billing Address" {...field} />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <FormControl disabled fullWidth>
                      <InputLabel>Primary Phone</InputLabel>
                      <OutlinedInput
                        label="Primary Phone"
                        type="tel"
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        {...field}
                      />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="altPhone"
                  control={control}
                  disabled
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Alt Phone</InputLabel>
                      <OutlinedInput
                        label="Alt Phone"
                        type="tel"
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        {...field}
                      />
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid md={6} xs={12}>
                <Controller
                  name="email"
                  disabled
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled error={!!errors.email}>
                      <InputLabel>Email</InputLabel>
                      <OutlinedInput label="Email" type="email" {...field} />
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Grid md={12} xs={12} p={0} pt={3}>
              <Controller
                name="question"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.question}>
                    <InputLabel>Enter your comments or questions </InputLabel>
                    <OutlinedInput
                      label="Enter your comments or questions "
                      multiline
                      {...field}
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid container spacing={2} mt={1}>
              <Grid xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="h6">
                    Preferred contact method *
                  </Typography>
                  <Controller
                    name="preferredContactMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="Phone"
                          control={<Radio />}
                          label="Phone"
                        />
                        <FormControlLabel
                          value="Email"
                          control={<Radio />}
                          label="Email"
                        />
                      </RadioGroup>
                    )}
                  />
                </Stack>
              </Grid>

              <Grid xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="h6">I am the *</Typography>
                  <Controller
                    name="preferredOwnerMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="Owner"
                          control={<Radio />}
                          label="Owner"
                        />
                        <FormControlLabel
                          value="Tenant"
                          control={<Radio />}
                          label="Tenant"
                        />
                      </RadioGroup>
                    )}
                  />
                </Stack>
              </Grid>
              <Grid md={12} xs={12} p={0} pt={3}>
                <FormControl fullWidth error={!!errors.files}>
                  <Typography variant="body1" mb={1}>
                    Please upload any supporting documents or photos:(Photos or
                    PDfs,etc..)
                  </Typography>
                  <OutlinedInput
                    type="file"
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
                  <Grid container spacing={1} mt={2}>
                    {files.map((file, index) => (
                      <Grid key={index}>
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

          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              sx={{ color: colors.blue, borderColor: colors.blue }}
              disables={accountLoading}
              textTransform="none"
              onClick={() => handleReset()}
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
              type="submit"
              variant="contained"
              disabled={accountLoading}
              loading={accountLoading}
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{ borderRadius: "12px", height: "41px" }}
            >
              Send
            </Button>
          </CardActions>
        </Card>
      </form>
    </SkeletonWrapper>
  );
}
