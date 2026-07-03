import { RootState } from "@/state/store";
import { CustomerInfo } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { CardHeader, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

interface HeaderProps {
  title: string;
  description?: string;
  fontWeight?: React.CSSProperties["fontWeight"];
}

function Header({
  title,
  description,
  fontWeight,
}: HeaderProps): React.JSX.Element {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const customerInfo: CustomerInfo = dashBoardInfo?.customer
    ? dashBoardInfo.customer
    : getLocalStorage("intuity-customerInfo");

  return (
    <Grid container spacing={2} justifyContent="space-between">
      <CardHeader
        title={
          <Typography ml={1} variant="h5" fontWeight={fontWeight}>
            {title}
          </Typography>
        }
        subheader={
          description ? (
            <Typography ml={1} variant="h6">
              {description}
            </Typography>
          ) : undefined
        }
      />

      <CardHeader
        subheader={
          <Typography ml={1} variant="h6" textAlign="left">
            Name: {customerInfo?.customer_name}
          </Typography>
        }
        title={
          <Typography ml={1} variant="h6" textAlign="left">
            Account No: {customerInfo?.acctnum}
          </Typography>
        }
      />
    </Grid>
  );
}

export default Header;