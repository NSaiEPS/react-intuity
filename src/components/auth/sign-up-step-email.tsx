import * as React from "react";
import { Box, Typography } from "@mui/material";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";

interface StepCheckEmailProps {
  onBackToLogin: () => void;
}

export function StepCheckEmail({ onBackToLogin }: StepCheckEmailProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="50vh"
      textAlign="center"
    >
      <CheckCircle size={80} weight="fill" color="#2e7d32" />

      <Typography variant="h5" fontWeight={600} mt={1}>
        Registration Almost Complete
      </Typography>

      <Typography
        variant="body1"
        sx={{
          maxWidth: 460,
          lineHeight: 1.7,
          backgroundColor: "#FFF9C4",
          color: "#000000",
          padding: "10px 14px",
          borderRadius: "6px",
          my: 2,
        }}
      >
        Please check your email inbox and click the activation link to complete
        your account setup.
      </Typography>

      <Button
        onClick={onBackToLogin}
        variant="contained"
        textTransform="none"
        bgColor={colors.blue}
        hoverBackgroundColor={colors["blue.3"]}
        hoverColor="white"
        style={{ borderRadius: "12px", height: "41px", marginTop: "8px", minWidth: "160px" }}
      >
        {`← `} Back to Login
      </Button>
    </Box>
  );
}
