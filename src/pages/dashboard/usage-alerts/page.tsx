import * as React from "react";
import {
  deleteUsageAlerts,
  getUsageAlerts,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  Card,
  Checkbox,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MagnifyingGlass, Trash } from "@phosphor-icons/react/dist/ssr";
import dayjs, { Dayjs } from "dayjs";
import { Button, CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";

import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

type ConfirmDialogState = {
  open: boolean;
  ids: number[];
  type?: "single" | "multiple";
};

const initialState: ConfirmDialogState = {
  open: false,
  ids: [],
  type: "single",
};

type OpenDialogAction = {
  type: "OPEN_DIALOG";
  payload: {
    ids: number[];
    type?: "single" | "multiple";
  };
};

type CloseDialogAction = {
  type: "CLOSE_DIALOG";
};

type ConfirmDialogAction = OpenDialogAction | CloseDialogAction;

const reducer = (state: ConfirmDialogState, action: ConfirmDialogAction) => {
  switch (action.type) {
    case "OPEN_DIALOG": {
      const { payload } = action;
      return { open: true, ids: payload.ids, type: payload.type || "multiple" };
    }
    case "CLOSE_DIALOG":
      return { open: false, ids: [], type: "single" };
    default:
      return state;
  }
};

export default function AlertsScreen() {
  const [{ open, ids, type }, localDispatch] = React.useReducer(
    reducer,
    initialState
  );

  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);

  const { usageAlerts, accountLoading } = useSelector(
    (state: RootState) => state?.Account
  );

  const [selected, setSelected] = React.useState<number[]>([]);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [SearchedValue, setSearchedValue] = React.useState("");
  const [page, setPage] = React.useState(20);
  const alertsList = usageAlerts?.usage_alerts?.length
    ? usageAlerts.usage_alerts
    : [];

  const allSelected =
    alertsList.length > 0 && selected.length === alertsList.length;

  const handleToggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  interface AlertItem {
   id: number;
  data?: string | Date;
  acctnum?: string;
  customer_name?: string;
  utility_type_name?: string;
  meter_number?: string;
  message?: string;
}

  const handleToggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(alertsList.map((item: AlertItem) => item?.id));
    }
  };

  const handleDeleteRow = (id: number) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("Ids[]", id.toString());

    dispatch(
      deleteUsageAlerts(formData, () => {
        // setSelected((prev) => prev.filter((i) => i !== id));
        usageApiCall();
      })
    );

    //console.log("Delete row:", id);
  };

  const handleBulkDelete = () => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    if (selected.length === 0) return;

    selected.forEach((id) => {
      formData.append("Ids[]", id.toString());
    });
    dispatch(
      deleteUsageAlerts(formData, () => {
        setSelected([]);
        usageApiCall();
      })
    );
    // setSelected([]);
  };

  const handleSortDate = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedAlerts = React.useMemo<AlertItem[]>(() => {
    return [...alertsList].sort((a, b) => {
      const dateA = dayjs(a.data);
      const dateB = dayjs(b.data);

      return sortOrder === "asc"
        ? dateA.valueOf() - dateB.valueOf()
        : dateB.valueOf() - dateA.valueOf();
    });
  }, [alertsList, sortOrder]);

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const dispatch = useDispatch();
  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  // React.useEffect(() => {
  //   const formData = new FormData();

  //   formData.append("acl_role_id", roleId);
  //   formData.append("customer_id", userId);

  //   dispatch(getUsageAlerts(token, formData));
  // }, [stored]);
  const timeRef = React.useRef(null);
  React.useEffect(() => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    if (SearchedValue) {
      formData.append("search", SearchedValue);
    }
    if (startDate) {
      formData.append("start_date", dayjs(startDate).format("MM/DD/YYYY"));
    }
    if (endDate) {
      formData.append("end_date", dayjs(endDate).format("MM/DD/YYYY"));
    }
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }
    timeRef.current = setTimeout(() => {
      dispatch(getUsageAlerts(formData));
    }, 300);
  }, [SearchedValue, stored]);

  const usageApiCall = (perpageNum = page, isReset = false) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    if (SearchedValue) {
      formData.append("search", SearchedValue);
    }

    if (startDate && !isReset) {
      formData.append("start_date", dayjs(startDate).format("MM/DD/YYYY"));
    }
    if (endDate && !isReset) {
      formData.append("end_date", dayjs(endDate).format("MM/DD/YYYY"));
    }
    if (perpageNum) {
      formData.append("perpage", perpageNum.toString());
      formData.append("page", "1");
    }
    dispatch(getUsageAlerts(formData));
  };

  return (
    <Grid container spacing={2}>
      {/* Sidebar Filter */}
      <Grid item xs={12} md={3}>
        <Card
          sx={{
            p: 2,
            bgcolor: colors.darkBlue,
            color: "white",
            height: "100%",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: colors.blue }}
            textAlign={"center"}
          >
            FILTER ALERTS
          </Typography>

          <Typography textAlign={"center"} variant="body2" sx={{ mb: 1 }}>
            Alert Date between
          </Typography>

          <DatePicker
            value={startDate}
            onChange={setStartDate}
            maxDate={endDate || dayjs()}
            // slotProps={{
            //   // day: {
            //   //   sx: {
            //   //     "&.Mui-selected": {
            //   //       backgroundColor: colors.blue,
            //   //       color: "white", // optional
            //   //       "&:hover": {
            //   //         backgroundColor: colors.blue,
            //   //       },
            //   //     },
            //   //   },
            //   // },
            //   textField: {
            //     fullWidth: true,
            //     sx: { mb: 2, bgcolor: "white", borderRadius: 1 },
            //   },
            // }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{
                  mb: 2,
                  bgcolor: "white",
                  borderRadius: 1,
                }}
              />
            )}
          />
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            maxDate={dayjs()}
            minDate={startDate || undefined}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{
                  mb: 2,
                  bgcolor: "white",
                  borderRadius: 1,
                }}
              />
            )}
          />

          <Button
            fullWidth
            variant="contained"
            style={{ marginBottom: "16px" }}
            hoverBackgroundColor={colors.blue}
            bgColor={"gray"}
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              usageApiCall(page, true);
            }}
          >
            RESET ALL FILTERS
          </Button>
          <Button
            fullWidth
            variant="contained"
            bgColor={colors.blue}
            hoverBackgroundColor={colors["blue.3"]}
            disabled={!(startDate && endDate)}
            onClick={() => usageApiCall()}
          >
            SUBMIT
          </Button>
        </Card>
      </Grid>

      {/* Alerts Table */}
      <Grid item xs={12} md={9}>
        <Card sx={{ p: 2 }}>
          {/* Header with Search */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            sx={{
              display: "flex",
              flexDirection: "row", // default
              "@media (max-width:450px)": {
                flexDirection: "column",
              },
            }}
          >
            <Typography variant="h5">ALERTS</Typography>

            <TextField
              placeholder="Search alert"
              size="small"
              sx={{
                width: 300,

                "@media (max-width:450px)": {
                  marginTop: 1,
                  width: "100%",
                },
              }}
              onChange={(e) => setSearchedValue(e.target.value)}
              value={SearchedValue}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <MagnifyingGlass />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Display per page */}
          <Box display="flex" alignItems="center" mb={2} gap={1}>
            <Typography variant="body2">Display per page:</Typography>
            <Select
              defaultValue={20}
              size="small"
              value={page}
              onChange={(e) => {
                // setSearchedValue((prev) => ({ ...prev, page: e.target.value }))
                setPage(e.target.value as number);
                usageApiCall(e.target.value as number);
              }}
            >
              {[1, 5, 10, 20, 50, 100].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Alerts Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < alertsList.length
                      }
                      onChange={handleToggleAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    <TableSortLabel
                      active
                      direction={sortOrder}
                      onClick={handleSortDate}
                    >
                      Alert Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Acct Num</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Utility</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Meter No</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Alerts
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAlerts.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ bgcolor: index % 2 ? "#f9fcff" : "white" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(row?.id)}
                          onChange={() => handleToggle(row?.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {row.data ? dayjs(row.data).format("DD/MM/YYYY") : "-"}
                      </TableCell>
                      <TableCell>{row.acctnum || "-"}</TableCell>
                      <TableCell>{row.customer_name || "-"}</TableCell>
                      <TableCell>{row.utility_type_name || "-"}</TableCell>
                      <TableCell>{row.meter_number || "-"}</TableCell>
                      <TableCell>{row.message || "-"}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          size="small"
                          // onClick={() => handleDeleteRow(row?.id)}
                          onClick={() =>
                            localDispatch({
                              type: "OPEN_DIALOG",
                              payload: { ids: [row?.id], type: "single" },
                            })
                          }
                        >
                          <Trash size={18} weight="bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Bulk actions */}
          <Box mt={2}>
            <Typography variant="body2">
              Bulk actions:{" "}
              <Typography
                component="span"
                color={selected.length > 0 ? "error" : "text.disabled"}
                sx={{
                  cursor: selected.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  if (selected.length) {
                    localDispatch({
                      type: "OPEN_DIALOG",
                      payload: { ids: selected },
                    });
                  }
                }}
              >
                Delete
              </Typography>
            </Typography>
          </Box>
        </Card>
      </Grid>

      <ConfirmDialog
        open={open}
        title={"Delete Alert"}
        message={`Are you sure want to delete ${
          ids.length == 1 ? "This Alert" : `these ${ids.length} Alerts`
        } ?`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (type === "single") {
            handleDeleteRow(ids[0]);
            localDispatch({ type: "CLOSE_DIALOG" });
          } else {
            handleBulkDelete();
            localDispatch({ type: "CLOSE_DIALOG" });
          }
        }}
        onCancel={() => {
          localDispatch({ type: "CLOSE_DIALOG" });
        }}
        loader={accountLoading}
      />
      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Grid>
  );
}
