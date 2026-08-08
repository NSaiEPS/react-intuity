import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getUsageGraph } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colorPalette, colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import { ArrowClockwise as ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Download as DownloadIcon } from "@phosphor-icons/react";
import type { ApexOptions } from "apexcharts";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";
import { paths } from "@/utils/paths";
import { Chart } from "@/components/core/chart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";



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
  const chartRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:750px)");
  const chartOptions = useChartOptions();
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.usageGraph
  );
  const monthlyUsageUam = useSelector(
    (state: RootState) => state?.DashBoard?.monthlyUsageUam
  );

  const monthlyUsageGraph = useSelector(
    (state: RootState) => state?.DashBoard?.monthlyUsageGraph
  );

  const dashboardLoading = useSelector(
    (state: RootState) => state?.DashBoard?.dashboardLoading
  );
  // const dashBoardInfo = input;

  // const meterOptions = [
  //   {
  //     id: "1",
  //     label: "Meter # 10023456",
  //   },
  //   {
  //     id: "2",
  //     label: "Meter # 10023457",
  //   },
  //   {
  //     id: "3",
  //     label: "Meter # 10023458",
  //   },
  // ];

  const handleDownloadPdf = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg");

    const pdf = new jsPDF("landscape", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "JPEG",
      10,
      10,
      imgWidth,
      imgHeight
    );

    pdf.save("Usage-Month-Graph.pdf");
  };

  const [selectedMeter, setSelectedMeter] = React.useState(
    dashBoardInfo?.meters?.length ? dashBoardInfo?.meters[0]?.id : ""
  );

  const ratesSet = new Set<string>();
  const rateToDataMap: Record<string, number[]> = {};

  // First, loop over each month entry
  dashBoardInfo?.usage_history_data?.data?.forEach((month) => {
    month?.values?.forEach((val) => {
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
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const stored: IntuityUser | null = React.useMemo(() => {
    const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  }, [userInfo]);

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const handleMeterChange = (meterId: string) => {
    setSelectedMeter(meterId);
    if (!roleId || !userId) return;
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    if (meterId) {
      formData.append("meter_id", meterId);
    }
    formData.append("utility_type", "WATER");
    formData.append("utility_um", "gallons");
    formData.append("billed_usage", "1");
    formData.append("usage_history", "1");

    dispatch(getUsageGraph(formData));
  };

  React.useEffect(() => {
    if (!roleId || !userId) return;
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    if (selectedMeter) {
      formData.append("meter_id", selectedMeter);
    }
    formData.append("utility_type", "WATER");
    formData.append("utility_um", "gallons");
    formData.append("billed_usage", "1");
    formData.append("usage_history", "1");

    dispatch(getUsageGraph(formData));
  }, [userId]);

  const [barGraphData, setBarGraphData] = React.useState({
    gallons: [],
    dollars: [],
    dates: [],
    colors: [],
  });

  //   secureLocalStorage.setItem('intuity-bar-chart', res?.body?.dashboard);
  // const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.usageGraph);

  // const barData = monthlyUsageGraph?.length monthlyUsageGraph?.slice(1);
  // //console.log(barData, 'barData');
  const getBarChartData = (barData) => {
    const gallons: string[] = [];
    const dollars: string[] = [];
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
        const dateStr = item?.[0] ?? "";
        if (dateStr.toLowerCase().includes("no data")) return;
        gallons.push(item?.[3] ?? "0");
        dollars.push("");
        dates.push(dateStr);
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

  const hasDashboardData = React.useMemo(() => {
    if (!chartSeries || chartSeries.length === 0) return false;
    return chartSeries.some(
      (s) => s.data && s.data.length > 0 && s.data.some((val) => Number(val) > 0)
    );
  }, [chartSeries]);

  const hasMonthlyData = React.useMemo(() => {
    if (!barGraphData.gallons || barGraphData.gallons.length === 0) return false;
    return barGraphData.gallons.some((val) => {
      if (!val) return false;
      const num = parseFloat(String(val));
      return !isNaN(num) && num > 0;
    });
  }, [barGraphData.gallons]);

  const numericGallons = React.useMemo(() => {
    return (barGraphData.gallons || []).map((v) => {
      if (typeof v === "number") return v;
      const parsed = parseFloat(String(v).replace(/,/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    });
  }, [barGraphData.gallons]);

  const yAxisBounds = React.useMemo(() => {
    const valid = numericGallons.filter((v) => typeof v === "number" && !isNaN(v) && v > 0);
    if (!valid.length) return { min: 0, max: 1000, tickAmount: 4 };
    const minVal = Math.min(...valid);
    const maxVal = Math.max(...valid);

    if (minVal === maxVal) {
      const min = Math.max(0, Math.floor(minVal * 0.8));
      const max = Math.ceil(maxVal * 1.2) || 100;
      return { min, max, tickAmount: 4 };
    }

    const range = maxVal - minVal;
    const rawStep = range / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
    const residual = rawStep / magnitude;
    let niceResidual = 10;
    if (residual <= 1) niceResidual = 1;
    else if (residual <= 2) niceResidual = 2;
    else if (residual <= 2.5) niceResidual = 2.5;
    else if (residual <= 5) niceResidual = 5;

    const step = niceResidual * magnitude;
    let min = Math.floor(minVal / step) * step;
    let max = Math.ceil(maxVal / step) * step;

    // Ensure min is strictly less than minVal so the smallest data bar is always clearly visible
    if (min >= minVal || minVal - min < step * 0.5) {
      min = Math.max(0, min - step);
    }

    if (max <= min) max = min + step * 4;

    const tickAmount = Math.max(1, Math.round((max - min) / step));
    return { min, max, tickAmount };
  }, [numericGallons]);

  const mappedGallons = React.useMemo(() => {
    const min = yAxisBounds.min;
    const step = (yAxisBounds.max - yAxisBounds.min) / (yAxisBounds.tickAmount || 4);
    const baselineOffset = step * 0.10;
    return numericGallons.map((v) => {
      const num = Number(v) || 0;
      if (num <= 0) {
        return min + baselineOffset;
      }
      return num;
    });
  }, [numericGallons, yAxisBounds]);

  const chartData: any = {
    series: [
      {
        name: "Usage",
        data: mappedGallons,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 400,
        toolbar: { show: false },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
      },
      noData: {
        text: "No data for this period",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
        style: {
          color: "#6b7280",
          fontSize: "14px",
        },
      },
      colors: barGraphData.colors?.length ? [...barGraphData.colors] : ["#f97316"],

      plotOptions: {
        bar: {
          columnWidth: "40%",
          distributed: true,
          startingShape: "flat",
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (_val: any, opts: any) {
          const index = opts?.dataPointIndex;
          const rawVal = numericGallons[index];
          const num = Number(rawVal) || 0;
          if (num <= 0) {
            return `0 ${monthlyUsageUam || "Gallon"}`;
          }
          return `${num.toLocaleString()} ${monthlyUsageUam || "Gallon"}`;
        },
        offsetY: 15,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: [
            function (opts: any) {
              const index = opts?.dataPointIndex;
              const rawVal = numericGallons[index];
              const num = Number(rawVal) || 0;
              if (num <= 0) return "#374151";
              return "#ffffff";
            },
          ],
        },
      },
      xaxis: {
        categories: [...barGraphData.dates],
        axisBorder: { show: true },
        axisTicks: { show: true },
        labels: {
          show: true,
          rotate: 0,
          rotateAlways: false,
          style: {
            fontSize: "12px",
            fontWeight: 600,
          },
        },
      },
      yaxis: {
        show: true,
        min: yAxisBounds.min,
        max: yAxisBounds.max,
        tickAmount: yAxisBounds.tickAmount,
        title: {
          text: monthlyUsageUam || "Gallon",
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: function (val: number) {
            return typeof val === "number" ? val.toLocaleString() : `${val}`;
          },
          style: {
            fontSize: "11px",
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#e5e7eb",
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (_val: number, opts: any) => {
            const index = opts?.dataPointIndex;
            const rawVal = numericGallons[index];
            const num = Number(rawVal) || 0;
            return `${num.toLocaleString()} ${monthlyUsageUam || "Gallon"}`;
          },
        },
      },
    },
  };
  return (
    <Card sx={{ borderRadius: 0, ...sx }}>
      <CardHeader
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 3,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          "& .MuiCardHeader-content": {
            minWidth: 0,
          },
          "& .MuiCardHeader-action": {
            width: isMobile ? "100%" : "auto",
            margin: isMobile ? "12px 0 0 0" : "-4px -8px 0 0",
            alignSelf: isMobile ? "stretch" : "flex-start",
          },
        }}
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
        // action={
        //   <Box display="flex" flexDirection="row">
        //     {dashboard && (
        //       <Box display="flex" flexDirection="column" alignItems="center">
        //         <Box display="flex" alignItems="center" mb={0.5}>
        //           <Typography variant="body1" mr={1}>
        //             {
        //               dashBoardInfo?.usage_history_data?.data?.[0]?.values?.[0]
        //                 ?.rate
        //             }
        //           </Typography>
        //           <Box width={12} height={20} bgcolor={colors.blue} />
        //         </Box>
        //         <Box display="flex" alignItems="center">
        //           <Typography variant="body1" mr={1}>
        //             {
        //               dashBoardInfo?.usage_history_data?.data?.[0]?.values?.[1]
        //                 ?.rate
        //             }
        //           </Typography>
        //           <Box
        //             width={12}
        //             height={20}
        //             bgcolor={alpha(colors.blue, 0.5)}
        //           />{" "}
        //           {/* Deep purple */}
        //         </Box>
        //       </Box>
        //     )}
        //     <Button
        //       color="inherit"
        //       size="small"
        //       startIcon={
        //         <ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />
        //       }
        //     >
        //       Sync
        //     </Button>
        //   </Box>
        // }
        action={
          <Box
            sx={{
              display: "flex",
              alignItems: isMobile ? "stretch" : "flex-start",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 1.5 : 3,
              flexWrap: "wrap",
              width: isMobile ? "100%" : "auto",
            }}
          >

            {/* Legend + Sync */}
            <Box
              display="flex"
              flexDirection="row"
              flexWrap="wrap"
              alignItems="center"
              justifyContent={isMobile ? "flex-end" : "flex-start"}
              gap={isMobile ? 2 : 0}
              width={isMobile ? "100%" : "auto"}
            >
              {dashboard && (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Typography variant="body1" mr={1}>
                      {dashBoardInfo?.usage_history_data?.data?.[0]?.values?.[0]?.rate}
                    </Typography>
                    <Box width={12} height={20} bgcolor={colors.blue} />
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" mr={1}>
                      {dashBoardInfo?.usage_history_data?.data?.[0]?.values?.[1]?.rate}
                    </Typography>

                    <Box
                      width={12}
                      height={20}
                      bgcolor={alpha(colors.blue, 0.5)}
                    />
                  </Box>
                </Box>
              )}

              <Button
                color="inherit"
                size="small"
                startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
              >
                Sync
              </Button>
              <Button
                color="inherit"
                size="small"
                startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
                onClick={handleDownloadPdf}
              >
                Download Graph
              </Button>
            </Box>
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
          <div ref={chartRef}>
            <Chart
              key={`${monthlyUsageUam}-${barGraphData.gallons.join("-")}`}
              options={chartData.options}
              series={chartData.series}
              type="bar"
              height={400}
            />
          </div>
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
        open={dashboardLoading && !dashboard}
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
    noData: {
      text: "No data for this period",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: theme.palette.text.secondary,
        fontSize: "14px",
      },
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
        rotate: 0,
        rotateAlways: false,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Gallon",
        style: {
          color: theme.palette.text.secondary,
          fontSize: "12px",
        },
      },
      labels: {
        formatter: (value) => (typeof value === "number" ? value.toLocaleString() : `${value}`),
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
              rotate: 0,
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
