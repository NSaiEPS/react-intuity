import { Components } from "@mui/material/styles";
import { Theme } from "../types";
import { colors } from "@/utils"; // if you're using custom colors

export const MuiInputLabel: Components<Theme>["MuiInputLabel"] = {
  styleOverrides: {
    root: {
      "&.Mui-focused": {
        color: colors.blue, // 👈 label color on focus
      },
    },
  },
};
