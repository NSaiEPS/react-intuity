import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import { CardHeader, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

function Header({ title }: { title: string }): React.JSX.Element {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  return (
    <Grid container spacing={2} justifyContent="space-between">
      <CardHeader
        title={
          <Typography ml={1} variant="h5">
            {title}
          </Typography>
        }
      />

      <CardHeader
        subheader={
          <Typography variant="h6">
            Name :{CustomerInfo?.customer_name}
          </Typography>
        }
        title={
          <Typography variant="h6">
            Account No :{CustomerInfo?.acctnum}
          </Typography>
        }
      />
    </Grid>
  );
}

export default Header;
