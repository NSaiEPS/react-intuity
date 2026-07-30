import * as React from "react";
import { stopTransferService } from "@/state/features/accountSlice";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";
import dayjs, { Dayjs } from "dayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch } from "@/hooks/redux";
import { z } from "zod";
import { setRouteChecker } from "@/state/features/dashBoardSlice";

const schema = z.object({
  name: z.string().min(1, "Required"),
  phone: z.string().regex(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/, {
    message: "Phone number must be in the format xxx-xxx-xxxx",
  }),
  requestedStopDate: z.date().refine((val) => !!val, { message: "Required" }),
  reading: z
    .number()
    .nonnegative("Reading must be a non-negative number")
    .optional(),
  address: z.string().min(1, "Required"),
  addressTwo: z.string().optional(),
  unit: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  zip: z.string().min(1, "Required"),
  preferredOwnerMethod: z.enum(["Owner", "Tenant"]),
  comment: z.string().min(1, "Required"),
  applicableField: z.string().optional(),
  files: z
    .any()
    .refine(
      (files) => files instanceof FileList || Array.isArray(files),
      "Invalid file list"
    )
    .optional(),
});

type FormDataContent = {
  name: string;
  phone: string;
  requestedStopDate: Date;
  reading?: number;
  address: string;
  addressTwo?: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  preferredOwnerMethod: "Owner" | "Tenant";
  comment: string;
  applicableField?: string;
  files?: File[];
};

