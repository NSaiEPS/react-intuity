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
  console.log(contacts, "contacts");

  return (
    <Grid container border="1px solid #DCDFE4" borderRadius={1} mx={2} mt={2} width="calc(100% - 32px)" overflow="hidden">
      {contacts.map((contact, index) => {
        const empty = !contact.value || contact.value === "0";
        const label = contact.type === "phone" ? "Mobile" : "Email";

        return (
          <Grid item xs={12} md={6} >
            <Paper
              // variant="outlined"
              sx={{
                py: 1.5,
                px: 2.5,
                borderRadius: 0,
                borderBottom: {
                  xs: index === 0 ? "1px solid #DCDFE4" : 0,
                  md: 0,
                },
                borderRight: {
                  xs: 0,
                  md: index === 0 ? "1px solid #DCDFE4" : 0,
                },
                height: "100%",
              }}
            >
              <Grid
                container
                justifyContent="space-between"
                alignItems="end"
                height={"stretch"}
              >
                <Grid item xs sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "stretch" }} >
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
                      mb: '5px'
                    }}
                  >
                    {contact.type === "email" ? (
                      <EnvelopeSimple size={18} />
                    ) : (
                      <DeviceMobile size={18} />
                    )}

                    {label}

                    {/* {!empty && (
                      ((contact.type === "email" && !hasUpdatedEmail) ||
                        contact.verified) ? (
                        <Chip
                          label="Verified"
                          color="success"
                          size="small"
                          sx={{ fontSize: 10 }}
                        />
                      ) : (
                        <Box display="inline-flex" alignItems="center" gap={1}>
                          <Chip
                            label="Not Verified"
                            color="warning"
                            size="small"
                            sx={{ fontSize: 10 }}
                          />
                          {contact.type === "email" && (
                            <>
                              <Tooltip
                                title="Before you can set your preference to receive notifications by email, you must verify your email address."
                                arrow
                                componentsProps={tooltipSlotProps}
                              >
                                <IconButton size="small" sx={{ p: 0.25 }}>
                                  <Question size={18} color="#90caf9" weight="fill" />
                                </IconButton>
                              </Tooltip>
                              <Button
                                variant="outlined"
                                onClick={() => onResendVerification(contact.value)}
                                startIcon={<ArrowClockwise size={16} />}
                                sx={{
                                  borderRadius: "100px",
                                  textTransform: "none",
                                  borderColor: "#0B355B",
                                  color: "#0B355B",
                                  fontWeight: 600,
                                  fontSize: "13px",
                                  py: 0.25,
                                  px: 1.5,
                                  minWidth: "auto",
                                  height: "28px",
                                  "& .MuiButton-startIcon": {
                                    marginRight: "4px",
                                    marginLeft: "-4px",
                                  },
                                  "&:hover": {
                                    borderColor: "#07233c",
                                    backgroundColor: "rgba(11, 53, 91, 0.04)",
                                  },
                                }}
                              >
                                Resend
                              </Button>
                            </>
                          )}
                        </Box>
                      )
                    )} */}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >{empty
                    ?
                    <Link
                      component="button"
                      underline="always"
                      fontSize={16}
                      onClick={() =>
                        onAddContact(contact.type)
                      }
                    >
                      {`Add ${contact.type === "email"
                        ? "Email"
                        : "mobile phone for text messages"
                        }`}
                    </Link>
                    : (
                      contact.value
                    )}
                  </Typography>
                </Grid>

                <Grid item>
                  <Link
                    component="button"
                    underline="always"
                    fontSize={16}
                    fontWeight={600}
                    onClick={() =>
                      onAddContact(contact.type)
                    }
                  >
                    {!empty && `Edit ${contact.type === "email"
                      ? "Email"
                      : "Mobile"
                      }`}
                  </Link>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </Grid >
  );
}