import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import GlobalStyles from "@mui/material/GlobalStyles";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MainNav } from "@/components/dashboard/layout/main-nav";
import { SideNav } from "@/components/dashboard/layout/side-nav";
import { Outlet } from "react-router";
import { LoadingProvider } from "@/components/core/LoadingProvider";

export default function DashboardLayout(): React.JSX.Element {
  console.log("DashboardLayout rendered");

  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          body: {
            "--MainNav-height": "64px",
            "--MainNav-zIndex": 1000,
            "--SideNav-width": "280px",
            "--SideNav-zIndex": 1100,
            "--MobileNav-width": "320px",
            "--MobileNav-zIndex": 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: "var(--mui-palette-background-default)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "100%",
        }}
      >
        <SideNav />
        <MainNav />

        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            pl: { lg: "var(--SideNav-width)" },
          }}
        >
          <main>
            <Container maxWidth="xl" sx={{ py: "64px", pt: "18px" }}>
              {/* {children} */}
              <LoadingProvider>
                <Outlet />
              </LoadingProvider>
            </Container>
          </main>
        </Box>
      </Box>
    </AuthGuard>
  );
}
