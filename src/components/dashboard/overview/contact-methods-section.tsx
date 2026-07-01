import * as React from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Link,
  Chip,
} from "@mui/material";
import {
  EnvelopeSimple,
  DeviceMobile,
} from "@phosphor-icons/react";

export interface ContactMethod {
  type: "phone" | "email";
  value: string;
  verified: boolean;
}

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
}: ContactMethodsSectionProps): React.JSX.Element {
  return (
    <Grid container border="1px solid #DCDFE4" borderRadius={1} mx={2} width="calc(100% - 32px)" overflow="hidden">
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
                borderRight: index === 0 ? "1px solid #DCDFE4" : 0,
                height: "100%",
              }}
            >
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs>
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "text.secondary",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {contact.type === "email" ? (
                      <EnvelopeSimple size={18} />
                    ) : (
                      <DeviceMobile size={18} />
                    )}

                    {label}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >{empty
                    ?
                    <Link
                      component="button"
                      underline="hover"
                      fontSize={18}
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

                  {!empty &&
                    ((contact.type === "email" && !hasUpdatedEmail) ||
                      contact.verified) && (
                      <Chip
                        label="Verified"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                </Grid>

                <Grid item>
                  <Link
                    component="button"
                    underline="hover"
                    fontSize={18}
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