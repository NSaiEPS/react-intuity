import { Components } from "@mui/material/styles";
import { Theme } from "../types";
import { colors } from "@/utils";

export const MuiTextField: Components<Theme>["MuiTextField"] = {
  styleOverrides: {
    root: {
      "& .MuiInputBase-input::placeholder": {
        color: "gray",
        opacity: 1,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#c4c4c4",
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        transition: "none",
      },
      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.blue,
      },
      // "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      //   borderColor: "red",
      // },
      // "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      //   borderColor: "darkred",
      // },
      // "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      //   borderColor: "red",
      // },
    },
  },
};
