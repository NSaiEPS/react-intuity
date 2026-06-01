import * as React from "react";
import Box from "@mui/material/Box";

// ✅ removed react-helmet (causes extra render cycle)
// use plain document.title instead

import CompanyDetails from "./company-details";
import MainSection from "./register-slag";


export function SignInPage(): React.JSX.Element {
  // Title is managed by MainSection (register-slag) via useLayoutEffect
  // based on the current pathname — no override needed here.

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