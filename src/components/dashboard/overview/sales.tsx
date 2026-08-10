import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUsageGraph } from "@/state/features/dashBoardSlice";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";
import { colorPalette, colors } from "@/utils";
import { formatCurrency } from "@/utils/formatters";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import dayjs from "dayjs";
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
  SelectChangeEvent,
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
  noData?: boolean;
  title?: string;
}

export function Sales({
  sx,
  path,
  dashboard = false,
  noData = false,
  title,
}: SalesProps): React.JSX.Element {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:750px)");
  const chartOptions = useChartOptions();
  const dispatch = useDispatch();

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
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );
  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const isBillingHistoryChart = title === "Billing History" || path !== "usage-history";

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

    pdf.save(isBillingHistoryChart ? "Billing-History-Graph.pdf" : "Usage-Month-Graph.pdf");
  };

  const [selectedMeter, setSelectedMeter] = React.useState(
    dashBoardInfo?.meters?.length ? dashBoardInfo?.meters[0]?.id : ""
  );

  const ratesSet = new Set<string>();
  const rateToDataMap: Record<string, number[]> = {};

  dashBoardInfo?.usage_history_data?.data?.forEach((month) => {
    month?.values?.forEach((val) => {
      const rate = String(val.rate);
      ratesSet.add(rate);
      if (!rateToDataMap[rate]) {
        rateToDataMap[rate] = [];
      }
      rateToDataMap[rate].push(Number(val.value) || 0);
    });
  });

  const chartSeries = Array.from(ratesSet).map((rate) => ({
    name: rate,
    data: rateToDataMap[rate],
  }));

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

  // Process parent table billing history data from Redux state (lastBillInfo) - limit to top 3 parent invoice records
  const billingRecords = React.useMemo(() => {
    if (!isBillingHistoryChart) return [];
    const invoices = lastBillInfo?.get_invoices;
    const list = Array.isArray(invoices) ? invoices : [];

    const parsed = list
      .map((item: any) => {
        const rawDate = item?.billing_date || item?.date || item?.created_at;
        const rawAmount = item?.amount;
        let amountNum = 0;
        if (typeof rawAmount === "number") {
          amountNum = rawAmount;
        } else if (rawAmount !== null && rawAmount !== undefined) {
          const str = String(rawAmount).trim();
          const isNeg = /-/.test(str);
          const cleaned = str.replace(/[^0-9.]/g, "");
          amountNum = cleaned ? (isNeg ? -Number(cleaned) : Number(cleaned)) : 0;
        }

        const d = dayjs(rawDate);
        const dateFormatted = d.isValid() ? d.format("MMM D, YYYY") : String(rawDate || "");
        const timestamp = d.isValid() ? d.valueOf() : 0;

        return {
          id: item?.id,
          dateFormatted,
          amount: amountNum,
          timestamp,
        };
      })
      .filter((rec: any) => rec.dateFormatted !== "");

    const top3 = parsed.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 3);
    return top3.sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [lastBillInfo, isBillingHistoryChart]);

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(
    () => Array.from({ length: 15 }, (_, index) => currentYear - index),
    [currentYear]
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(years[0]);

  const handleYearChange = (event: SelectChangeEvent<string | number>) => {
    const yearVal = Number(event.target.value);
    setSelectedYear(yearVal);
    if (!roleId || !userId) return;

    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("year", String(yearVal));

    dispatch(getLastBillInfo(formData));
  };

  const hasFetchedBillingRef = React.useRef(false);

  React.useEffect(() => {
    if (noData || !roleId || !userId) return;

    if (isBillingHistoryChart) {
      if (!hasFetchedBillingRef.current) {
        hasFetchedBillingRef.current = true;
        const formData = new FormData();
        formData.append("acl_role_id", roleId);
        formData.append("customer_id", userId);
        formData.append("id", userId);
        formData.append("year", String(selectedYear));
        dispatch(getLastBillInfo(formData));
      }
    } else {
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
    }
  }, [userId, roleId, noData, isBillingHistoryChart, selectedYear, dispatch]);

  const [barGraphData, setBarGraphData] = React.useState({
    gallons: [],
    dollars: [],
    dates: [],
    colors: [],
  });

  const getBarChartData = (barData: any) => {
    const gallons: string[] = [];
    const dollars: string[] = [];
    const dates: string[] = [];
    const colors: string[] = [];

    if (barData) {
      barData.forEach((item: any, index: number) => {
        const dateStr = item?.[0] ?? "";
        if (dateStr.toLowerCase().includes("no data")) return;
        gallons.push(item?.[3] ?? "0");
        dollars.push("");
        dates.push(dateStr);
        colors.push(colorPalette[index % colorPalette.length]);
      });
    }

    setBarGraphData({ gallons, dollars, dates, colors });
  };

  React.useEffect(() => {
    if (monthlyUsageGraph?.length) {
      getBarChartData(monthlyUsageGraph?.slice(1));
    }
  }, [monthlyUsageGraph]);

  const hasBillingData = React.useMemo(() => {
    return billingRecords.length > 0;
  }, [billingRecords]);

  const hasMonthlyData = React.useMemo(() => {
    if (noData) return false;
    if (!barGraphData.gallons || barGraphData.gallons.length === 0) return false;
    return barGraphData.gallons.some((val) => {
      if (!val) return false;
      const num = parseFloat(String(val).replace(/,/g, ""));
      return !isNaN(num) && num !== 0;
    });
  }, [barGraphData.gallons, noData]);

  const isNoData = noData || (isBillingHistoryChart ? !hasBillingData : !hasMonthlyData);

  const numericValues = React.useMemo(() => {
    if (isBillingHistoryChart) {
      return billingRecords.map((r) => r.amount);
    }
    return (barGraphData.gallons || []).map((v) => {
      if (typeof v === "number") return v;
      const parsed = parseFloat(String(v).replace(/,/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    });
  }, [isBillingHistoryChart, billingRecords, barGraphData.gallons]);

  const yAxisBounds = React.useMemo(() => {
    const valid = numericValues.filter((v) => typeof v === "number" && !isNaN(v));
    if (!valid.length) {
      return { min: 0, max: isBillingHistoryChart ? 500 : 4000, tickAmount: 4 };
    }

    const minVal = Math.min(...valid);
    const maxVal = Math.max(...valid);

    if (isBillingHistoryChart) {
      const min = minVal < 0 ? Math.floor(minVal / 50) * 50 : 0;
      const maxTarget = Math.max(100, maxVal);
      const range = maxTarget - min;
      const rawStep = range / 4;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
      const residual = rawStep / magnitude;
      let niceResidual = 10;
      if (residual <= 1) niceResidual = 1;
      else if (residual <= 2) niceResidual = 2;
      else if (residual <= 2.5) niceResidual = 2.5;
      else if (residual <= 5) niceResidual = 5;

      const step = niceResidual * magnitude;
      let max = Math.ceil(maxTarget / step) * step;
      if (max <= min) max = min + step * 4;
      const tickAmount = Math.max(1, Math.round((max - min) / step));
      return { min, max, tickAmount };
    } else {
      if (minVal === maxVal) {
        const min = Math.max(0, Math.floor((minVal * 0.8) / 1000) * 1000);
        const max = Math.ceil((maxVal * 1.2) / 1000) * 1000 || 4000;
        const tickAmount = Math.max(1, Math.round((max - min) / 1000));
        return { min, max, tickAmount };
      }

      const range = maxVal - minVal;
      const rawStep = range / 4;
      let step = Math.max(1000, Math.ceil((rawStep || 1000) / 1000) * 1000);

      let min = Math.floor(minVal / step) * step;
      if (min >= minVal || minVal - min < step * 0.4) {
        min = Math.max(0, min - step);
      }
      let max = Math.ceil(maxVal / step) * step;
      if (max <= min) max = min + step * 4;

      const tickAmount = Math.max(1, Math.round((max - min) / step));
      return { min, max, tickAmount };
    }
  }, [numericValues, isBillingHistoryChart]);

  const categories = isNoData
    ? []
    : isBillingHistoryChart
    ? billingRecords.map((r) => r.dateFormatted)
    : [...barGraphData.dates];

  const seriesData = isNoData
    ? []
    : numericValues;

  const chartData: any = {
    series: [
      {
        name: isBillingHistoryChart ? "Amount" : "Usage",
        data: seriesData,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 400,
        toolbar: { show: false },
      },
      legend: {
        show: !isBillingHistoryChart,
        position: "top",
        horizontalAlign: "right",
      },
      colors: isNoData
        ? [colors.blue]
        : isBillingHistoryChart
        ? billingRecords.map((_, index) => colorPalette[index % colorPalette.length] || colors.blue)
        : !barGraphData.colors?.length ? ["#f97316"] : [...barGraphData.colors],

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
        enabled: !isNoData,
        formatter: function (_val: any, opts: any) {
          const index = opts?.dataPointIndex;
          const rawVal = numericValues[index];
          const num = Number(rawVal);
          if (isNaN(num)) return "";
          return isBillingHistoryChart
            ? formatCurrency(num)
            : num.toLocaleString();
        },
        offsetY: isBillingHistoryChart ? -20 : 15,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: [
            function (opts: any) {
              if (isBillingHistoryChart) return "#374151";
              const index = opts?.dataPointIndex;
              const rawVal = numericValues[index];
              const num = Number(rawVal) || 0;
              if (num <= 0) return "#374151";
              return "#ffffff";
            },
          ],
        },
      },
      xaxis: {
        categories: categories,
        axisBorder: { show: true },
        axisTicks: { show: !isNoData },
        labels: {
          show: !isNoData,
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
        min: isNoData ? 0 : yAxisBounds.min,
        max: isNoData ? (isBillingHistoryChart ? 500 : 4000) : yAxisBounds.max,
        tickAmount: yAxisBounds.tickAmount,
        title: {
          text: isBillingHistoryChart ? "Amount ($)" : (monthlyUsageUam || "Gallon"),
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: function (val: number) {
            if (typeof val !== "number") return `${val}`;
            if (isBillingHistoryChart) {
              if (val === 0) return "$0";
              if (val < 0) return `-$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
              return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
            }
            return val.toLocaleString();
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
        enabled: !isNoData,
        y: {
          formatter: (_val: number, opts: any) => {
            const index = opts?.dataPointIndex;
            const rawVal = numericValues[index];
            const num = Number(rawVal) || 0;
            if (isBillingHistoryChart) {
              return formatCurrency(num);
            }
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
          isBillingHistoryChart ? null : (
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
          )
        }
        title={
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
            {title || (dashboard ? "Usage" : "Usage / month")}
          </Typography>
        }
        subheader={
          isBillingHistoryChart ? (
            <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500, fontSize: "13px", mt: 0.5 }}>
              This graph shows the latest 3 Billing Details.
            </Typography>
          ) : null
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
              key={isNoData ? "no-data" : `${monthlyUsageUam}-${barGraphData.gallons.join("-")}`}
              options={chartData.options}
              series={chartData.series}
              type="bar"
              height={400}
            />
          </div>
        )}
        {isNoData && (
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "#6b7280", fontSize: "14px", fontWeight: 500, mt: 1 }}
          >
            No data found
          </Typography>
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
          onClick={() => navigate(paths.dashboard.priorBills())}
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
        open={Boolean(paymentLoader) || (dashboardLoading && !dashboard)}
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
