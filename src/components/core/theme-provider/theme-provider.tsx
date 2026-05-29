import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";

import { createTheme } from "@/styles/theme/create-theme";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// import EmotionCache from './emotion-cache';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

// Created once at module load — never recreated on re-renders
const _theme = createTheme();
const _emotionCache = createCache({ key: "mui", prepend: true });

export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  return (
    <CacheProvider value={_emotionCache}>
      <CssVarsProvider theme={_theme}>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </CacheProvider>
  );
}
