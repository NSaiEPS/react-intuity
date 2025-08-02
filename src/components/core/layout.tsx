import * as React from "react";

import "@/styles/global.css";

import Providers from "@/state/Provider";
import { ToastContainer } from "react-toastify";

import { UserProvider } from "@/contexts/user-context";
import RouteLoader from "@/components/CommonComponents/RouteLoader";
import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <ToastContainer position="top-right" />

        <LocalizationProvider>
          <UserProvider>
            <ThemeProvider>
              <Providers>
                {/* <RouteLoader /> */}

                {children}
              </Providers>
            </ThemeProvider>
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
