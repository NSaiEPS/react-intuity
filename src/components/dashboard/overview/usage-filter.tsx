import React, { useEffect, useMemo, useState } from "react";
import {
  getUsageGraph,
  setMonthlyUsageUam,
  setUsageFilterValues,
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
  const [utilityType, setUtilityType] = useState("Water");
  const [unitMeasure, setUnitMeasure] = useState("Gallon");
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
        label: "Water",
        value: "Water",
      },
    ],
    ums: [
      {
        label: "Gallon",
        value: "Gallon",
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
      const type: { label: string; value: string }[] = [];
      meterDetails?.forEach((item) => {
        if (item?.utility_type_name) {
          type.push({
            label: item?.utility_type_name,
            value: item?.utility_type_name,
          });
        }
      });

      if (type.length) {
        setFilterList((prev) => ({
          ...prev,
          type: type,
        }));
        setUtilityType((prev) => {
          const match = type.find(
            (t) => t.value.toLowerCase() === (prev || "").toLowerCase()
          );
          return match ? match.value : type[0].value;
        });
      }
    }
  }, [meterDetails]);

  // Derived active values ensuring the first item in each select box is selected by default
  const selectedUtilityTypeValue = useMemo(() => {
    if (!filterList.type?.length) return "";
    const matched = filterList.type.find(
      (item) =>
        item.value === utilityType ||
        item.value.toLowerCase() === (utilityType || "").toLowerCase()
    );
    return matched ? matched.value : filterList.type[0].value;
  }, [filterList.type, utilityType]);

  const selectedUnitMeasureValue = useMemo(() => {
    if (!filterList.ums?.length) return "";
    const matched = filterList.ums.find(
      (item) =>
        item.value === unitMeasure ||
        item.value.toLowerCase() === (unitMeasure || "").toLowerCase()
    );
    return matched ? matched.value : filterList.ums[0].value;
  }, [filterList.ums, unitMeasure]);

  const selectedMeterNoValue = useMemo(() => {
    if (!meterNumList?.length) return "";
    const matched = meterNumList.find(
      (item: any) => String(item.value) === String(meterNo)
    );
    return matched ? String(matched.value) : String(meterNumList[0].value);
  }, [meterNumList, meterNo]);

  const [filterDates, setFilterDates] = useState({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    const selectedMeterObj = meterNumList?.find(
      (m: any) => String(m.value) === String(selectedMeterNoValue)
    );
    dispatch(
      setUsageFilterValues({
        utilityType: selectedUtilityTypeValue,
        unitMeasure: selectedUnitMeasureValue,
        meterNo: selectedMeterNoValue,
        meterNumberLabel: selectedMeterObj?.label || selectedMeterNoValue,
        startDate: filterDates.startDate,
        endDate: filterDates.endDate,
      })
    );
  }, [
    selectedUtilityTypeValue,
    selectedUnitMeasureValue,
    selectedMeterNoValue,
    meterNumList,
    filterDates,
    dispatch,
  ]);

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const stored: IntuityUser | null = useMemo(() => {
    const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  }, [userInfo]);

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
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
  const fetchUsageBarChart = (selectedMeterId?: string, dates?: { startDate: string; endDate: string }) => {
    const targetMeter = selectedMeterId !== undefined ? selectedMeterId : meterNo;
    if (!roleId || !userId) return;

    const barFormData = new FormData();
    barFormData.append("acl_role_id", roleId);
    barFormData.append("customer_id", userId);
    if (targetMeter) {
      barFormData.append("meter_id", targetMeter);
    }
    barFormData.append("utility_type", utilityType || "Water");
    barFormData.append("utility_um", unitMeasure || "Gallon");
    barFormData.append("billed_usage", "1");
    barFormData.append("usage_history", "1");
    barFormData.append("start_date", dates?.startDate || filterDates.startDate);
    barFormData.append("end_date", dates?.endDate || filterDates.endDate);

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
    const sDate = start ? dayjs(start).format("YYYY-MM-DD") : filterDates.startDate;
    const eDate = end ? dayjs(end).format("YYYY-MM-DD") : filterDates.endDate;
    if (start) {
      setFilterDates({
        startDate: sDate,
        endDate: eDate,
      });
    }

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("utility_type", utilityType);
    formData.append("utility_um", unitMeasure);
    formData.append("start_date", sDate);
    formData.append("end_date", eDate);
    if (meterNo) {
      formData.append("meter_no", meterNo);
    }
    dispatch(usageMonthlyGraph(formData));
    fetchUsageBarChart(meterNo, { startDate: sDate, endDate: eDate });
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
                value={selectedUtilityTypeValue}
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
                value={selectedUnitMeasureValue}
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
                value={selectedMeterNoValue}
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
