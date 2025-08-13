import { Components } from "@mui/material/styles";
import { Theme } from "../types";

export const MuiTextField: Components<Theme>["MuiTextField"] = {
  styleOverrides: {
    root: {
      "& .MuiInputBase-input::placeholder": {
        color: "green",
        opacity: 1,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#c4c4c4",
      },
      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0066ff", // your theme blue
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
