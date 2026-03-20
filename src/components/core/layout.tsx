import * as React from "react";

import "@/styles/global.css";
import Providers from "@/state/Provider";
import { ToastContainer } from "react-toastify";

import { UserProvider } from "@/contexts/user-context";

import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";
import ScrollNavButtons from "../ScrollNavButtons/ScrollNavButtons";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <>
      <ToastContainer  autoClose={10000} position="top-right" />
      <LocalizationProvider>
        <ThemeProvider>
          <Providers>
            {/* <RouteLoader /> */}
            {children}
            <ScrollNavButtons/>
          </Providers>
        </ThemeProvider>
      </LocalizationProvider>
    </>
  );
}
