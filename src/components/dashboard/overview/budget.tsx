import * as React from "react";
import { useNavigate } from "react-router-dom"; // Correct hook for App Router

import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { Box, Button, CardActions } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { CurrencyDollar as CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr/CurrencyDollar";
// import { HandCoins } from '@phosphor-icons/react';
import { useSelector } from "@/hooks/redux";
import DOMPurify from "dompurify";

import { paths } from "@/utils/paths";
import { IconCards } from '@/components/dashboard/overview/IconCards';
import { formatCurrency } from "@/utils/formatters";


export interface BudgetProps {
  diff?: number;
  trend?: "up" | "down";
  sx?: SxProps;
  value?: string;
  userInfo?: boolean;
  icons?: boolean;
}

export function Budget({
  sx,
  userInfo = false,
  icons = false,
}: BudgetProps): React.JSX.Element {
  const navigate = useNavigate();
  const { dashBoardInfo } = useSelector(
    (state: RootState) => state?.DashBoard
  );

  const homeData = dashBoardInfo?.body || dashBoardInfo || {};
  const {
    acctnum,
    customer_name,
    service_address,
    address,
    email,
    city,
  } = homeData?.customer || {};
  const { balance } = homeData?.dashboard || {};
  const company = homeData?.company;
  const customer = homeData?.customer;
  const last_bill = homeData?.last_bill;
  const blockText = homeData?.block_individual_customer_payment_text;
  const paymentUrl = homeData?.payment_url || import.meta.env.VITE_PAYMENT_URL || "";

  const rawHTML =
    company?.optional_instructions ??
    `<p><a href="${paymentUrl}">${paymentUrl}</a></p>`;

  const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
    ADD_ATTR: ["target", "rel"],
  });

  const finalHTML = sanitizedHTML.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  );


  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: boarderRadius.card,
        backgroundColor: "#fff",
        border: "1px solid #EAEAEA",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
        ...sx,
      }}
    >
      <CardContent>
        {userInfo ? (
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
              spacing={1.5}
            >
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={600}>
                  {acctnum ?? ""} {customer_name ?? ""}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Service Address: {service_address ?? ""}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Billing address: {address ?? ""} {city ?? ""}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {email ?? ""}
                </Typography>
              </Stack>
            </Stack>
            {icons && (
              <Stack direction="row" spacing={2} ml={"auto"}>
                <IconCards
                  type={"Headphones"}
                  href={company?.phone ? `tel:${company.phone}` : undefined}
                />
                <IconCards
                  type={"Envelope"}
                  href={company?.email ? `mailto:${company.email}` : undefined}
                />
              </Stack>
            )}
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
              spacing={1.5}
            >
              <Stack spacing={1}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Balance Due
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {/* {last_bill?.balance_due} */}{formatCurrency(balance)}
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <Avatar
                  sx={{
                    backgroundColor: colors.blue,

                    height: "56px",
                    width: "56px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />
                </Avatar>
              </Stack>
            </Stack>
            <Stack>
              <CardActions
                sx={{
                  p: 0,
                }}
              >
                {company?.allow_payments == 0 ? (
                  <Box
                    className="instructions-html"
                    sx={{ color: "red", "& a": { color: "red !important", textDecoration: "none" } }}
                    dangerouslySetInnerHTML={{ __html: finalHTML }}
                  />
                ) : customer?.is_payments_blocked == 1 ? (
                  <Typography variant="body2" mt={1} color="red" fontWeight="bold">
                    {blockText ?? "Payments are not allowed at this time"}
                  </Typography>
                ) : (
                  <Button
                    onClick={() => {
                      navigate(paths.dashboard.lastBill());
                    }}
                    sx={{
                      width: "100%",

                      backgroundColor: colors.blue,
                      "&:hover": {
                        backgroundColor: colors["blue.3"], // or any other hover color
                      },
                    }}
                    variant="contained"
                  >
                    PAY NOW
                  </Button>
                )}
              </CardActions>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
