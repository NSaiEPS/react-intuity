import * as React from "react";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import { ArrowClockwise, Plus, Trash } from "@phosphor-icons/react";

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
  onResendVerification,
  onRemovePhone,
}: ContactMethodsSectionProps): React.JSX.Element {
  console.log(contacts,"contacts");
  
  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Your Contact Information
      </Typography>
      {contacts.map((contact) => (
        <>
        
        {console.log(contact, "2222")}
        
        <Grid container key={contact.value} alignItems="center" justifyContent="space-between" mb={1}>
          <Grid item>
            <Typography sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "1.5rem" }}>{contact.type === "phone" ? "📱" : "📧"}</span>
              {
              !contact?.value 
              //  contact?.value === "0" || 
              //  contact?.verified === false
                ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  {contact.type === "phone"
                    ? "Number is not available, Please Add."
                    : "Email is not available, Please Add."}
                </Typography>
              ) : (
                contact.value
              )}
            </Typography>
          </Grid>
          <Grid item display="flex" alignItems="center" justifyContent="flex-start" gap={1}>
            {
            !contact?.value  
            // contact?.value == "0" || 
            // contact?.verified === false
             ?  (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => onAddContact(contact.type)}
              >
                Add
              </Button>
            ) : contact.type === "email" && !hasUpdatedEmail ? (
              <Chip label="Verified" color="success" size="small" />
            ) : contact.verified ? (
              <Chip label="Verified" color="success" size="small" />
            ) : (
              <>
                <Chip label="Not Verified" color="warning" size="small" />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ArrowClockwise size={16} />}
                  onClick={() => onResendVerification(contact.value)}
                >
                  Resend
                </Button>
              </>
            )}
            {contact.type === "phone" && contact.value && contact.value !== "0" && (
              <Button
                color="error"
                size="small"
                variant="outlined"
                startIcon={<Trash size={18} />}
                onClick={onRemovePhone}
                sx={{
                  borderColor: "error.main",
                  color: "error.main",
                  "& .MuiButton-startIcon svg": { color: "currentColor" },
                }}
              >
                Remove
              </Button>
            )}
          </Grid>
        </Grid>
        </>
      ))}
    </Box>
  );
}
