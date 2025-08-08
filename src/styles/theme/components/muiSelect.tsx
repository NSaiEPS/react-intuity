import { Components } from "@mui/material/styles";
import { Theme } from "../types";
import { colors } from "@/utils";

export const MuiSelect: Components<Theme>["MuiSelect"] = {
  styleOverrides: {
    root: {
      //   "& .MuiOutlinedInput-notchedOutline": {
      //     borderColor: colors.blue,
      //   },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.blue,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.blue,
      },
    },
  },
};
