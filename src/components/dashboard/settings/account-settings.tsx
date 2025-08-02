import * as React from "react";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { getDashboardInfo } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
} from "@mui/material";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Login Id or Email is required")
    .email("Invalid email format"),
});

type FormData = z.infer<typeof schema>;

export function AccountSettingsForm(): React.JSX.Element {
  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  const userInfo: any = getLocalStorage("intuity-customerInfo");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: userInfo?.user_name,
      email: userInfo?.loginID,
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
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const onSubmit = (data: FormData) => {
    console.log("Submitted Data:", data);

    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("name", data?.name ? data?.name : userInfo?.user_name);
    formData.append("email", data?.email ? data?.email : userInfo?.loginID);
    formData.append("is_form", "1");

    dispatch(updateAccountInfo(token, formData, true, successCallBack));
    // dispatch(updateAccountInfo(data));
  };
  const successCallBack = () => {
    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;
    dispatch(getDashboardInfo(roleId, userId, token));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ borderRadius: boarderRadius.card }}>
        <CardHeader
          subheader="Manage account settings"
          title="Account Settings"
        />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: "sm" }}>
            <FormControl fullWidth error={!!errors.name}>
              <InputLabel>Name</InputLabel>
              <OutlinedInput label="Name" type="text" {...register("name")} />
              {errors.name && (
                <FormHelperText>{errors.name.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.email}>
              <InputLabel>Login Id or Email</InputLabel>
              <OutlinedInput
                label="Login Id or Email"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <FormHelperText>{errors.email.message}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end" }}>
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
            Cancel
          </Button>{" "}
          <Button
            disabled={accountLoading}
            loading={accountLoading}
            type="submit"
            variant="contained"
            textTransform="none"
            bgColor={colors.blue}
            hoverBackgroundColor={colors["blue.3"]}
            hoverColor="white"
            style={{
              borderRadius: "12px",
              height: "41px",
            }}
          >
            Update
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
