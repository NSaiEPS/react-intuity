import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

const steps = ["Retrieve Bill", "Confirm Payment", "Select Payment Method"];

export default function OneTimePaymentModal({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    accountNo: "",
    invoiceAmount: "",
    name: "",
    email: "",
    amountToPay: "",
    convenienceFee: "",
    totalPayment: "",
    paymentType: "card",
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleRetrieveBill = () => {
    // Simulate API call
    setFormData((prev) => ({
      ...prev,
      invoiceAmount: "2032.85",
      name: "LINCOLN RECOVERY",
      email: "accounting@sunshinebh.com",
      amountToPay: "2032.85",
      convenienceFee: "71.15",
      totalPayment: "2104.00",
    }));
    handleNext();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Account No."
              value={formData.accountNo}
              onChange={handleChange("accountNo")}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Original Invoice Amount"
              value={formData.invoiceAmount}
              onChange={handleChange("invoiceAmount")}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleRetrieveBill} fullWidth>
              Retrieve Bill
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Typography>Name: {formData.name}</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>Due Amount: ${formData.invoiceAmount}</Typography>
            <TextField
              fullWidth
              label="Amount To Pay"
              value={formData.amountToPay}
              onChange={handleChange("amountToPay")}
              sx={{ my: 2 }}
            />
            <Box display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Enter Payment Method
              </Button>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <Typography>Amount: ${formData.amountToPay}</Typography>
            <Typography>
              Additional Convenience Fee: ${formData.convenienceFee}
            </Typography>
            <Typography>Total Payment: ${formData.totalPayment}</Typography>

            <Typography sx={{ mt: 2 }}>Select Payment Type</Typography>
            <RadioGroup
              value={formData.paymentType}
              onChange={handleChange("paymentType")}
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label="Credit Card"
              />
              <FormControlLabel
                value="bank"
                control={<Radio />}
                label="Bank Account"
              />
            </RadioGroup>

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" onClick={onClose}>
                Pay Now
              </Button>
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "background.paper",
          maxWidth: 500,
          mx: "auto",
          my: "10%",
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </Box>
    </Modal>
  );
}
