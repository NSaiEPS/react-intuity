import * as React from "react";
import {
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { colors } from "@/utils";

// ─── Step labels ───────────────────────────────────────────────────────────────
export const steps = ["Account Info", "Portal Registration", "Contact Info", "Check Your Email"];

// ─── Connector line ────────────────────────────────────────────────────────────
interface CustomConnectorProps {
  topOffset?: number;
}

export const CustomConnector = styled(StepConnector, {
  shouldForwardProp: (prop) => prop !== "topOffset",
})<CustomConnectorProps>(({ topOffset = 15 }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: topOffset,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: colors["blue.3"],
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: colors.blue,
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#ccc",
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

// ─── Step icon ─────────────────────────────────────────────────────────────────
const CustomStepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  backgroundColor: ownerState.active ? colors.blue : "#ccc",
  color: "#fff",
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 500,
  width: "32px",
  height: "32px",
  fontSize: "14px",

  "@media (max-width:380px)": {
    width: "26px",
    height: "26px",
    fontSize: "12px",
  },

  ...(ownerState.completed && {
    backgroundColor: colors.blue,
  }),
}));

export function CustomStepIcon(props: {
  active?: boolean;
  completed?: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  const { active, completed, className, icon } = props;
  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {icon}
    </CustomStepIconRoot>
  );
}

// ─── Full stepper ──────────────────────────────────────────────────────────────
export const CustomStepper = ({ activeStep }: { activeStep: number }) => {
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector topOffset={14} />}
        sx={{
          mb: 4,
          width: "100%",
          px: { xs: 0.5, sm: 1 },

          "& .MuiStep-root": {
            px: { xs: 0.2, sm: 1 },
          },

          "& .MuiStepLabel-label": {
            mt: 1,
            fontSize: { xs: "0.72rem", sm: "0.85rem" },
            lineHeight: 1.25,
            whiteSpace: "normal",
            textAlign: "center",
            maxWidth: { xs: "70px", sm: "120px" },
            wordBreak: "break-word",
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
