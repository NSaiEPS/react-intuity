import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUsageGraph, usageMonthlyGraph } from "@/state/features/dashBoardSlice";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";
import { colors, formatDate, APP_DATE_FORMAT } from "@/utils";
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
  const accountInfo = useSelector((state: RootState) => state?.Account?.accountInfo);
  const fullDashboardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const usageFilterValues = useSelector(
    (state: RootState) => state?.DashBoard?.usageFilterValues
  );

  const [selectedMeter, setSelectedMeter] = React.useState(
    dashBoardInfo?.meters?.length ? dashBoardInfo?.meters[0]?.id : ""
  );

  const isBillingHistoryChart = title === "Billing History" || path !== "usage-history";

  const customerDetails = React.useMemo(() => {
    const rawLocal = getLocalStorage("intuity-customerInfo") as any;
    const fromAccount = accountInfo?.customer_data?.[0];
    const fromDashboard = fullDashboardInfo?.customer || fullDashboardInfo?.body?.customer;
    const base = fromAccount || fromDashboard || rawLocal || {};

    return {
      accountName: base?.customer_name || base?.accountName || base?.name || "-",
      accountNumber: String(base?.acctnum || base?.account_number || base?.accountNumber || "-"),
      serviceAddress: base?.service_address || base?.serviceAddress || base?.customer_address || "-",
    };
  }, [accountInfo, fullDashboardInfo]);

  const selectedMeterLabel = React.useMemo(() => {
    if (usageFilterValues?.meterNumberLabel) return usageFilterValues.meterNumberLabel;
    const targetId = usageFilterValues?.meterNo || selectedMeter;
    const meterList = dashBoardInfo?.meters || [];
    const found = meterList.find(
      (m: any) => String(m.id) === String(targetId) || String(m.meter_number) === String(targetId)
    );
    return found?.meter_number || targetId || "All";
  }, [usageFilterValues, selectedMeter, dashBoardInfo?.meters]);

  const exportDateRange = React.useMemo(() => {
    const start = usageFilterValues?.startDate || dayjs().startOf("month").format("YYYY-MM-DD");
    const end = usageFilterValues?.endDate || dayjs().endOf("month").format("YYYY-MM-DD");
    return `${formatDate(start, APP_DATE_FORMAT)} - ${formatDate(end, APP_DATE_FORMAT)}`;
  }, [usageFilterValues?.startDate, usageFilterValues?.endDate]);

  const handleDownloadPdf = async () => {
    if (isNoData || !chartRef.current) return;

    try {
      // Capture only the chart directly - NO DOM changes, NO state changes, ZERO flicker
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("landscape", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
      const marginX = 14;
      const contentWidth = pageWidth - marginX * 2; // 269mm

      // ── 1. Heading ──
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(17, 24, 39); // #111827
      const headerTitle = isBillingHistoryChart ? "Billing History" : (title || "Usage & Billing");
      pdf.text(headerTitle, marginX, 15);

      // ── 2. Account Details Card (Account Name, Account #, Service Address) ──
      const accBoxY = 18.5;
      const accBoxHeight = 14;
      pdf.setDrawColor(229, 231, 235); // #E5E7EB
      pdf.setFillColor(249, 250, 251); // #F9FAFB
      pdf.roundedRect(marginX, accBoxY, contentWidth, accBoxHeight, 1.5, 1.5, "FD");

      // Col 1: Account Name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128); // #6B7280
      pdf.text("ACCOUNT NAME", marginX + 4, accBoxY + 4.5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(17, 24, 39); // #111827
      pdf.text(String(customerDetails.accountName), marginX + 4, accBoxY + 10, { maxWidth: 65 });

      // Col 2: Account #
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.text("ACCOUNT #", marginX + 75, accBoxY + 4.5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(17, 24, 39);
      pdf.text(String(customerDetails.accountNumber), marginX + 75, accBoxY + 10, { maxWidth: 50 });

      // Col 3: Service Address
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.text("SERVICE ADDRESS", marginX + 135, accBoxY + 4.5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(17, 24, 39);
      pdf.text(String(customerDetails.serviceAddress), marginX + 135, accBoxY + 10, { maxWidth: 128 });

      let chartY = 36;

      if (isBillingHistoryChart) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(107, 114, 128);
        pdf.text("This graph shows the latest 3 Billing Details.", marginX, accBoxY + accBoxHeight + 5);
        chartY = accBoxY + accBoxHeight + 8;
      } else {
        // ── 3. Filter Details Card (Utility Type, Utility UM, Meter Number, Date Range) ──
        const filterBoxY = accBoxY + accBoxHeight + 3; // 35.5mm
        const filterBoxHeight = 14;
        pdf.setDrawColor(229, 231, 235);
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(marginX, filterBoxY, contentWidth, filterBoxHeight, 1.5, 1.5, "FD");

        const colWidth = contentWidth / 4;
        const paddingLeft = 4;

        const filters = [
          { label: "UTILITY TYPE", value: usageFilterValues?.utilityType || "Water" },
          { label: "UTILITY UM", value: usageFilterValues?.unitMeasure || monthlyUsageUam || "Gallon" },
          { label: "METER NUMBER", value: selectedMeterLabel || "All" },
          { label: "DATE RANGE", value: exportDateRange },
        ];

        filters.forEach((filter, idx) => {
          const colX = marginX + idx * colWidth + paddingLeft;

          // Label
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          pdf.setTextColor(107, 114, 128);
          pdf.text(filter.label, colX, filterBoxY + 4.5);

          // Value
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8.5);
          pdf.setTextColor(17, 24, 39);
          pdf.text(String(filter.value), colX, filterBoxY + 10, { maxWidth: colWidth - 8 });
        });

        chartY = filterBoxY + filterBoxHeight + 5; // 54.5mm
      }

      // ── 4. Chart Image ──
      const maxChartHeight = pageHeight - chartY - 8;
      let imgWidth = contentWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > maxChartHeight) {
        imgHeight = maxChartHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const chartX = marginX + (contentWidth - imgWidth) / 2;
      pdf.addImage(imgData, "JPEG", chartX, chartY, imgWidth, imgHeight);

      pdf.save(isBillingHistoryChart ? "Billing-History-Graph.pdf" : "Usage-Month-Graph.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

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

  const handleSync = () => {
    if (!roleId || !userId) return;
    const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs().endOf("month").format("YYYY-MM-DD");

    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("utility_type", "Water");
    formData.append("utility_um", monthlyUsageUam || "Gallon");
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    dispatch(usageMonthlyGraph(formData));

    const barFormData = new FormData();
    barFormData.append("acl_role_id", roleId);
    barFormData.append("customer_id", userId);
    if (selectedMeter) {
      barFormData.append("meter_id", selectedMeter);
    }
    barFormData.append("utility_type", "Water");
    barFormData.append("utility_um", monthlyUsageUam || "Gallon");
    barFormData.append("billed_usage", "1");
    barFormData.append("usage_history", "1");
    barFormData.append("start_date", startDate);
    barFormData.append("end_date", endDate);
    dispatch(getUsageGraph(barFormData));
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
        const dateFormatted = d.isValid() ? formatDate(d, APP_DATE_FORMAT) : String(rawDate || "");
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

  const lastFetchedBillingKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (noData || !roleId || !userId) return;

    if (isBillingHistoryChart) {
      const fetchKey = `${userId}-${selectedYear}`;
      if (lastFetchedBillingKeyRef.current !== fetchKey) {
        lastFetchedBillingKeyRef.current = fetchKey;
        const formData = new FormData();
        formData.append("acl_role_id", roleId);
        formData.append("customer_id", userId);
        formData.append("id", userId);
        formData.append("year", String(selectedYear));
        dispatch(getLastBillInfo(formData));
      }
    } else {
      const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
      const endDate = dayjs().endOf("month").format("YYYY-MM-DD");

      const formData = new FormData();
      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      if (selectedMeter) {
        formData.append("meter_id", selectedMeter);
      }
      formData.append("utility_type", "Water");
      formData.append("utility_um", monthlyUsageUam || "Gallon");
      formData.append("billed_usage", "1");
      formData.append("usage_history", "1");
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);

      dispatch(getUsageGraph(formData));
    }
  }, [userId, roleId, noData, isBillingHistoryChart, selectedYear, dispatch]);

  const [barGraphData, setBarGraphData] = React.useState<{
    gallons: number[];
    dollars: (number | string)[];
    dates: string[];
    colors: string[];
  }>({
    gallons: [],
    dollars: [],
    dates: [],
    colors: [],
  });

  React.useEffect(() => {
    if (isBillingHistoryChart) return;

    const gallons: number[] = [];
    const dollars: (number | string)[] = [];
    const dates: string[] = [];
    const colorsList: string[] = [];

    const barData = dashBoardInfo?.bar_chart_data;

    if (barData && Object.keys(barData).length > 0) {
      Object.entries(barData).forEach(([key, values]: [string, any]) => {
        const dateStr = key?.split(",")[0]?.trim() ?? key;
        if (dateStr.toLowerCase().includes("no data")) return;

        const formattedDate = formatDate(dateStr, APP_DATE_FORMAT, dateStr);

        const gallonVal = typeof values?.[0] === "number"
          ? values[0]
          : parseFloat(String(values?.[0] || 0).replace(/,/g, "")) || 0;

        const dollarVal = values?.[1] !== undefined && values?.[1] !== null ? values[1] : 0;

        gallons.push(gallonVal);
        dollars.push(dollarVal);
        dates.push(formattedDate);
        colorsList.push(colors.blue);
      });
    } else if (monthlyUsageGraph?.length && Array.isArray(monthlyUsageGraph)) {
      monthlyUsageGraph.slice(1).forEach((item: any) => {
        const dateStr = (item?.[0] ?? "").trim();
        if (!dateStr || dateStr.toLowerCase().includes("no data")) return;

        const formattedDate = formatDate(dateStr, APP_DATE_FORMAT, dateStr);

        const rawGallon = item?.[3] ?? "0";
        const gallonVal = typeof rawGallon === "number"
          ? rawGallon
          : parseFloat(String(rawGallon).replace(/,/g, "")) || 0;

        const dollarVal = item?.[4] !== undefined && item?.[4] !== null ? item[4] : 0;

        gallons.push(gallonVal);
        dollars.push(dollarVal);
        dates.push(formattedDate);
        colorsList.push(colors.blue);
      });
    }

    setBarGraphData({ gallons, dollars, dates, colors: colorsList });
  }, [dashBoardInfo, monthlyUsageGraph, isBillingHistoryChart]);

  const hasBillingData = React.useMemo(() => {
    return billingRecords.length > 0;
  }, [billingRecords]);

  const hasMonthlyData = React.useMemo(() => {
    if (noData) return false;
    if (!barGraphData.gallons || barGraphData.gallons.length === 0) return false;
    return barGraphData.gallons.some((val) => {
      if (!val) return false;
      const num = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
      return !isNaN(num) && num !== 0;
    });
  }, [barGraphData.gallons, noData]);

  const isNoData = noData || (isBillingHistoryChart ? !hasBillingData : !hasMonthlyData);

  const numericValues = React.useMemo(() => {
    if (isBillingHistoryChart) {
      return billingRecords.map((r) => r.amount);
    }
    return (barGraphData.gallons || []).map((v) => {
      const num = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
      return isNaN(num) ? 0 : num;
    });
  }, [isBillingHistoryChart, billingRecords, barGraphData.gallons]);

  const yAxisBounds = React.useMemo(() => {
    const valid = numericValues.filter((v) => !isNaN(v) && v > 0);
    if (!valid.length) {
      return { min: 0, max: isBillingHistoryChart ? 100 : 1000, tickAmount: 4 };
    }
    const minVal = Math.min(...valid);
    const maxVal = Math.max(...valid);

    if (minVal === maxVal) {
      const min = Math.max(0, Math.floor(minVal * 0.8));
      const max = Math.ceil(maxVal * 1.2) || min + 100;
      return { min, max, tickAmount: 4 };
    }

    const range = maxVal - minVal;
    const rawStep = range / 4;

    if (isBillingHistoryChart) {
      const step = Math.ceil(rawStep / 10) * 10 || 10;
      let min = Math.floor(minVal / step) * step;
      let max = Math.ceil(maxVal / step) * step;

      if (min >= minVal || minVal - min < step * 0.3) {
        min = Math.max(0, min - step);
      }
      if (max <= min) max = min + step * 4;

      const tickAmount = Math.max(1, Math.round((max - min) / step));
      return { min, max, tickAmount };
    } else {
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep > 0 ? rawStep : 1)));
      const residual = rawStep / (magnitude || 1);
      let niceResidual = 10;
      if (residual <= 1) niceResidual = 1;
      else if (residual <= 2) niceResidual = 2;
      else if (residual <= 2.5) niceResidual = 2.5;
      else if (residual <= 5) niceResidual = 5;

      const step = niceResidual * magnitude || 1;

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
    : isBillingHistoryChart
      ? numericValues
      : (() => {
        const step = (yAxisBounds.max - yAxisBounds.min) / (yAxisBounds.tickAmount || 4);
        const min = yAxisBounds.min;
        const baselineOffset = step * 0.015;

        return numericValues.map((v) => {
          const num = Number(v) || 0;
          if (num <= 0) {
            return min + baselineOffset;
          }
          return num;
        });
      })();

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
        show: false,
      },
      colors: [colors.blue],

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
          if (isNaN(num)) return "0";
          return isBillingHistoryChart
            ? formatCurrency(num)
            : num.toLocaleString();
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: ["#374151"],
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
          formatter: function (val: any) {
            if (isBillingHistoryChart) return val;
            const idx = categories.indexOf(val);
            if (
              idx !== -1 &&
              barGraphData.dollars[idx] !== undefined &&
              barGraphData.dollars[idx] !== ""
            ) {
              const d = barGraphData.dollars[idx];
              const dollarFormatted = String(d).startsWith("$") ? d : `$${d}`;
              return [val, dollarFormatted];
            }
            return val;
          },
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
      tooltip: isBillingHistoryChart
        ? {
          enabled: !isNoData,
          y: {
            formatter: (_val: number, opts: any) => {
              const index = opts?.dataPointIndex;
              const rawVal = numericValues[index];
              const num = Number(rawVal) || 0;
              return formatCurrency(num);
            },
          },
        }
        : {
          enabled: !isNoData,
          custom: function ({ dataPointIndex, w }: any) {
            const dateStr = categories[dataPointIndex] || w?.globals?.labels?.[dataPointIndex] || "";
            const gallonVal = numericValues[dataPointIndex] ?? 0;
            const dollarVal = barGraphData.dollars[dataPointIndex] ?? 0;

            const gallonNum = typeof gallonVal === "number" ? gallonVal : parseFloat(String(gallonVal).replace(/,/g, "")) || 0;
            const um = monthlyUsageUam || "Gallon";
            const formattedGallons = `${gallonNum.toLocaleString()} ${um}`;
            const formattedDollars = String(dollarVal).startsWith("$") ? dollarVal : `$${dollarVal}`;

            return `
                <div style="padding: 10px 14px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); font-family: inherit; font-size: 13px;">
                  <div style="font-weight: 700; color: #111827; margin-bottom: 6px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;">${dateStr}</div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #374151; margin-bottom: 4px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: ${colors.blue};"></span>
                      <strong>Usage:</strong>
                    </span>
                    <span style="font-weight: 600; color: #1f2937;">${formattedGallons}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #374151;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: ${colors.blue};"></span>
                      <strong>Billed Amount:</strong>
                    </span>
                    <span style="font-weight: 600; color: #111827;">${formattedDollars}</span>
                  </div>
                </div>
              `;
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
        action={
          isBillingHistoryChart ? null : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                color="inherit"
                size="small"
                startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
                onClick={handleSync}
              >
                Sync
              </Button>
              <Button
                color="inherit"
                size="small"
                startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
                onClick={handleDownloadPdf}
                disabled={isNoData}
              >
                Download Graph
              </Button>
            </Box>
          )
        }
        title={
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
            {title || (dashboard ? "Usage" : "Usage & Billing")}
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
