// components/checkbox.ts
import { Components } from "@mui/material/styles";
import { Theme } from "../types";
import { colors } from "@/utils";

export const MuiCheckbox: Components<Theme>["MuiCheckbox"] = {
  styleOverrides: {
    root: {
      color: colors.blue,
      "&.Mui-checked": {
        color: colors.blue,
      },
    },
  },
};
