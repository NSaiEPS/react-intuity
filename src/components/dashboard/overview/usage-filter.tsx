import React, { useEffect, useMemo, useState } from "react";
import {
  getUsageGraph,
  setMonthlyUsageUam,
  usageMonthlyGraph,
  usageUtilityFilters,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "@/hooks/redux";
import secureLocalStorage from "react-secure-storage";

import DateRangeSelector from "./custom-date-picker";

function UsageFilter() {
  const [utilityType, setUtilityType] = useState("WATER");
  const [unitMeasure, setUnitMeasure] = useState("gallons");
  const [meterNo, setMeterNo] = useState("");
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

  const dispatch = useDispatch();

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
    dispatch(setMonthlyUsageUam(unitMeasure));
  }, [unitMeasure]);
  const usageGraph = useSelector(
    (state: RootState) => state?.DashBoard?.usageGraph
  );

  const meterNumList = useMemo(() => {
    if (usageGraph?.meters?.length) {
      return usageGraph.meters.map((meter: any) => ({
        label: meter.meter_number,
        value: String(meter.id),
      }));
    }
    return filterList.meterNum || [];
  }, [usageGraph?.meters, filterList.meterNum]);

  useEffect(() => {
    if (meterNumList?.length && !meterNo) {
      setMeterNo(String(meterNumList[0].value));
    }
  }, [meterNumList]);


  useEffect(() => {
    if (meterDetails?.length) {
      const type = [];
      meterDetails?.forEach((item) => {
        if (item?.utility_type_name) {
          type.push({
            label: item?.utility_type_name,
            value: item?.utility_type_name,
          });
        }
      });

      if (type.length) {
        setUtilityType(type[0].value);
        setFilterList((prev) => ({
          ...prev,
          type: type,
        }));
      }
    }
  }, [meterDetails]);

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const stored: IntuityUser | null = useMemo(() => {
    const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  }, [userInfo]);

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const [filterDates, setFilterDates] = useState({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  });
  useEffect(() => {
    if (!userId || !roleId) return;

    const currentType = utilityType || filterList.type?.[0]?.value || "WATER";
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("utility_type", currentType);
    formData.append("utility_um", unitMeasure || "gallons");
    formData.append("start_date", filterDates.startDate);
    formData.append("end_date", filterDates.endDate);

    dispatch(usageMonthlyGraph(formData));
  }, [userId]);

  useEffect(() => {
    if (utilityType) {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);

      formData.append("utility_type", utilityType);
      // formData.append('utility_um', unitMeasure);
      // formData.append('get_meter_no', '1');

      //     acl_role_id:4
      // customer_id:810
      // utility_type:Water
      // get_meter_no:1
      // utility_um:gallons

      dispatch(usageUtilityFilters(formData, successCallBack));
    }
  }, [utilityType]);

  useEffect(() => {
    if (unitMeasure) {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);

      formData.append("utility_type", utilityType);
      formData.append("utility_um", unitMeasure);
      formData.append("get_meter_no", "1");

      //     acl_role_id:4
      // customer_id:810
      // utility_type:Water
      // get_meter_no:1
      // utility_um:gallons

      dispatch(
        usageUtilityFilters(formData, (data) =>
          successCallBack(data, true)
        )
      );
    }
  }, [unitMeasure]);
  const fetchUsageBarChart = (selectedMeterId?: string) => {
    const targetMeter = selectedMeterId !== undefined ? selectedMeterId : meterNo;
    if (!roleId || !userId) return;

    const barFormData = new FormData();
    barFormData.append("acl_role_id", roleId);
    barFormData.append("customer_id", userId);
    if (targetMeter) {
      barFormData.append("meter_id", targetMeter);
    }
    barFormData.append("utility_type", utilityType || "WATER");
    barFormData.append("utility_um", unitMeasure || "gallons");
    barFormData.append("billed_usage", "1");
    barFormData.append("usage_history", "1");

    dispatch(getUsageGraph(barFormData));
  };

  const handleMeterChange = (selectedMeter: string) => {
    setMeterNo(selectedMeter);
    fetchUsageBarChart(selectedMeter);
  };

  const successCallBack = (data, isMeter = false) => {
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

      data?.get_meter_no?.forEach((item) => {
        if (item?.meter_number) {
          meterNum.push({
            label: item?.meter_number,
            value: item?.id,
          });
        }
      });
      if (!isMeter) {
        setUnitMeasure(ums[0]?.value);
      }
      const initialMeter = meterNum[0]?.value || "";
      setMeterNo(initialMeter);
      if (initialMeter) {
        fetchUsageBarChart(initialMeter);
      }

      setFilterList({
        type: type,
        ums: ums,
        meterNum: meterNum,
      });
    }
  };

  const onSubmit = (start?: Dayjs | null, end?: Dayjs | null) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (start) {
      setFilterDates({
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      });
    }
    // Formatted string

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("utility_type", utilityType);
    formData.append("utility_um", unitMeasure);
    formData.append(
      "start_date",
      start ? startDate.format("YYYY-MM-DD") : filterDates.startDate
    );
    formData.append(
      "end_date",
      end ? endDate.format("YYYY-MM-DD") : filterDates.endDate
    );
    if (meterNo) {
      formData.append("meter_no", meterNo);
    }
    dispatch(usageMonthlyGraph(formData));
    fetchUsageBarChart(meterNo);
  };
  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
        display="flex"
        alignItems="center"
      >
        <span role="img" aria-label="icon" style={{ marginRight: 8 }}>
          📊
        </span>
        MONTHLY USAGE
      </Typography>

      <Grid
        container
        spacing={2}
        alignItems={{ xs: "stretch", sm: "flex-end" }}
      >
        {/* Utility Type */}
        <Grid item xs={12} sm="auto">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography fontWeight={500}>Utility Type</Typography>

            <FormControl
              fullWidth
              sx={{
                minWidth: { xs: "100%", sm: 180 },
              }}
            >
              <Select
                value={utilityType}
                onChange={(e) => setUtilityType(e.target.value)}
                sx={{ height: 40 }}
              >
                {filterList.type?.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Utility UM */}
        <Grid item xs={12} sm="auto">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography fontWeight={500}>Utility UM</Typography>

            <FormControl
              fullWidth
              sx={{
                minWidth: { xs: "100%", sm: 180 },
              }}
            >
              <Select
                value={unitMeasure}
                onChange={(e) => setUnitMeasure(e.target.value)}
                sx={{ height: 40 }}
              >
                {filterList.ums?.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Meter No */}
        <Grid item xs={12} sm="auto">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography fontWeight={500}>Meter No</Typography>

            <FormControl
              fullWidth
              sx={{
                minWidth: { xs: "100%", sm: 170 },
              }}
            >
              <Select
                value={meterNo || meterNumList?.[0]?.value || ""}
                onChange={(e) => handleMeterChange(e.target.value)}
                sx={{ height: 40 }}
              >
                {meterNumList?.map((item: any) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Date Range */}
        <Grid item xs={12} sm="auto">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
            }}
          >
            {/* <Typography
            sx={{
              visibility: {
                xs: "visible",
                sm: "hidden",
              },
              fontWeight: 500,
            }}
          >
            Date Range
          </Typography> */}

            <DateRangeSelector
              maxDate={new Date()}
              onSubmit={(start, end) => onSubmit(start, end)}
            />
          </Box>
        </Grid>

        {/* Show Button */}
        <Grid item xs={12} sm="auto">
          <Button
            fullWidth
            variant="contained"
            onClick={() => onSubmit()}
            sx={{
              height: 40,
              backgroundColor: colors.blue,
              minWidth: { sm: 110 },
              "&:hover": {
                backgroundColor: colors["blue.3"],
              },
            }}
          >
            SHOW
          </Button>
        </Grid>
      </Grid>
    </Box>

  );
}

export default UsageFilter;
