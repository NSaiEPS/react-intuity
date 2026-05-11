import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";

interface HeaderSectionProps {
  customerDetails?: {
    company_website?: string;
    company_phone?: string;
    company_email?: string;
  };
}


/* WEBSITE ICON */
const WebsiteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"  display = "flex" justify-content = "start" text-align = "start"  >
    <path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke="#4a90a4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke="#4a90a4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* PHONE ICON */
const PhoneSvgIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" display = "flex" justify-content = "start" text-align = "start">
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"
      stroke="#4a90a4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* EMAIL ICON */
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" display = "flex" justify-content = "start" text-align = "start">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="#4a90a4"
      strokeWidth="2"
    />
    <path
      d="M2 12h4M18 12h4M12 2v4M12 18v4"
      stroke="#4a90a4"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const HeaderSectionReact: React.FC<HeaderSectionProps> = ({
    customerDetails,

}) => {
    {console.log("customerDetails" , customerDetails);
}
  return (
    <Grid
      container
      sx={{
        borderBottom: "1px solid #ccc",
        pt: 0.5,
        pb: 0.5,
        mb: 1,
        width: "100%",
      }}
    >
      {/* WEBSITE */}
      <Grid
        item
        xs={4}
        sx={{
          px: 1,
          borderRight: "1px solid #ccc",
          minWidth: 0,
        }}
      >
        <Box mb={0.4}>
          <WebsiteIcon />
        </Box>

        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: 1.4,
            wordBreak: "break-word",
            display: "flex",
            justifyContent: "start",
            textAlign: "start",
            flexDirection: "column"
          }}
        >
          {customerDetails?.company_website ?? ""}
        </Typography>
      </Grid>

      {/* PHONE */}
      <Grid
        item
        xs={4}
        sx={{
          px: 1,
          borderRight: "1px solid #ccc",
          minWidth: 0,
        }}
      >
        <Box mb={0.4}>
          <PhoneSvgIcon />
        </Box>

        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: 1.4,
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            display: "flex",
            justifyContent: "start",
            textAlign: "start",
            flexDirection: "column"
            
            
          }}
        >
          {customerDetails?.company_phone ?? ""}
          {"\n"}
          Office Hours
          {"\n"}
          Mon - Fri 9 AM - 4 PM
        </Typography>
      </Grid>

      {/* EMAIL */}
      <Grid
        item
        xs={4}
        sx={{
          px: 1,
          minWidth: 0,
        }}
      >
        <Box mb={0.4}>
          <EmailIcon />
        </Box>

        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: 1.4,
            wordBreak: "break-word",
            display: "flex",
            justifyContent: "start",
            textAlign: "start",
            flexDirection: "column"
          }}
        >
          {customerDetails?.company_email ?? ""}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default HeaderSectionReact;