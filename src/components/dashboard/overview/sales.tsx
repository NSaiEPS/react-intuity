import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getUsageGraph } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colorPalette, colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import { ArrowClockwise as ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import type { ApexOptions } from "apexcharts";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";

import { paths } from "@/utils/paths";
import { Chart } from "@/components/core/chart";

export interface SalesProps {
  chartSeries?: { name: string; data: number[] }[];
  sx?: SxProps;
  path?: string;
  dashboard?: boolean;
}

export function Sales({
  sx,
  path,
  dashboard = false,
}: SalesProps): React.JSX.Element {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:750px)");
  const chartOptions = useChartOptions();
  const input = {
    maxValue: "5900",
    data: [
      {
        categorie: "Jan",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Feb",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Mar",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Apr",
        values: [
          {
            value: "800",
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "May",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Jun",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Jul",
        values: [
          {
            value: "5900",
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Aug",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Sep",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Oct",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Nov",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Dec",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
      {
        categorie: "Jan",
        values: [
          {
            value: 0,
            rate: 2024,
            utility: "gal",
          },
          {
            value: 0,
            rate: "2025",
            utility: "gal",
          },
        ],
      },
    ],
  };
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.usageGraph
  );
  const monthlyUsageUam = useSelector(
    (state: RootState) => state?.DashBoard?.monthlyUsageUam
  );

  const monthlyUsageGraph = useSelector(
    (state: RootState) => state?.DashBoard?.monthlyUsageGraph
  );

  const dashboardLoader = useSelector(
    (state: RootState) => state?.DashBoard?.dashboardLoader
  );
  // const dashBoardInfo = input;

  const ratesSet = new Set<string>();
  const rateToDataMap: Record<string, number[]> = {};

  // First, loop over each month entry
  dashBoardInfo?.usage_history_data?.data.forEach((month) => {
    month.values.forEach((val) => {
      const rate = String(val.rate); // normalize to string
      ratesSet.add(rate);
      if (!rateToDataMap[rate]) {
        rateToDataMap[rate] = [];
      }
      // Push the value (parsed as number) or 0 if missing
      rateToDataMap[rate].push(Number(val.value) || 0);
    });
  });

  // Convert to chartSeries array
  const chartSeries = Array.from(ratesSet).map((rate) => ({
    name: rate,
    data: rateToDataMap[rate],
  }));
  const dispatch = useDispatch();
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  // const raw = getLocalStorage('intuity-user');
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  let roleId = stored?.body?.acl_role_id;
  let userId = stored?.body?.customer_id;
  let token = stored?.body?.token;
  React.useEffect(() => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("utility_type", "WATER");
    formData.append("utility_um", "gallons");
    formData.append("billed_usage", "1");
    formData.append("usage_history", "1");

    dispatch(getUsageGraph(formData, token));
  }, [userInfo]);

  const [barGraphData, setBarGraphData] = React.useState({
    gallons: [],
    dollars: [],
    dates: [],
    colors: [],
  });

  //   secureLocalStorage.setItem('intuity-bar-chart', res?.body?.dashboard);
  // const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.usageGraph);

  // const barData: any = monthlyUsageGraph?.length monthlyUsageGraph?.slice(1);
  // console.log(barData, 'barData');
  const getBarChartData = (barData) => {
    console.log(barData, "dsdsdsdsd");
    const gallons: any[] = [];
    const dollars: any[] = [];
    const dates: string[] = [];
    const colors: string[] = [];

    // if (barData.bar_chart_data) {
    //   Object?.entries(barData.bar_chart_data).forEach(([key, values]) => {
    //     gallons.push(values?.[0]);
    //     dollars.push(values?.[1]);
    //     dates.push(key?.split(',')[0]);
    //   });
    // }
    if (barData) {
      barData.forEach((item, index) => {
        gallons.push(item?.[3]);
        dollars.push("");
        dates.push(item?.[0]);
        colors.push(colorPalette[index]);
      });
    }

    setBarGraphData({ gallons, dollars, dates, colors });
  };

  React.useEffect(() => {
    if (monthlyUsageGraph?.length) {
      getBarChartData(monthlyUsageGraph?.slice(1));
    }
  }, [monthlyUsageGraph]);
  const chartData: any = {
    series: [
      {
        name: "Gallons",
        data: barGraphData.gallons,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 400,
        toolbar: { show: false },
      },
      colors: [...barGraphData.colors], // Orange bars

      plotOptions: {
        bar: {
          columnWidth: "40%",
          distributed: true,
          startingShape: "flat",
          dataLabels: {
            position: "top", // For gallons at the top
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, { dataPointIndex }) {
          let changeval = barGraphData.gallons[dataPointIndex]?.split(" ")[0];
          // return `${changeval} ${monthlyUsageUam}`;
          return `${changeval} ${changeval ? monthlyUsageUam : ""}`;
        },
        offsetY: -25,

        style: {
          fontSize: "14px",
          colors: ["#6b7280"], // gray
        },
      },
      xaxis: {
        categories: [...barGraphData.dates],
        labels: {
          show: true,
          useHTML: true,
          formatter: function (val, index) {
            // console.log('barGraphDatabarGraphData', val, index);
            let Dateindex = barGraphData.dates.indexOf(val);
            let dollar = barGraphData.dollars[Dateindex];
            const dollarVal = barGraphData.dollars[index];
            const isNegative = dollarVal < 0;
            const dollarFormatted = `${isNegative ? "-" : ""}$${Math.abs(
              dollarVal
            ).toFixed(2)}`;
            const date = barGraphData.dates[index];
            // return `${dollarFormatted}\n${date}`;
            // return `$ ${dollar}\n ${index}`;
            const label = `${dollar} `;
            return label;
          },
          style: {
            fontSize: "14px",
            colors: ["#000", "#000", "#000", "#000"], // Black for amount
            fontWeight: 600,
          },
        },
      },
      yaxis: {
        show: false,
      },
      grid: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  return (
    <Card sx={{ borderRadius: boarderRadius.card, ...sx }}>
      <CardHeader
        sx={{ px: isMobile ? 2 : 3, py: isMobile ? 2 : 3 }}
        // avatar={
        //   <Box display="flex" flexDirection="column" alignItems="center">
        //     <Box display="flex" alignItems="center" mb={0.5}>
        //       <Typography variant="body1" mr={1}>
        //         {input.data?.[0]?.values?.[0]?.rate}
        //       </Typography>
        //       <Box width={12} height={20} bgcolor={colors.blue} />
        //     </Box>
        //     <Box display="flex" alignItems="center">
        //       <Typography variant="body1" mr={1}>
        //         {input.data?.[0]?.values?.[1]?.rate}
        //       </Typography>
        //       <Box width={12} height={20} bgcolor={alpha(colors.blue, 0.5)} /> {/* Deep purple */}
        //     </Box>
        //   </Box>
        // }
        action={
          <Box display="flex" flexDirection="row">
            {dashboard && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Typography variant="body1" mr={1}>
                    {
                      dashBoardInfo?.usage_history_data?.data?.[0]?.values?.[0]
                        ?.rate
                    }
                  </Typography>
                  <Box width={12} height={20} bgcolor={colors.blue} />
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" mr={1}>
                    {
                      dashBoardInfo?.usage_history_data?.data?.[0]?.values?.[1]
                        ?.rate
                    }
                  </Typography>
                  <Box
                    width={12}
                    height={20}
                    bgcolor={alpha(colors.blue, 0.5)}
                  />{" "}
                  {/* Deep purple */}
                </Box>
              </Box>
            )}
            <Button
              color="inherit"
              size="small"
              startIcon={
                <ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />
              }
            >
              Sync
            </Button>
          </Box>
        }
        title={
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
            {dashboard ? "Usage" : "Usage / month"}
          </Typography>
        }
      />
      <CardContent sx={{ px: isMobile ? 2 : 3, py: isMobile ? 1.5 : 2.5 }}>
        {dashboard ? (
          <Chart
            height={isMobile ? 240 : 350}
            width="100%"
            options={chartOptions}
            series={chartSeries}
            type="bar"
          />
        ) : (
          <Chart
            key={`${monthlyUsageUam}-${barGraphData.gallons.join("-")}`}
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={400}
          />
        )}
      </CardContent>
      <Divider />

      {path !== "usage-history" && (
        <CardActions
          sx={{
            justifyContent: isMobile ? "center" : "flex-end",
            px: isMobile ? 2 : 3,
            py: 1,
          }}
          onClick={() => navigate(paths.dashboard.usageHistory())}
        >
          <Button
            color="inherit"
            size={isMobile ? "small" : "medium"}
            endIcon={<ArrowRightIcon size={18} />}
          >
            Overview
          </Button>
        </CardActions>
      )}

      <CustomBackdrop
        open={dashboardLoader && !dashboard}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Card>
  );
}

function useChartOptions(): ApexOptions {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: { show: false },
    },
    colors: [colors.blue, alpha(colors.blue, 0.5)],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: "solid" },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: {
      bar: {
        columnWidth: "45%",
      },
    },
    stroke: { colors: ["transparent"], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      labels: {
        rotate: -45,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 0 ? `${value} gal` : `${value}`),
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: "11px",
        },
      },
    },
    responsive: [
      {
        breakpoint: 750,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "60%",
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              style: {
                fontSize: "10px",
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                fontSize: "10px",
              },
            },
          },
        },
      },
    ],
  };
}
