import * as React from "react";

import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";

import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";

import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import { Button } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";
import { getCompanyListApi } from "@/api/dashboard";
import type { CompanyListItem } from "@/types/domain";

import { UpdatePasswordModal } from "../dashboard/account/update-password-modal";
import { paths } from "@/utils/paths";
import Button from '../CommonComponents/button-comp';

import { useLocation, useSearchParams, Link } from "react-router-dom";
import { Button as MUIButton, MenuItem, Select, CircularProgress } from "@mui/material";

import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";

const genericSchema = zod.object({
  company: zod.union([zod.string(), zod.number()]).refine(
    (val) => val !== "" && val !== undefined && val !== null,
    { message: "Please select a company" }
  ),
  email: zod.string().min(1, { message: "Account number is required" }),
});

const companySpecificSchema = zod.object({
  company: zod.union([zod.string(), zod.number()]).optional(),
  email: zod.string().min(1, { message: "Account number is required" }),
});

type Values = {
  company?: string | number;
  email: string;
};

const defaultValues: Values = { company: "", email: "" };

export function ForgotLoginForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [accountFocused, setAccountFocused] = React.useState(false);
  const [companyList, setCompanyList] = React.useState<CompanyListItem[]>([]);
  const [companiesLoading, setCompaniesLoading] = React.useState<boolean>(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { companyInfo } = useSelector(
    (state: RootState) => state?.Account
  );

  const rawSlug = location.pathname?.split("/")[1];
  const queryAlias = searchParams.get("company") || searchParams.get("alias") || searchParams.get("company_alias");
  const slugAlias = rawSlug?.startsWith("forgot-login-")
    ? rawSlug.replace("forgot-login-", "")
    : rawSlug?.startsWith("forgot-") && rawSlug !== "forgot-login"
    ? rawSlug.replace("forgot-", "")
    : null;

  const isCompanySpecific = Boolean(
    rawSlug?.startsWith("forgot-login-") ||
    (rawSlug?.startsWith("forgot-") && rawSlug !== "forgot-login") ||
    queryAlias
  );

  const storedAlias = (getLocalStorage("alias-details") as { alias?: string; id?: string | number } | null)?.alias;
  const storedCompanyId = (getLocalStorage("alias-details") as { alias?: string; id?: string | number } | null)?.id;

  const effectiveAlias = isCompanySpecific
    ? (companyInfo?.company?.alias || slugAlias || queryAlias || storedAlias || "")
    : "";
  const effectiveCompanyId = isCompanySpecific
    ? (companyInfo?.company?.id || storedCompanyId || "")
    : "";

  const schema = React.useMemo(
    () => (isCompanySpecific ? companySpecificSchema : genericSchema),
    [isCompanySpecific]
  );

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (isCompanySpecific) return;

    let isMounted = true;
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      try {
        const res = await getCompanyListApi({ acl_role_id: 4 });
        if (isMounted && res?.status && Array.isArray(res?.body?.company_list)) {
          setCompanyList(res.body.company_list);
        }
      } catch (err) {
        console.error("Failed to fetch company list:", err);
      } finally {
        if (isMounted) {
          setCompaniesLoading(false);
        }
      }
    };

    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, [isCompanySpecific]);

  React.useEffect(() => {
    if (isCompanySpecific && effectiveCompanyId && !watch("company")) {
      setValue("company", String(effectiveCompanyId));
    }
  }, [isCompanySpecific, effectiveCompanyId, setValue, watch]);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      const formData = new FormData();
      const selectedCompanyId = isCompanySpecific
        ? (effectiveCompanyId || values.company)
        : values.company;
      if (selectedCompanyId) {
        formData.append("company", String(selectedCompanyId));
      }
      if (effectiveAlias) {
        formData.append("alias", effectiveAlias);
        formData.append("company_alias", effectiveAlias);
        formData.append("company_login", effectiveAlias);
      }
      formData.append("account", values.email.trim());

      const { error } = await authClient.resetUserName(formData, effectiveAlias || undefined);

      if (error) {
        setError("root", { type: "server", message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);
    },
    [setError, effectiveCompanyId, effectiveAlias, isCompanySpecific]
  );
  return (
    <Stack spacing={4}>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#e8f0fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <User size={30} color={colors.blue} weight="regular" />
          {/* Small lock badge */}
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "#e8f0fb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={12} color={colors.blue} weight="fill" />
          </Box>
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={700}>
            Forgot Your Username?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your account number and we'll send your login username to the email associated with your account.
          </Typography>
        </Box>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography
          variant="body1"

          mb={3.5}

        >
          {/* Please enter your account number.
          Your Login will be sent to the email on file for this account. */}

        </Typography>

        <Stack spacing={2}>
          {/* Company Select */}
          {!isCompanySpecific && (
            <Controller
              control={control}
              name="company"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.company)}>
                  <InputLabel
                    id="company-select-label"
                    shrink={Boolean(field.value)}
                  >
                    Company *
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="company-select-label"
                    id="company-select"
                    label="Company *"
                    notched={Boolean(field.value)}
                    value={field.value ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={companiesLoading}
                    endAdornment={
                      companiesLoading ? (
                        <CircularProgress size={20} sx={{ mr: 2, color: colors.blue }} />
                      ) : null
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select a company</em>
                    </MenuItem>
                    {companyList.map((company) => (
                      <MenuItem key={company.id} value={String(company.id)}>
                        {company.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.company && (
                    <FormHelperText>{errors.company.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          )}

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.email)}>
                <InputLabel
                  shrink={accountFocused || Boolean(field.value)}
                  sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
                >
                  Account Number *
                </InputLabel>
                <OutlinedInput
                  {...field}
                  notched={accountFocused || Boolean(field.value)}
                  label="Account Number *"
                  type="text"
                  onFocus={() => setAccountFocused(true)}
                  onBlur={() => { field.onBlur(); setAccountFocused(false); }}
                  startAdornment={
                    <CreditCard size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
                  }
                />
                {errors.email && (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          {errors.root && (
            <Alert color="error">{errors.root.message}</Alert>
          )}

          <Box sx={{
            display: "flex", justifyContent: "space-between", pt: 1,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: 1.5,

          }}>
            <MUIButton
              component={Link}
              to={paths.auth.newLogin(effectiveAlias || undefined)}
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                height: "44px",
                px: 3,
                color: colors.blue,
                borderColor: colors.blue,
                backgroundColor: "#fff",
                fontWeight: 600,
              }}
            >
              Back to Login
            </MUIButton>

            <Button
              disabled={isPending}
              loading={isPending}
              type="submit"
              variant="contained"
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{
                borderRadius: "12px",
                height: "44px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontWeight: 600,
              }}
            >
              <PaperPlaneTilt size={18} style={{ marginRight: 8 }} weight="regular" />
              Send Username
            </Button>
          </Box>
        </Stack>
      </form>
      <UpdatePasswordModal open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
