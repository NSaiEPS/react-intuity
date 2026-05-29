import * as React from "react";
import { useNavigate } from "react-router-dom"; // Correct hook for App Router

import { RootState } from "@/state/store";
import { boarderRadius, formatToMMDDYYYY } from "@/utils";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { IconCards } from "@/components/dashboard/overview/Icon-cards";

import { paths } from "@/utils/paths";
import { Button } from "@mui/material";
import { getCompanyDetailsApi } from "@/api/dashboard";

export interface TotalProfitProps {
  sx?: SxProps;
  value?: string;
}

export function TotalProfit({
  value,
  sx,
}: TotalProfitProps): React.JSX.Element {
  const navigate = useNavigate(); // Use the hook from next/navigation
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const { next_bill_days, next_bill } = dashBoardInfo?.body?.customer || {};

   const [companyDetails, setCompanyDetails] = React.useState({
    phone: "+12345678900",
    email: "info@intuity.com",
    website: "",
  });

  React.useEffect(() => {
    const pathParts = location.pathname.split("/");

    // cape-royale1 from /cape-royale1/dashboard
    const slug = pathParts?.[1];

    if (!slug) return;

    const fetchCompanyDetails = async () => {
      try {
        const formData = new FormData();
        formData.append("alias", slug);

        const response = await getCompanyDetailsApi({ formData });

        if (response?.status) {
          const company = response?.body?.company;

          setCompanyDetails({
            phone: company?.phone || "+12345678900",
            email: company?.email || "info@intuity.com",
            website: company?.company_website_URL || "",
          });
        }
      } catch (error) {
        console.log("Company details error", error);
      }
    };

    fetchCompanyDetails();
  }, [location.pathname]);

  return (
    <Card
      onClick={() => {
        if (value === "history") {
          navigate(paths.dashboard.usageHistory());
        }
      }}
      elevation={0}
      sx={{
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
      }}
    >
      <CardContent sx={{ flex: 1, width: "100%" }}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {value === "BillDue"
              ? "Bill Due Date"
              : value === "CustomerService"
              ? "Customer Service"
              : "Remaining days until late fees or penalties may be assessed"}
          </Typography>

         {value === "CustomerService" ? (
  <Stack spacing={2} alignItems="center">
    
    {/* PHONE + EMAIL SAME LINE */}
    <Stack direction="row" spacing={2}>
      <Button
        startIcon={<IconCards type={"Headphones"} />}
        component="a"
        href={`tel:${companyDetails.phone}`}
        sx={{
          textTransform: "none",
          color: "black",
        }}
      >
        Call
      </Button>

      <Button
        startIcon={<IconCards type={"Envelope"} />}
        component="a"
        href={`mailto:${companyDetails.email}`}
        sx={{
          textTransform: "none",
          color: "black",
        }}
      >
        Email
      </Button>
    </Stack>

    {/* WEBSITE CENTER BELOW */}
    {companyDetails.website && (
      <Button
        startIcon={<IconCards type={"Website"} />}
        component="a"
        href={companyDetails.website}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          textTransform: "none",
          color: "black",
        }}
      >
        Website
      </Button>
    )}
  </Stack>
) : (
  <Typography variant="h3" fontWeight={700} mt={"auto"}>
    {value === "BillDue"
      ? formatToMMDDYYYY(next_bill)
      : next_bill_days}
  </Typography>
)}
        </Stack>
      </CardContent>
    </Card>
  );
}
