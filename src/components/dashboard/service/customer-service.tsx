import * as React from "react";
import { contactCustomerService } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
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
import { useDispatch, useSelector } from "@/hooks/redux";
import { z } from "zod";

import { useLoading } from "@/components/core/skeleton-context";
import { setRouteChecker } from "@/state/features/dashBoardSlice";
import {
  User,
  IdentificationCard,
  Gauge,
  MapPin,
  House,
  Phone,
  DeviceMobile,
  EnvelopeSimple,
} from "@phosphor-icons/react";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

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
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const roleId = stored?.body?.acl_role_id;
  const customer_id = stored?.body?.customer_id;


  const onSubmit = (data: FormValues) => {
    const files: File[] = data.files ? Array.from(data.files) : [];

    // if (!files?.length) {
    //   toast.warning('Please upload file');
    //   return;
    // }
    // //console.log('Form Submitted:', data);

    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "1");

    formData.append("question", data?.question);
    formData.append("preferMethod", data?.preferredContactMethod);
    formData.append("amthe", data?.preferredOwnerMethod);
    files.forEach((file) => {
      formData.append(`upload_file`, file);
    });
    // if (!files?.length) {
    //   formData.append(`upload_file`, '');
    // }
    // formData.append('upload_file', data?.files);

    dispatch(contactCustomerService(formData, handleReset));
  };
  const handleReset = () => {
    setValue("files", []);
    setValue("preferredOwnerMethod", "Owner");
    setValue("preferredContactMethod", "Phone");
    setValue("question", "");

    setHasUnsavedChanges(false);
  };

  React.useEffect(() => {

    if (hasUnsavedChanges) {
      dispatch(setRouteChecker(true));

    }
    return () => {
      dispatch(setRouteChecker(false));
    }
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
  const successCallBack = (res) => {
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
  }, [hasUnsavedChanges]);


  const infoFields = [
    {
      label: "Account Name",
      value: watch("accountName"),
      icon: User,
    },
    {
      label: "Email",
      value: watch("email"),
      icon: EnvelopeSimple,
    },
    {
      label: "Account #",
      value: watch("accountNumber"),
      icon: IdentificationCard,
    },
    {
      label: "Meter #",
      value: watch("masterNumber"),
      icon: Gauge,
    },
    {
      label: "Service Address",
      value: watch("serviceAddress"),
      icon: MapPin,
    },
    {
      label: "Billing Address",
      value: watch("billingAddress"),
      icon: House,
    },
    {
      label: "Primary Phone",
      value: watch("phone"),
      icon: Phone,
    },
    {
      label: "Alt Phone",
      value: watch("altPhone"),
      icon: DeviceMobile,
    },

  ];


  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ borderRadius: 0, }}>
          <CardContent>

            <Grid container spacing={2}>
              {infoFields.map(({ label, value, icon: Icon }) => (
                <Grid xs={12} md={6} key={label}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                    }}
                  >
                    <CardContent
                      sx={{
                        py: 1.25,
                        px: 0,
                        "&:last-child": {
                          pb: 1.25,
                        },
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
                            width: 46,
                            height: 46,
                            bgcolor: "#EEF4FF",
                            color: "#2563EB",
                          }}
                        >
                          <Icon size={22} />
                        </Avatar>

                        <Box flex={1}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {label}
                          </Typography>

                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{
                              lineHeight: 1.3,
                              wordBreak: "break-word",
                            }}
                          >
                            {value || "-"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
                      minRows={3}
                      {...field}
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid container spacing={2} mt={1}>
              {/* <Grid xs={12} sm={6}>
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
              </Grid> */}

              <Grid xs={12} sm={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap", // mobile ke liye
                  }}
                >
                  <Typography variant="body1" whiteSpace="nowrap">
                    Preferred contact method *
                  </Typography>

                  <Controller
                    name="preferredContactMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="Phone"
                          control={<Radio size="small" />}
                          label="Phone"
                        />
                        <FormControlLabel
                          value="Email"
                          control={<Radio size="small" />}
                          label="Email"
                        />
                      </RadioGroup>
                    )}
                  />
                </Box>
              </Grid>

              <Grid xs={12} sm={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body1" whiteSpace="nowrap">
                    I am the *
                  </Typography>

                  <Controller
                    name="preferredOwnerMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
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
              {/* <Grid md={12} xs={12} p={0} pt={1.6} px={1.2}> */}
              {/* <FormControl fullWidth error={!!errors.files}> */}
              {/* <Typography variant="body1" mb={1}>
                    Please upload any supporting documents or photos:(Photos or
                    PDFs,etc..)
                  </Typography> */}
              {/* <OutlinedInput
                    type="file"
                    inputProps={{ multiple: true }}
                    onChange={handleFilesChange}
                  />
                  {!!errors.files && (
                    <FormHelperText>
                      {errors.files.message as string}
                    </FormHelperText>
                  )} */}
              {/* </FormControl> */}

              {/* File Preview List */}
              {/* {files.length > 0 && (
                  <Grid container spacing={1} mt={2}>
                    {files.map((file, index) => (
                      <Grid key={`${file.name}-${file.lastModified}`}>
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
                )} */}
              {/* </Grid> */}
            </Grid>
          </CardContent>

          <Divider />

          <CardActions sx={{ justifyContent: "flex-end", px: 3.2, py: 2 }}>
            <Button
              variant="outlined"
              sx={{ color: colors.blue, borderColor: colors.blue }}
              disables={accountLoading}
              textTransform="none"
              onClick={() => {
                handleReset()
                setHasUnsavedChanges(false);
              }}
              style={{
                color: colors.blue,
                borderColor: colors.blue,
                backgroundColor: "white",
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
    </>
  );
}
