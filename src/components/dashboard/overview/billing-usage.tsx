import React, { useEffect, useMemo, useState } from "react";
import {
  getUsageGraph,
  usageUtilityFilters,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colorPalette } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { ChartLineUp } from "@phosphor-icons/react";
const Chart = React.lazy(() => import("react-apexcharts"));

import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";

const HeaderSection = ({ setUamType }) => {
  const [utilityType, setUtilityType] = useState("WATER");
  const [unitMeasure, setUnitMeasure] = useState("");
  const [meterNo, setMeterNo] = useState("");
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

  const dropdownDetailes = secureLocalStorage.getItem("intuity-meterDetails");
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const updatedMeterDetails = dashBoardInfo?.meterDetails
    ? dashBoardInfo?.meterDetails
    : dropdownDetailes;

  // const meterDetails = useMemo(() => {
  //   if (!updatedMeterDetails) return [];

  //   return Object.entries(updatedMeterDetails).map(([key, value]) => ({
  //     utility_type_name: key,
  //   }));
  // }, [updatedMeterDetails]);
  const [meterDetails, setMeterDetails] = useState([]);

  useEffect(() => {
    let value = Object.entries(updatedMeterDetails).map(([key, value]) => ({
      utility_type_name: key,
    }));
    setMeterDetails(value);
  }, [updatedMeterDetails]);

  useEffect(() => {
    setUtilityType("");
    setUtiltyType();
    setUnitMeasure("");
    setMeterNo("");
  }, [userId]);
  const setUtiltyType = () => {
    setTimeout(() => {
      setUtilityType(filterList.type?.[0]?.value);
    }, 1000);
  };
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
      let type = [];
      let ums = [];
      let meterNum = [];
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

      dispatch(usageUtilityFilters(formData, token, successCallBack));
    }
  }, [utilityType]);

  const successCallBack = (data, isMeter = false) => {
    if (data?.utility_um_data?.length || data?.get_meter_no?.length) {
      let type = [...filterList.type];
      let ums = [];
      let meterNum = [];

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

    dispatch(getUsageGraph(formData, token));
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
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Typography>Utility Type:</Typography>
        </Grid>
        <Grid item>
          <FormControl>
            <Select
              value={utilityType}
              onChange={(e) => {
                setUtilityType(e.target.value);
              }}
              sx={{ height: 40 }}
            >
              {filterList.type?.map((item) => (
                <MenuItem value={item?.value}>{item?.label}</MenuItem>
              ))}

              {/* not using now */}
              {/* <MenuItem value="ELECTRIC">ELECTRIC</MenuItem>
              <MenuItem value="GAS">GAS</MenuItem> */}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <Typography>Utility UM:</Typography>
        </Grid>
        <Grid item>
          <FormControl>
            <Select
              value={unitMeasure}
              onChange={(e) => {
                setUnitMeasure(e.target.value);

                setUamType(e.target.value);

                onSubmit(e.target.value);
              }}
              sx={{ height: 40 }}
            >
              {/* <MenuItem value="gallons">gallons</MenuItem>
              <MenuItem value="myunit">myunit</MenuItem>
              <MenuItem value="Cubic-Mtr">Cubic-Mtr</MenuItem>
              <MenuItem value="Cubic-Ft">Cubic-Ft</MenuItem>
              <MenuItem value="ML">ML</MenuItem> */}
              {filterList.ums?.map((item) => (
                <MenuItem value={item?.value}>{item?.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
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

  // const chartData: any = {
  //   series: [
  //     {
  //       name: 'Gallons',
  //       data: barGraphData.gallons,
  //     },
  //   ],
  //   options: {
  //     chart: {
  //       type: 'bar',
  //       height: 400,
  //       toolbar: { show: false },
  //     },
  //     colors: [...barGraphData.colors], // Orange bars
  //     plotOptions: {
  //       bar: {
  //         columnWidth: '40%',
  //         distributed: true,
  //         startingShape: 'flat',
  //         dataLabels: {
  //           position: 'top', // For gallons at the top
  //         },
  //       },
  //     },
  //     dataLabels: {
  //       enabled: true,
  //       formatter: function (val, { dataPointIndex }) {
  //         console.log(barGraphData.gallons[dataPointIndex], dataPointIndex, barGraphData, 'dataPointIndex');
  //         return `${barGraphData.gallons[dataPointIndex]} ${uamType}`;
  //       },
  //       offsetY: -25,

  //       style: {
  //         fontSize: '14px',
  //         colors: ['#6b7280'], // gray
  //       },
  //     },
  //     xaxis: {
  //       categories: [...barGraphData.dates],
  //       labels: {
  //         show: true,
  //         useHTML: true,
  //         formatter: function (val, index) {
  //           // console.log('barGraphDatabarGraphData', val, index);
  //           let Dateindex = barGraphData.dates.indexOf(val);
  //           let dollar = barGraphData.dollars[Dateindex];
  //           const dollarVal = barGraphData.dollars[index];
  //           const isNegative = dollarVal < 0;
  //           const dollarFormatted = `${isNegative ? '-' : ''}$${Math.abs(dollarVal).toFixed(2)}`;
  //           const date = barGraphData.dates[index];
  //           // return `${dollarFormatted}\n${date}`;
  //           // return `$ ${dollar}\n ${index}`;
  //           const label = `${dollar} (${index})`;
  //           return label;
  //         },
  //         style: {
  //           fontSize: '14px',
  //           colors: ['#000', '#000', '#000', '#000'], // Black for amount
  //           fontWeight: 600,
  //         },
  //       },
  //     },
  //     yaxis: {
  //       show: false,
  //     },
  //     grid: {
  //       show: false,
  //     },
  //     tooltip: {
  //       enabled: false,
  //     },
  //   },
  // };

  //   secureLocalStorage.setItem('intuity-bar-chart', res?.body?.dashboard);
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.usageGraph
  );

  const barData: any = dashBoardInfo;

  const getBarChartData = () => {
    const gallons: any[] = [];
    const dollars: any[] = [];
    const dates: string[] = [];
    const colors: string[] = [];
    if (barData.bar_chart_data) {
      Object?.entries(barData.bar_chart_data).forEach(
        ([key, values], index) => {
          gallons.push(values?.[0]);

          dollars.push(values?.[1]);
          dates.push(key?.split(",")[0]);
          colors.push(colorPalette[index]);
        }
      );
    }

    setBarGraphData({ gallons, dollars, dates, colors });
  };

  useEffect(() => {
    if (dashBoardInfo) {
      getBarChartData();
    }
  }, [dashBoardInfo]);

  const chartData: any = useMemo(
    () => ({
      series: [
        {
          name: "gallons",
          data: barGraphData.gallons,
        },
      ],
      options: {
        chart: {
          type: "bar",
          height: 400,
          toolbar: { show: false },
        },
        colors: [...barGraphData.colors],
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
          formatter: function (val, { dataPointIndex }) {
            return `${barGraphData.gallons[dataPointIndex]} ${uamType}`;
          },
          offsetY: -25,
          style: {
            fontSize: "14px",
            colors: ["#6b7280"],
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
              const label = `$ ${dollar} (${index})`;
              return label;
            },
            style: {
              fontSize: "14px",
              colors: ["#000"],
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
    }),
    [barGraphData, uamType]
  );

  return (
    <>
      <HeaderSection setUamType={setUamType} />
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        key={`${uamType}-${barGraphData.gallons.join("-")}`}
        height={400}
      />
    </>
  );
};

export default BarChart;
