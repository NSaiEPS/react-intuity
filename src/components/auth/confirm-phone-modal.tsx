import React, { useEffect, useMemo, useState } from "react";
import {
  getConfirmInfo,
  updateAccountInfo,
} from "@/state/features/accountSlice";
import { getNotificationList } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  // Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { X } from "@phosphor-icons/react";
// import { Button } from 'nsaicomponents';
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z as zod } from "zod";

import Button from "../CommonComponents/Button";
type PhoneModal = {
  open: boolean;
  onClose: () => void;
  clickedDetails?: any;
  notificationPage?: boolean;
  notificationNumber?: number | string | null;
};
export default function PhoneModal({
  open,
  onClose,
  clickedDetails = null,
  notificationPage = false,
  notificationNumber = null,
}) {
  const { confirmInfo, notificationPreferenceDetails } = useSelector(
    (state: RootState) => state?.Account
  );
  const [isPending, setIsPending] = useState(false);
  const [isOtpModal, setIsOtp] = useState(false);
  console.log(isOtpModal, notificationNumber, "isOtpModal");
  useEffect(() => {
    if (notificationNumber) {
      setIsOtp(true);
    }
  }, [notificationNumber]);
  const [phoneNumber, setPhoneNumber] = useState();
  const schema = zod.object({
    countryCode: zod.union([zod.string(), zod.number()]),
    phone: zod
      .string()
      .min(
        isOtpModal ? 4 : 7,
        isOtpModal
          ? "Otp is must be atleast of 4 digits"
          : "Phone number is too short"
      )
      .max(15, isOtpModal ? "Otp is too long" : "Phone number is too long"),
    // .regex(
    //   /^[0-9]+$/,
    //   isOtpModal
    //     ? "Otp must contain only digits"
    //     : "Phone number must contain only digits"
    // ),
  });
  type FormData = zod.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      countryCode: "1",
      phone: "",
    },
  });

  // Optimize the country list so it doesn't re-render every time
  const countries = useMemo(() => {
    return (
      confirmInfo?.countries?.map((item) => ({
        code: item?.phone_code,
        name: item?.name,
        id: item?.id,
      })) || []
    );
  }, [confirmInfo]);
  const dispatch = useDispatch();
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

  const successCallBack = () => {
    setIsPending(false);

    if (notificationPage) {
      const formData = new FormData();

      formData.append("acl_role_id", role_id);
      formData.append("customer_id", user_id);
      formData.append("id", user_id);
      formData.append("model_open", "15");

      dispatch(
        updateAccountInfo(
          token,
          formData,
          true,
          () => {
            onClose();
          },
          true,
          null,
          true
        )
      );
      return;
    }

    if (isOtpModal) {
      onClose();
    }
    if (!isOtpModal) {
      reset({
        phone: "",
      });
      setIsOtp(true);
    }

    const formData = new FormData();

    formData.append("acl_role_id", role_id);
    formData.append("customer_id", user_id);
    return;
    dispatch(getConfirmInfo(token, formData));
  };

  function toUSPhoneFormat(number) {
    const cleaned = number.toString().replace(/\D/g, "");

    if (cleaned.length === 10) {
      const part1 = cleaned.slice(0, 3);
      const part2 = cleaned.slice(3, 6);
      const part3 = cleaned.slice(6);
      return `(${part1})-${part2}-${part3}`;
    } else {
      return "Invalid number";
    }
  }
  const role_id = stored?.body?.acl_role_id;
  const user_id = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const onSubmit = (data) => {
    if (!isOtpModal) {
      setPhoneNumber(data.phone);
    }
    setIsPending(true);
    if (notificationPage) {
      const formData = new FormData();

      formData.append("acl_role_id", role_id);
      formData.append("customer_id", user_id);
      formData.append("id", user_id);
      formData.append("country_code", "1");

      if (isOtpModal) {
        formData.append("model_open", "4");
        formData.append("otp", data.phone);
        formData.append("phone_no", notificationNumber ?? phoneNumber);
      } else {
        formData.append("model_open", "2");
        formData.append("phone_no", toUSPhoneFormat(watch("phone")));
      }

      dispatch(
        updateAccountInfo(
          token,
          formData,
          true,
          () => {
            if (isOtpModal) {
              successCallBack();
            } else {
              reset({
                phone: "",
              });
              setIsOtp(true);
            }
          },
          false,
          setIsPending
        )
      );

      return;
    }

    if (!isOtpModal) {
      setPhoneNumber(data.phone);
    }
    const formData = new FormData();
    formData.append("acl_role_id", role_id);
    formData.append("customer_id", clickedDetails?.id);
    formData.append("model_open", isOtpModal ? "4" : "2");
    if (isOtpModal) {
      formData.append("otp", data.phone);
    }
    // formData.append('phone_no', data.phone,'(949)-200-8103');
    formData.append(
      "phone_no",
      isOtpModal ? phoneNumber : toUSPhoneFormat(data.phone)
    );
    formData.append("id", clickedDetails?.id);
    formData.append("country_code", data?.countryCode);

    dispatch(
      getNotificationList(
        token,
        formData,
        successCallBack,
        false,
        failureCallBack
      )
    );
  };
  const failureCallBack = () => {
    setIsPending(false);
    // setIsOtp(true);
  };
  useEffect(() => {
    if (open) {
      reset({
        countryCode: "1",
        phone: "",
      });
    }

    return () => {
      setIsPending(false);
      setIsOtp(false);
    };
  }, [open, reset]);
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Change Notification Phone No. (Account No.
        {notificationPage ? CustomerInfo?.acctnum : clickedDetails?.acctnum})
        <IconButton onClick={onClose}>
          <X size={24} color={colors.blue} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isOtpModal
            ? "Enter Verification Code. "
            : " Enter your phone number and we'll text you a verification code."}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }} error={!!errors.countryCode}>
            <InputLabel id="country-code-label">Country</InputLabel>
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="country-code-label" label="Country">
                  {countries.map((country) => (
                    <MenuItem key={country?.code} value={country?.code}>
                      {country?.code} - {country?.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.countryCode && (
              <Typography variant="caption" color="error">
                {errors.countryCode.message}
              </Typography>
            )}
          </FormControl>

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={isOtpModal ? "Otp" : "Phone No"}
                variant="outlined"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          // onClick={onClose}
          // variant="outlined"
          // sx={{
          //   color: colors.blue,
          //   borderColor: colors.blue,
          // }}
          onClick={onClose}
          variant="outlined"
          textTransform="none"
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
          // onClick={handleSubmit(onSubmit)}
          // variant="contained"
          // sx={{
          //   backgroundColor: colors.blue,
          //   '&:hover': {
          //     backgroundColor: colors['blue.3'],
          //   },
          // }}

          disabled={isPending}
          loading={isPending}
          type="submit"
          onClick={handleSubmit(onSubmit)}
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
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
}
