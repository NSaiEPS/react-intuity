// theme/components/MuiOutlinedInput.ts
import { Components } from "@mui/material/styles";
import { Theme } from "../types"; // or use MUI's Theme directly
import { colors } from "@/utils";

export const MuiOutlinedInput: Components<Theme>["MuiOutlinedInput"] = {
  styleOverrides: {
    root: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#c4c4c4",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.blue,
      },
    },
    input: {
      "&::placeholder": {
        color: "green",
        opacity: 1,
      },
    },
  },
};
