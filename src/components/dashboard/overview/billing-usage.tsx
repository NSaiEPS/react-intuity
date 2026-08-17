import React, { useEffect, useMemo, useState } from "react";
import {
  getUsageGraph,
  usageUtilityFilters,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colorPalette, colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { ChartLineUp } from "@phosphor-icons/react";
import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

import { useDispatch, useSelector } from "@/hooks/redux";
import secureLocalStorage from "react-secure-storage";

const HeaderSection = ({ setUamType }) => {
  const [utilityType, setUtilityType] = useState("WATER");
  const [unitMeasure, setUnitMeasure] = useState("");
  const dispatch = useDispatch();

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const stored: IntuityUser | null = useMemo(() => {
    const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  }, [userInfo]);

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;

  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  // Memoize so secureLocalStorage.getItem isn't called on every render (returns new object each time)
  const updatedMeterDetails = useMemo(() => {
    if (dashBoardInfo?.meterDetails) return dashBoardInfo.meterDetails;
    return secureLocalStorage.getItem("intuity-meterDetails") ?? {};
  }, [dashBoardInfo?.meterDetails]);

  const meterDetails = useMemo(() =>
    Object.entries(updatedMeterDetails).map(([key]) => ({ utility_type_name: key })),
    [updatedMeterDetails]);

  const utilityTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const setUtiltyType = () => {
    if (utilityTimerRef.current) clearTimeout(utilityTimerRef.current);
    utilityTimerRef.current = setTimeout(() => {
      setUtilityType(filterList.type?.[0]?.value);
    }, 1000);
  };
  useEffect(() => {
    setUtilityType("");
    setUtiltyType();
    setUnitMeasure("");
    return () => {
      if (utilityTimerRef.current) clearTimeout(utilityTimerRef.current);
    };
  }, [userId]);
  const [filterList, setFilterList] = useState({
    type: [
      {
        label: "WATER",
        value: "WATER",
      },
    ],
    ums: [
      {
        label: "gallons",
        value: "gallons",
      },
    ],
    meterNum: [],
  });
  useEffect(() => {
    if (meterDetails?.length) {
      const type = [];
      const ums = [];
      const meterNum = [];
      meterDetails?.forEach((item) => {
        // if (item?.meter_number) {
        //   meterNum.push({
        //     label: item?.meter_number,
        //     value: item?.meter_number,
        //   });
        // }
        // if (item?.uom_common_name) {
        //   ums.push({
        //     label: item?.uom_common_name,
        //     value: item?.uom_common_name,
        //   });
        // }
        if (item?.utility_type_name) {
          type.push({
            label: item?.utility_type_name,
            value: item?.utility_type_name,
          });
        }
      });
      setUtilityType(type?.[0]?.value);

      setFilterList({
        type: type,
        ums: ums,
        meterNum: meterNum,
      });
    }
  }, [meterDetails]);

  useEffect(() => {
    if (utilityType) {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);

      formData.append("utility_type", utilityType);

      dispatch(usageUtilityFilters(formData, successCallBack));
    }
  }, [utilityType]);

  const successCallBack = (data) => {
    if (data?.utility_um_data?.length || data?.get_meter_no?.length) {
      const type = [...filterList.type];
      const ums = [];
      const meterNum = [];

      data?.utility_um_data?.forEach((item) => {
        // if (item?.meter_number) {
        //   meterNum.push({
        //     label: item?.meter_number,
        //     value: item?.meter_number,
        //   });
        // }
        // if (item?.uom_common_name) {
        //   ums.push({
        //     label: item?.uom_common_name,
        //     value: item?.uom_common_name,
        //   });
        // }
        if (item?.uom_common_name) {
          ums.push({
            label: item?.uom_common_name,
            value: item?.uom_common_name,
          });
        }
      });

      // data?.get_meter_no?.forEach((item) => {
      //   if (item?.meter_number) {
      //     meterNum.push({
      //       label: item?.meter_number,
      //       value: item?.id,
      //     });
      //   }
      // });

      setUnitMeasure(ums[0]?.value);
      setUamType(ums[0]?.value);
      setFilterList({
        type: type,
        ums: ums,
        meterNum: meterNum,
      });
    }
  };

  const onSubmit = (unitMeasure) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("utility_type", utilityType);
    formData.append("utility_um", unitMeasure);
    formData.append("billed_usage", "1");
    formData.append("usage_history", "1");

    dispatch(getUsageGraph(formData));
  };
  return (
    <Box sx={{ p: 2, mt: 2 }}>
      {/* Title Row */}
      <Box display="flex" alignItems="center" mb={1}>
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          display="flex"
          alignItems="center"
        >
          <ChartLineUp
            size={28}
            weight="duotone"
            color="#5e7ba8"
            style={{ marginRight: 8 }}
          />
          <span role="img" aria-label="icon" style={{ marginRight: 8 }}></span>{" "}
          BILLED USAGE
        </Typography>
      </Box>

      {/* Subtext */}
      <Typography variant="h6" color={"#000"} mb={2}>
        Usage shown is based on the billing date. Refer to the Usage History
        graph for usage by read dates.
      </Typography>

      {/* Dropdowns */}
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm="auto">
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography fontWeight={500} variant="body2">Utility Type:</Typography>
            <FormControl fullWidth sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <Select
                value={utilityType}
                onChange={(e) => {
                  setUtilityType(e.target.value);
                }}
                sx={{ height: 40, bgcolor: "white" }}
              >
                {filterList.type?.map((item) => (
                  <MenuItem key={item?.value} value={item?.value}>{item?.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} sm="auto">
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography fontWeight={500} variant="body2">Utility UM:</Typography>
            <FormControl fullWidth sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <Select
                value={unitMeasure}
                onChange={(e) => {
                  setUnitMeasure(e.target.value);
                  setUamType(e.target.value);
                  onSubmit(e.target.value);
                }}
                sx={{ height: 40, bgcolor: "white" }}
              >
                {filterList.ums?.map((item) => (
                  <MenuItem key={item?.value} value={item?.value}>{item?.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
const BarChart = () => {
  const [barGraphData, setBarGraphData] = useState({
    gallons: [],
    dollars: [],
    dates: [],
    colors: [],
  });
  const [uamType, setUamType] = useState("gallons");

  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.usageGraph
  );
  type BarChartData = Record<string, [number, number]>;

  const barData: BarChartData = dashBoardInfo;

  const getBarChartData = () => {
    const gallons: number[] = [];
    const dollars: number[] = [];
    const dates: string[] = [];
    const colorsList: string[] = [];
    if (barData?.bar_chart_data) {
      Object.entries(barData.bar_chart_data).forEach(([key, values]) => {
        const dateStr = key?.split(",")[0] ?? "";
        if (dateStr.toLowerCase().includes("no data")) return;
        gallons.push(Number(values?.[0]) || 0);
        dollars.push(Number(values?.[1]) || 0);
        dates.push(dateStr);
        colorsList.push(colors.blue);
      });
    }

    setBarGraphData({ gallons, dollars, dates, colors: colorsList });
  };

  useEffect(() => {
    if (dashBoardInfo) {
      getBarChartData();
    }
  }, [dashBoardInfo]);

  const hasMonthlyData = useMemo(() => {
    if (!barGraphData.gallons || barGraphData.gallons.length === 0) return false;
    return barGraphData.gallons.some((val) => Number(val) > 0);
  }, [barGraphData.gallons]);

  const yAxisBounds = useMemo(() => {
    const valid = (barGraphData.gallons || []).map(Number).filter((v) => !isNaN(v) && v > 0);
    if (!valid.length) {
      return { min: 0, max: 1000, tickAmount: 4 };
    }
    const minVal = Math.min(...valid);
    const maxVal = Math.max(...valid);

    if (minVal === maxVal) {
      const min = Math.max(0, Math.floor(minVal * 0.8));
      const max = Math.ceil(maxVal * 1.2) || (min + 100);
      return { min, max, tickAmount: 4 };
    }

    const range = maxVal - minVal;
    const rawStep = range / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep > 0 ? rawStep : 1)));
    const residual = rawStep / (magnitude || 1);
    let niceResidual = 10;
    if (residual <= 1) niceResidual = 1;
    else if (residual <= 2) niceResidual = 2;
    else if (residual <= 2.5) niceResidual = 2.5;
    else if (residual <= 5) niceResidual = 5;

    const step = (niceResidual * magnitude) || 1;
    let min = Math.floor(minVal / step) * step;
    let max = Math.ceil(maxVal / step) * step;

    if (min >= minVal || minVal - min < step * 0.5) {
      min = Math.max(0, min - step);
    }

    if (max <= min) max = min + step * 4;

    const tickAmount = Math.max(1, Math.round((max - min) / step)) || 4;
    return { min, max, tickAmount };
  }, [barGraphData.gallons]);

  const chartData = useMemo(() => {
    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 400,
        toolbar: { show: false },
      },
      legend: {
        show: hasMonthlyData,
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
      colors: [colors.blue],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          distributed: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (_val: any, opts: any) {
          const index = opts?.dataPointIndex;
          const rawVal = barGraphData.gallons?.[index];
          const num = Number(rawVal) || 0;
          if (num <= 0) {
            return "0";
          }
          return num.toLocaleString();
        },
        offsetY: 15,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: [
            function (opts: any) {
              const index = opts?.dataPointIndex;
              const rawVal = barGraphData.gallons?.[index];
              const num = Number(rawVal) || 0;
              if (num <= 0) return "#374151";
              return "#ffffff";
            },
          ],
        },
      },
      xaxis: {
        categories: [...(barGraphData.dates || [])],
        axisBorder: { show: true },
        axisTicks: { show: true },
        labels: {
          show: true,
          rotate: 0,
          rotateAlways: false,
          formatter: function (val: any) {
            const Dateindex = barGraphData.dates.indexOf(val);
            const dollar = barGraphData.dollars[Dateindex] ?? 0;
            return `$ ${dollar}`;
          },
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
          text: uamType || "Gallon",
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
            const rawVal = barGraphData.gallons?.[index];
            const num = Number(rawVal) || 0;
            return `${num.toLocaleString()} ${uamType || "Gallon"}`;
          },
        },
      },
    };

    const step = (yAxisBounds.max - yAxisBounds.min) / (yAxisBounds.tickAmount || 4);
    const min = yAxisBounds.min;
    const baselineOffset = step * 0.01;

    const seriesData = (barGraphData.gallons || []).map((v) => {
      const num = Number(v) || 0;
      if (num <= 0) {
        return min + baselineOffset;
      }
      return num;
    });

    const series = [
      {
        name: "Usage",
        data: seriesData,
      },
    ];

    return { series, options };
  },
    [barGraphData, uamType, hasMonthlyData, yAxisBounds]
  );

  return (
    <>
      <HeaderSection setUamType={setUamType} />
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={400}
      />
    </>
  );
};

export default BarChart;
