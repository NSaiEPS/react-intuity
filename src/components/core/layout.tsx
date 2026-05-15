import * as React from "react";

import "@/styles/global.css";
import Providers from "@/state/Provider";
import CustomAlertModal from "@/components/CommonComponents/CustomAlertModal";
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
      <CustomAlertModal />
      <ToastContainer autoClose={13000} position="top-center" 
       style={{ top: "50px",  maxWidth: "90vw" ,
    left: "50%",
    transform: "translateX(-50%)",

       }}

      />
      <LocalizationProvider>
        <ThemeProvider>
          <Providers>
            {/* <RouteLoader /> */}
            {children}
            {/* <ScrollNavButtons/> */}
          </Providers>
        </ThemeProvider>
      </LocalizationProvider>
    </>
  );
}
