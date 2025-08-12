import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  stepConnectorClasses,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  IconButton,
} from "@mui/material";
import { CustomConnector, CustomStepIcon } from "./sign-up-form";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";
import { X } from "@phosphor-icons/react";

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
            <Button
              type="button"
              variant="contained"
              onClick={handleRetrieveBill}
              style={{
                borderRadius: "12px",
                height: "41px",
                width: "100%",
                backgroundColor: colors.blue,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = colors["blue.3"])
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = colors.blue)
              }
            >
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
              <Button
                onClick={handleBack}
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                }}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                style={{
                  borderRadius: "12px",
                  height: "41px",
                  width: "115",
                  backgroundColor: colors.blue,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = colors["blue.3"])
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.blue)
                }
              >
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
              <Button
                onClick={handleBack}
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={onClose}
                style={{
                  borderRadius: "12px",
                  height: "41px",
                  width: "115",
                  backgroundColor: colors.blue,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = colors["blue.3"])
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.blue)
                }
              >
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
    // <Modal open={open} onClose={onClose}>
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            One Time Payment
          </Typography>

          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 13,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X size={24} color={colors.blue} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            p: 4,
            bgcolor: "background.paper",
            maxWidth: 600,
            mx: "auto",
            my: "7%",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<CustomConnector topOffset={15} />}
            sx={{
              mb: 4,
              // maxWidth: 700,
              // marginX: "auto",
              width: "100%",
              [`& .${stepConnectorClasses.line}`]: {
                borderColor: "#ccc",
                borderTopWidth: 2,
                borderRadius: 1,
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
