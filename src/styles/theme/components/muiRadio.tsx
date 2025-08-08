// components/radio.ts
import { Components } from "@mui/material/styles";
import { Theme } from "../types";
import { colors } from "@/utils";

export const MuiRadio: Components<Theme>["MuiRadio"] = {
  styleOverrides: {
    root: {
      color: colors.blue,
      "&.Mui-checked": {
        color: colors.blue,
      },
    },
  },
};
