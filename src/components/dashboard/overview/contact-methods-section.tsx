import * as React from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Link,
  Chip,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  EnvelopeSimple,
  DeviceMobile,
  ArrowClockwise,
  Question,
} from "@phosphor-icons/react";

export interface ContactMethod {
  type: "phone" | "email";
  value: string;
  verified: boolean;
}

const tooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: "#E7E6E6",
      color: "#000000",
      border: "1px solid #d0cfcf",
      fontSize: "14px",
      lineHeight: 1.4,
      "& .MuiTooltip-arrow": {
        color: "#E7E6E6",
        "&::before": {
          border: "1px solid #d0cfcf",
        },
      },
    },
  },
};

interface ContactMethodsSectionProps {
  contacts: ContactMethod[];
  hasUpdatedEmail: boolean;
  onAddContact: (type: ContactMethod["type"]) => void;
  onResendVerification: (value: string) => void;
  onRemovePhone: () => void;
}

export function ContactMethodsSection({
  contacts,
  hasUpdatedEmail,
  onAddContact,
  onResendVerification,
  // onRemovePhone
}: ContactMethodsSectionProps): React.JSX.Element {
  return (
    <Grid
      container
      border="1px solid #DCDFE4"
      borderRadius={1}
      mx={2}
      mt={2}
      width="calc(100% - 32px)"
      overflow="hidden"
    >
      {contacts.map((contact, index) => {
        const empty = !contact.value || contact.value === "0";
        const label = contact.type === "phone" ? "Mobile" : "Email";

        return (
          <Grid item xs={12} sm={6} key={contact.type || index}>
            <Paper
              elevation={0}
              sx={{
                py: 1.5,
                px: 2.5,
                borderRadius: 0,
                borderBottom: {
                  xs: index === 0 ? "1px solid #DCDFE4" : 0,
                  sm: 0,
                },
                borderRight: {
                  xs: 0,
                  sm: index === 0 ? "1px solid #DCDFE4" : 0,
                },
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography
                component="div"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                {contact.type === "email" ? (
                  <EnvelopeSimple size={18} />
                ) : (
                  <DeviceMobile size={18} />
                )}
                {label}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    wordBreak: "break-word",
                  }}
                >
                  {empty ? (
                    <Link
                      component="button"
                      underline="always"
                      fontSize={16}
                      fontWeight={600}
                      onClick={() => onAddContact(contact.type)}
                    >
                      {`Add ${
                        contact.type === "email"
                          ? "Email"
                          : "mobile phone for text messages"
                      }`}
                    </Link>
                  ) : (
                    contact.value
                  )}
                </Typography>

                {!empty && (
                  <Link
                    component="button"
                    underline="always"
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    onClick={() => onAddContact(contact.type)}
                  >
                    {`Edit ${contact.type === "email" ? "Email" : "Mobile"}`}
                  </Link>
                )}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}