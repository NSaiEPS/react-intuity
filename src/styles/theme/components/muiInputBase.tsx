// theme/components/MuiInputBase.ts
import { Components } from "@mui/material/styles";
import { Theme } from "../types"; // or use Theme from MUI directly

export const MuiInputBase: Components<Theme>["MuiInputBase"] = {
  styleOverrides: {
    input: {
      "&::placeholder": {
        color: "green",
        opacity: 1,
      },
    },
  },
};
