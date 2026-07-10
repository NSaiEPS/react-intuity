import * as React from "react";
import { useNavigate } from "react-router-dom";

import { RootState } from "@/state/store";
import { boarderRadius, formatToMMDDYYYY } from "@/utils";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { IconCards } from '@/components/dashboard/overview/IconCards';


import { paths } from "@/utils/paths";
import { Button } from "@mui/material";

import { getLocalStorage } from "@/utils/auth";

interface AliasUser {
  phone: string;
  email: string;
  company_website_URL: string;
}

export interface TotalProfitProps {
  sx?: SxProps;
  value?: string;
}

export function TotalProfit({
  value,
  sx,
}: TotalProfitProps): React.JSX.Element {
  const aliasUser: AliasUser | null = getLocalStorage("alias-details") as AliasUser | null;

  const navigate = useNavigate();
  const { dashBoardInfo } = useSelector(
    (state: RootState) => state?.DashBoard
  );

  const { due_date } = dashBoardInfo?.body?.customer?.last_bill || {};
  const { balance } = dashBoardInfo?.body?.dashboard || {};

  const [companyDetails, setCompanyDetails] = React.useState({
    phone: "+12345678900",
    email: "info@intuity.com",
    website: "www.intuity.com",
  });

  React.useEffect(() => {
    setCompanyDetails({
      phone: aliasUser?.phone || "+12345678900",
      email: aliasUser?.email || "info@intuity.com",
      website: aliasUser?.company_website_URL || "www.intuity.com",
    });
  }, [aliasUser?.phone, aliasUser?.email, aliasUser?.company_website_URL]);

  const cardSx: SxProps = {
    ...sx,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderRadius: boarderRadius.card,
    padding: 2,
    paddingTop: 1,
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
    backgroundColor: "#fff",
    border: "1px solid #EAEAEA",
  };

  return (
    <Card
      onClick={() => {
        if (value === "history") {
          navigate(paths.dashboard.usageHistory());
        }
      }}
      elevation={0}
      sx={cardSx}
    >
      <CardContent sx={{ flex: 1, width: "100%" }}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            {value === "BillDue"
              ? "Bill Due Date"
              : value === "CustomerService"
                ? "Customer Service"
                : "Remaining days until late fees or penalties may be assessed"}
          </Typography>

          {value === "CustomerService" ? (
            <Stack spacing={2} alignItems="center">
              {/* Phone + Email on same row */}
              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={<IconCards type={"Headphones"} />}
                  component="a"
                  href={`tel:${companyDetails.phone}`}
                  sx={{ textTransform: "none", color: "black" }}
                >
                  Call
                </Button>

                <Button
                  startIcon={<IconCards type={"Envelope"} />}
                  component="a"
                  href={`mailto:${companyDetails.email}`}
                  sx={{ textTransform: "none", color: "black" }}
                >
                  Email
                </Button>
              </Stack>

              {/* Website below */}
              {companyDetails.website && (
                <Button
                  startIcon={<IconCards type={"Website"} />}
                  component="a"
                  href={companyDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none", color: "black" }}
                >
                  Website
                </Button>
              )}
            </Stack>
          ) : (
            <Typography variant="h4" fontWeight={700} mt="auto">
              {balance > 0 ? formatToMMDDYYYY(due_date, false, true) ?? "-" : "-"}

            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
