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
      "& .MuiOutlinedInput-notchedOutline legend": {
        transition: "none",
      },
      // "&:hover .MuiOutlinedInput-notchedOutline": {
      //   borderColor: "darkred",
      // },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.blue,
      },
    },
    notchedOutline: {
      "& legend": {
        transition: "none",
      },
    },
    input: {
      "&::placeholder": {
        color: "gray",
        opacity: 1,
      },
    },
  },
};

export const MuiInputBase: Components<Theme>["MuiInputBase"] = {
  styleOverrides: {
    input: {
      "&::placeholder": {
        color: "gray",
        opacity: 1,
      },
    },
  },
};
