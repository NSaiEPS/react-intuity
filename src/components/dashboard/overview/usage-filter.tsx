import React, { useEffect, useMemo, useState } from "react";
import {
  getUsageGraph,
  setMonthlyUsageUam,
  usageMonthlyGraph,
  usageUtilityFilters,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";

import DateRangeSelector from "./custom-date-picker";

function UsageFilter() {
  const [utilityType, setUtilityType] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("");
  const [meterNo, setMeterNo] = useState("");
  const dropdownDetailes = secureLocalStorage.getItem("intuity-meterDetails");
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const updatedMeterDetails = dashBoardInfo?.meterDetails
    ? dashBoardInfo?.meterDetails
    : dropdownDetailes;

  const [meterDetails, setMeterDetails] = useState([]);

  // const meterDetails = useMemo(() => {
  //   if (!updatedMeterDetails) return [];

  //   return Object.entries(updatedMeterDetails).map(([key, value]) => ({
  //     utility_type_name: key,
  //   }));
  // }, [updatedMeterDetails]);

  useEffect(() => {
    let value = Object.entries(updatedMeterDetails).map(([key, value]) => ({
      utility_type_name: key,
    }));

    setMeterDetails(value);
  }, [updatedMeterDetails]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMonthlyUsageUam(unitMeasure));
  }, [unitMeasure]);
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
  const [filterDates, setFilterDates] = useState({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  });
  useEffect(() => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("utility_type", "WATER");
    formData.append("utility_um", "gallons");
    formData.append("start_date", filterDates.startDate);
    formData.append("end_date", filterDates.endDate);

    dispatch(usageMonthlyGraph(formData, token));

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

      dispatch(usageUtilityFilters(formData, token, successCallBack));
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
        usageUtilityFilters(formData, token, (data) =>
          successCallBack(data, true)
        )
      );
    }
  }, [unitMeasure]);
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
      setMeterNo(meterNum[0]?.value || "");

      setFilterList({
        type: type,
        ums: ums,
        meterNum: meterNum,
      });
    }
  };

  const onSubmit = (start?: any, end?: any) => {
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
    dispatch(usageMonthlyGraph(formData, token));
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
        </span>{" "}
        MONTHLY USAGE
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Typography>Utility Type:</Typography>
        </Grid>
        <Grid item>
          <FormControl>
            <Select
              value={utilityType}
              defaultValue=""
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
              defaultValue=""
              onChange={(e) => {
                setUnitMeasure(e.target.value);
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

        <Grid item>
          <Typography>Meter No:</Typography>
        </Grid>
        <Grid item>
          <FormControl>
            <Select
              value={meterNo || ""}
              onChange={(e) => {
                setMeterNo(e.target.value);
              }}
              sx={{ height: 40, width: 170 }}
            >
              {filterList.meterNum?.map((item) => (
                <MenuItem value={item?.value}>{item?.label}</MenuItem>
              ))}
              {/* <MenuItem value="48699537">48699537</MenuItem>
              <MenuItem value="mt-no">Select Meter No</MenuItem> */}
            </Select>
          </FormControl>
        </Grid>

        <DateRangeSelector onSubmit={(start, end) => onSubmit(start, end)} />
        <Grid item>
          <Button
            sx={{
              backgroundColor: colors.blue,
              "&:hover": {
                backgroundColor: colors["blue.3"], // or any other hover color
              },
            }}
            variant="contained"
            onClick={() => onSubmit()}
          >
            SHOW
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UsageFilter;
