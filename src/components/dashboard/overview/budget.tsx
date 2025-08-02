import * as React from "react";
import { useRouter } from "next/navigation"; // Correct hook for App Router

import { getDashboardInfo } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { Button, CardActions } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { CurrencyDollar as CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr/CurrencyDollar";
// import { HandCoins } from '@phosphor-icons/react';
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";

import { paths } from "@/utils/paths";
import { IconCards } from "@/components/dashboard/overview/Icon-cards";

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
  value,
  userInfo = false,
  icons = false,
}: BudgetProps): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch();
  const { dashBoardInfo, dashboardLoader } = useSelector(
    (state: RootState) => state?.DashBoard
  );
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const {
    last_bill,
    acctnum,
    customer_name,
    service_address,
    address,
    email,
    city,
  } = dashBoardInfo?.body?.customer || {};
  const { balance } = dashBoardInfo?.body?.dashboard || {};
  console.log(dashBoardInfo, "dashBoardInfo");
  React.useEffect(() => {
    type IntuityUser = {
      body?: {
        acl_role_id?: string;
        customer_id?: string;
        token?: string;
      };
    };
    const raw = getLocalStorage("intuity-user");

    const stored: IntuityUser | null =
      typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;
    if (!userInfo) {
      dispatch(getDashboardInfo(roleId, userId, token));
    }
  }, []);

  return (
    <Card sx={{ borderRadius: boarderRadius.card, ...sx }}>
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
                <IconCards type={"Headphones"} />
                <IconCards type={"Envelope"} />
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
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  Balance Due
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {/* {last_bill?.balance_due} */}${balance}
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
                <Button
                  onClick={() => {
                    router.push(paths.dashboard.payNow());
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
              </CardActions>
            </Stack>
          </Stack>
        )}
      </CardContent>
      <CustomBackdrop
        open={dashboardLoader || accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Card>
  );
}