export function SendBillDetailsForm(): React.JSX.Element {
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormDataContent>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      requestedStopDate: new Date(),
      reading: 0,
      address: "",
      addressTwo: "",
      unit: "",
      city: "",
      zip: "",
      state: "",
      preferredOwnerMethod: "Owner",
      comment: "",
      applicableField: "",
      files: [],
    },
  });
  const dispatch = useDispatch();

  const onSubmit: SubmitHandler<FormDataContent> = (data) => {
    const files:  File[] = data?.files?.length ? data?.files : [];

    // if (!files?.length) {
    //   toast.warning('Please upload any file');
    //   return;
    // }
    const raw = getLocalStorage("intuity-user");

    const stored: IntuityUser | null =
      typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
    const roleId = stored?.body?.acl_role_id;
    const customer_id = stored?.body?.customer_id;
    // //console.log(data, 'hhhhhhh');
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "1");
    formData.append("meterReading", String(data?.reading || ""));
    formData.append("amthe", data?.preferredOwnerMethod);
    formData.append("zip", data?.zip);
    formData.append("city", data?.city);
    formData.append("state", data?.state);
    formData.append("apartment", data?.unit);
    formData.append("streetName", data?.addressTwo);
    formData.append("streetAddress", data?.address);
    formData.append(
      "stopDate",
      dayjs(data?.requestedStopDate).format("DD/MM/YYYY")
    );
    formData.append("attorneys_contact", data?.applicableField);
    files.forEach((file) => {
      formData.append(`upload_file`, file);
    });
    // if (!files?.length) {
    //   formData.append('upload_file', '');
    // }

    dispatch(stopTransferService(formData, false, successCallBack,null,true));
  };
  const successCallBack = () => {
    reset();
  };
  const rawFiles = watch("files");
  const files: File[] = Array.isArray(rawFiles)
    ? rawFiles
    : Array.from(rawFiles || []);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setValue("files", [...files, ...selectedFiles], { shouldValidate: true });
    e.target.value = "";
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setValue("files", updatedFiles, { shouldValidate: true });
  };


  React.useEffect(() => {

    if (isDirty) {
      dispatch(setRouteChecker(true));

    }
    return () => {
      dispatch(setRouteChecker(false));
    }
  }, [isDirty]);

  React.useEffect(() => {

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
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
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ m: 3, borderRadius: boarderRadius.card }}>
        <CardHeader sx={{ pt: 2, pb: 2 }} title="Send Final bill to" />
        <Divider />

        <CardContent>
          <Grid container spacing={3}>
            {/* <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" required error={!!errors.name}>
                <InputLabel>Contact Name</InputLabel>
                <OutlinedInput label="Contact Name" {...register("name")}  />
                {errors.name && (
                  <FormHelperText>{errors.name.message}</FormHelperText>
                )}
              </FormControl>
            </Grid> */}

            {/* <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" required error={!!errors.phone}>
                <InputLabel>Contact Phone</InputLabel>
                <OutlinedInput
                  label="Contact Phone"
                  type="text"
                  placeholder="123-456-7890"
                  inputProps={{ inputMode: "numeric", maxLength: 12 }}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
                      message:
                        "Phone number must be in the format xxx-xxx-xxxx",
                    },
                    onChange: (e) => {
                      let value = e.target.value.replace(/\D/g, ""); // remove all non-numeric
                      if (value.length > 3 && value.length <= 6) {
                        value = value.replace(/(\d{3})(\d+)/, "$1-$2");
                      } else if (value.length > 6) {
                        value = value.replace(
                          /(\d{3})(\d{3})(\d+)/,
                          "$1-$2-$3"
                        );
                      }
                      e.target.value = value;
                    },
                  })}
                />
                {errors.phone && (
                  <FormHelperText>{errors.phone.message}</FormHelperText>
                )}
              </FormControl>
            </Grid> */}

            <Grid md={6} xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="requestedStopDate"
                  
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Requested Stop Date"
                      value={dayjs(field.value)}
                      minDate={dayjs()}
                      disablePast
                      onChange={(date: Dayjs | null) =>
                        field.onChange(date?.toDate())
                      }
                      renderInput={(params) => (
                        <TextField

                          {...params}
                          fullWidth
                        size="small"
                          required
                          error={!!errors.requestedStopDate}
                          helperText={errors.requestedStopDate?.message}
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true,
                          }}
                          color="primary"
                        />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" error={!!errors.reading}>
                <InputLabel>Final Meter Reading</InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  label="Final Meter Reading"
   {...register("reading", { valueAsNumber: true })}
                />
                {errors.reading && (
                  <FormHelperText>{errors.reading.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" required error={!!errors.address}>
                <InputLabel>Street Address</InputLabel>
                <OutlinedInput
                  label="Street Address"
                  {...register("address")}
                />
                {errors.address && (
                  <FormHelperText>{errors.address.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Street Address 2</InputLabel>
                <OutlinedInput
                  label="Street Address 2"
                  {...register("addressTwo")}
                />
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Apartment/Unit</InputLabel>
                <OutlinedInput label="Apartment/Unit" {...register("unit")} />
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" required error={!!errors.city}>
                <InputLabel>City</InputLabel>
                <OutlinedInput label="City" {...register("city")} />
                {errors.city && (
                  <FormHelperText>{errors.city.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" required error={!!errors.zip}>
                <InputLabel>Zip Code</InputLabel>
                <OutlinedInput label="Zip Code" {...register("zip")} />
                {errors.zip && (
                  <FormHelperText>{errors.zip.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* <Grid md={6} xs={12}>
              <FormControl fullWidth size="small" required error={!!errors.state}>
                <InputLabel>State</InputLabel>
                <OutlinedInput label="State" {...register("state")} />
                {errors.state && (
                  <FormHelperText>{errors.state.message}</FormHelperText>
                )}
              </FormControl>
            </Grid> */}

  {/* <Grid md={6} xs={12}>
    <FormControl fullWidth error={!!errors.applicableField}>
      <InputLabel shrink>
        If applicable, enter the closing attorney's contact details (name,
        phone, email)
      </InputLabel>

      <OutlinedInput
        notched
        label="If applicable, enter the closing attorney's contact details (name, phone, email)"
        {...register("applicableField")}
      />

      {errors.applicableField && (
        <FormHelperText>
          {errors.applicableField.message}
        </FormHelperText>
      )}
    </FormControl>
  </Grid> */}

  <Grid
    md={6}
    xs={12}
    sx={{
      display: "flex",
      alignItems: "center",
      paddingLeft: "20px"
    }}
  >
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      flexWrap="wrap"
    >
      <Typography
        variant="subtitle1"
        whiteSpace="nowrap"
      >
        New Resident *
      </Typography>

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

  {/* <Grid xs={12}>
    <FormControl fullWidth required error={!!errors.comment}>
      <InputLabel>Comment</InputLabel>

      <OutlinedInput
        multiline
        minRows={3}
        label="Comment"
        {...register("comment")}
      />

      {errors.comment && (
        <FormHelperText>{errors.comment.message}</FormHelperText>
      )}
    </FormControl>
  </Grid> */}

          </Grid>

     

          {/* <Grid md={12} xs={12} p={0} pt={3}>
            <FormControl fullWidth error={!!errors.files}>
              <Typography variant="body1" mb={1}>
                Please upload any supporting documents or photos:
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

            {files.length > 0 && (
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
            )}
          </Grid> */}
        </CardContent>

        <Divider />

        <CardActions sx={{ justifyContent: "flex-end",px: 3.2, py: 2 }}>
          <Button
            onClick={() => reset()}
            variant="outlined"
            sx={{ color: colors.blue, borderColor: colors.blue }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: colors.blue,
              "&:hover": { backgroundColor: colors["blue.3"] },
            }}
          >
            Save
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
