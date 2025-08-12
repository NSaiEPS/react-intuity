import type { Components } from "@mui/material/styles";

import type { Theme } from "../types";
import { colors } from "@/utils";

export const MuiButton = {
  styleOverrides: {
    root: { borderRadius: "12px", textTransform: "none" },
    sizeSmall: { padding: "6px 16px" },
    sizeMedium: { padding: "8px 20px" },
    sizeLarge: { padding: "11px 24px" },
    textSizeSmall: { padding: "7px 12px" },
    textSizeMedium: { padding: "9px 16px" },
    textSizeLarge: { padding: "12px 16px" },
    outlined: {
      borderColor: colors.darkBlue, // default border color
      color: colors.darkBlue,
      "&:hover": {
        borderColor: colors.blue, // border color on hover
      },
    },
  },
} satisfies Components<Theme>["MuiButton"];
