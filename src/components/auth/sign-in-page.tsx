import * as React from "react";
import Box from "@mui/material/Box";

// ✅ removed react-helmet (causes extra render cycle)
// use plain document.title instead

import CompanyDetails from "./company-details";
import MainSection from "./register-slag";


export function SignInPage({ title }): React.JSX.Element {
  // ✅ set title without react-helmet overhead
  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <Box sx={{ marginTop: 1 }}>
        <MainSection />
      </Box>
      <Box>
        <CompanyDetails />
      </Box>
    </Box>
  );
}