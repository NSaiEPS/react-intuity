import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";

const SaveBankAccount = ({ companyName = "" }) => {
    type BankFormData = {
  routingNumber: string;
  accountNumber: string;
  accountType: "" | "PC" | "PS" | "BC" | "BS";
  elavonCompanyName: string;
  agree: boolean;
};

type FormErrors = Partial<Record<keyof BankFormData, string>>;


  const [formData, setFormData] = useState<BankFormData>({
    routingNumber: "",
    accountNumber: "",
    accountType: "",
    elavonCompanyName: "",
    agree: false,
  });



  const [errors, setErrors] = useState<FormErrors>({});
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Routing number
    if (!formData.routingNumber) {
      newErrors.routingNumber = "Routing number is required.";
    } else if (formData.routingNumber.length < 9) {
      newErrors.routingNumber = "Routing number must be at least 9 digits.";
    }

    // Account number
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required.";
    } else if (
      formData.accountNumber.length < 4 ||
      formData.accountNumber.length > 17
    ) {
      newErrors.accountNumber = "Account number must be 4–17 digits long.";
    }

    // Account type
    if (!formData.accountType) {
      newErrors.accountType = "Please select an account type.";
    }

    // Company name for business accounts
    if (
      (formData.accountType === "BC" || formData.accountType === "BS") &&
      !formData.elavonCompanyName
    ) {
      newErrors.elavonCompanyName =
        "Company name is required for business accounts.";
    }

    // Checkbox
    if (!formData.agree) {
      newErrors.agree = "You must authorize before continuing.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["routingNumber", "accountNumber"].includes(name)) {
      // Allow only numbers
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckbox = (e) => {
    setFormData({ ...formData, agree: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please correct the errors with your payment method.");
      return;
    }

    // Send data only to the parent that loaded this iframe — never "*"
    const parentOrigin = document.referrer
      ? new URL(document.referrer).origin
      : window.location.origin;
    window.parent.postMessage(
      {
        source: "elavon",
        elavonCompanyName: formData.elavonCompanyName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        accountType: formData.accountType,
        token: new Date().toISOString().replace(/[-:.TZ]/g, ""),
      },
      parentOrigin
    );

    alert("Bank account information submitted successfully!");
  };

  const handleReset = () => {
    setFormData({
      routingNumber: "",
      accountNumber: "",
      accountType: "",
      elavonCompanyName: "",
      agree: false,
    });
    setErrors({});
    setShowAccountNumber(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        border: "1px solid #cfd8dc",
        borderRadius: 1,
        p: 3,
        maxWidth: 500,
        mx: "auto",
        mt: 4,
        backgroundColor: "#fff",
      }}
    >
      <Typography
        variant="body1"
        align="center"
        sx={{ color: "red", fontWeight: "bold", mb: 2 }}
      >
        ⚠️ WARNING! Only click this button ONCE!
      </Typography>

      {/* Routing Number */}
      <TextField
        fullWidth
        label="Routing Number"
        variant="standard"
        name="routingNumber"
        value={formData.routingNumber}
        onChange={handleChange}
        error={!!errors.routingNumber}
        helperText={errors.routingNumber}
        sx={{ mb: 3 }}
        inputProps={{ maxLength: 10 }}
      />

      {/* Account Number */}
      <TextField
        fullWidth
        label="Account Number"
        variant="standard"
        name="accountNumber"
        type={showAccountNumber ? "text" : "password"}
        value={formData.accountNumber}
        onChange={handleChange}
        error={!!errors.accountNumber}
        helperText={errors.accountNumber}
        sx={{ mb: 3 }}
        inputProps={{ maxLength: 17 }}
        // InputProps={{
        //   endAdornment: (
        //     <InputAdornment position="end">
        //       <IconButton
        //         onClick={() => setShowAccountNumber(!showAccountNumber)}
        //         edge="end"
        //       >
        //         {showAccountNumber ? <VisibilityOff /> : <Visibility />}
        //       </IconButton>
        //     </InputAdornment>
        //   ),
        // }}
      />

      {/* Account Type */}
      <FormControl
        fullWidth
        variant="standard"
        sx={{ mb: 3 }}
        error={!!errors.accountType}
      >
        <InputLabel>Account Type</InputLabel>
        <Select
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
        >
          <MenuItem value="">Select</MenuItem>
          <MenuItem value="PC">Personal Checking</MenuItem>
          <MenuItem value="PS">Personal Savings</MenuItem>
          <MenuItem value="BC">Business Checking</MenuItem>
          <MenuItem value="BS">Business Savings</MenuItem>
        </Select>
        {errors.accountType && (
          <Typography variant="caption" color="error">
            {errors.accountType}
          </Typography>
        )}
      </FormControl>

      {/* Company Name */}
      {(formData.accountType === "BC" || formData.accountType === "BS") && (
        <TextField
          fullWidth
          label="Company Name"
          variant="standard"
          name="elavonCompanyName"
          value={formData.elavonCompanyName}
          onChange={handleChange}
          error={!!errors.elavonCompanyName}
          helperText={errors.elavonCompanyName}
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 20 }}
        />
      )}

      {/* Authorization */}
      <FormControlLabel
        control={
          <Checkbox checked={formData.agree} onChange={handleCheckbox} />
        }
        label={
          <Typography variant="body2">
            I authorize <strong>{companyName}</strong> to store and enroll the
            bank account indicated in this form for payment of one-time and/or
            auto recurring transactions for amounts due on my utility account on
            or before the due date. I understand that the authorization will
            remain in effect until I cancel it and that payments may be
            withdrawn from my account on the same or next banking business day
            after it is originated.
          </Typography>
        }
      />
      {errors.agree && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mb: 2 }}
        >
          {errors.agree}
        </Typography>
      )}

      {/* Buttons */}
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ borderRadius: "12px", height: "41px" }}
        >
          CONTINUE
        </Button>

        <Button
          onClick={handleReset}
          variant="outlined"
          sx={{
            color: "primary.main",
            borderColor: "primary.main",
            borderRadius: "12px",
            height: "41px",
          }}
        >
          RESET
        </Button>
      </Box>
    </Box>
  );
};

export default SaveBankAccount;
