import * as React from "react";

import { updateAccountInfo } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Tooltip,
} from "@mui/material";
import { Question, X } from "@phosphor-icons/react";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useNavigate } from "react-router";
import { paths } from "@/utils/paths";

type UpdatePasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

// --- Zod Schema ---
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");
const hashSchema = z.string().min(4, "Hash must be at least 4 characters");

const schema = z
  .object({
    hash: hashSchema,
    new_password: passwordSchema,
    repassword: z.string(),
  })
  .refine((data) => data.new_password === data.repassword, {
    message: "Passwords don't match",
    path: ["repassword"],
  });

type FormData = z.infer<typeof schema>;

// --- Component ---
export function UpdatePasswordModal({
  open,
  onClose,
}: UpdatePasswordModalProps) {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { accountLoading } = useSelector((state: RootState) => state.Account);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hash: "",
      new_password: "",
      repassword: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    const formData = new FormData();

    formData.append("acl_role_id", "4");

    formData.append("step", "2");
    formData.append("newpassword", data?.new_password);
    formData.append("newpassword2", data?.repassword);
    formData.append("hash", data?.hash);

    dispatch(updateAccountInfo("", formData, false, successCallBack));
  };
  const successCallBack = () => {
    navigate(paths.auth.newLogin());
    handleClose();
  };
  const [show, setShow] = React.useState({
    new_password: false,
    repassword: false,
  });

  const toggleVisibility = (key: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <Dialog open={open} fullWidth maxWidth="sm" scroll="body">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Change Password
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth error={!!errors.hash}>
              <InputLabel>Email Hash</InputLabel>
              <OutlinedInput
                label="Old Password"
                type="text"
                {...register("hash")}
              />
              {errors.hash && (
                <FormHelperText>{errors.hash.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.new_password}>
              <InputLabel>New Password</InputLabel>
              <OutlinedInput
                label="New Password"
                type={show.new_password ? "text" : "password"}
                {...register("new_password")}
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip
                      title="At least 6 characters. Numbers & special characters allowed."
                      arrow
                      placement="top"
                    >
                      <IconButton size="small" edge="end">
                        <Question size={20} color="#90caf9" weight="fill" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      onClick={() => toggleVisibility("new_password")}
                      edge="end"
                    >
                      {show.new_password ? (
                        <EyeSlashIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />

              {errors.new_password && (
                <FormHelperText>{errors.new_password.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.repassword}>
              <InputLabel>Confirm Password</InputLabel>
              <OutlinedInput
                label="Confirm Password"
                type={show.repassword ? "text" : "password"}
                {...register("repassword")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility("repassword")}
                      edge="end"
                    >
                      {show.repassword ? (
                        <EyeSlashIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />

              {errors.repassword && (
                <FormHelperText>{errors.repassword.message}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
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
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
