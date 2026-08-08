import * as React from "react";
import {
  deleteUsageAlerts,
  getUsageAlerts,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius, colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  Button,
  Card,
  Checkbox,
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
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";

import UsageHeader from "@/components/dashboard/overview/usage-header";
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
        usageApiCall();
      })
    );
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
    <Card sx={{ borderRadius: boarderRadius.card }}>
      {/* Header */}
      <UsageHeader />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Section Title */}
        {/* <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          display="flex"
          alignItems="center"
          gap={1}
        >
          FILTER ALERTS
        </Typography> */}

        {/* Filter Controls */}
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="flex-end"
          gap={2}
          mb={2.5}
        >
          {/* Start Date */}
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography fontWeight={500} variant="body2" color="text.secondary">
              Alert Date From
            </Typography>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate || dayjs()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: 170 },
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* End Date */}
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography fontWeight={500} variant="body2" color="text.secondary">
              Alert Date To
            </Typography>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              maxDate={dayjs()}
              minDate={startDate || undefined}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: 170 },
                    bgcolor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            disabled={!(startDate && endDate)}
            onClick={() => usageApiCall()}
            sx={{
              height: 40,
              px: 3,
              backgroundColor: colors.blue,
              borderRadius: "8px",
              fontWeight: 600,
              textTransform: "uppercase",
              "&:hover": {
                backgroundColor: colors["blue.3"],
              },
            }}
          >
            SUBMIT
          </Button>

          {/* Reset Button */}
          <Button
            variant="outlined"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              usageApiCall(page, true);
            }}
            sx={{
              height: 40,
              px: 2,
              borderColor: "#d0d5dd",
              color: "#344054",
              borderRadius: "8px",
              fontWeight: 600,
              textTransform: "uppercase",
              "&:hover": {
                borderColor: "#98a2b3",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            RESET
          </Button>
        </Box>

        {/* Display per page & Search Bar */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          mb={2}
        >
          {/* Display per page */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Display per page:
            </Typography>
            <Select
              size="small"
              value={page}
              onChange={(e) => {
                setPage(e.target.value as number);
                usageApiCall(e.target.value as number);
              }}
              sx={{
                height: 36,
                borderRadius: "6px",
                minWidth: 70,
              }}
            >
              {[1, 5, 10, 20, 50, 100].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Search Bar */}
          <Box sx={{ minWidth: { xs: "100%", sm: 260 } }}>
            <TextField
              placeholder="Search alert"
              size="small"
              fullWidth
              value={SearchedValue}
              onChange={(e) => setSearchedValue(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <MagnifyingGlass size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "white",
                },
              }}
            />
          </Box>
        </Box>

        {/* Alerts Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #eaecf0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f9fafb" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={
                      selected.length > 0 && selected.length < alertsList.length
                    }
                    onChange={handleToggleAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  <TableSortLabel
                    active
                    direction={sortOrder}
                    onClick={handleSortDate}
                  >
                    Alert Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  Acct Num
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  Utility
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  Meter No
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  Message
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#344054" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAlerts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 4, color: "#667085" }}
                  >
                    No Alerts
                  </TableCell>
                </TableRow>
              ) : (
                sortedAlerts.map((row, index) => (
                  <TableRow
                    key={row?.id}
                    sx={{
                      bgcolor: index % 2 ? "#f9fcff" : "white",
                      "&:hover": { bgcolor: "#f2f4f7" },
                    }}
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
                    <TableCell>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: row.message || "-",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
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
        <Box mt={2} display="flex" alignItems="center">
          <Typography sx={{ fontWeight: 600 }} color="text.secondary">
            Bulk actions:{" "}
            <Typography
              component="span"
              color={selected.length > 0 ? "error.main" : "text.disabled"}
              sx={{
                cursor: selected.length > 0 ? "pointer" : "not-allowed",
                fontWeight: 600,
                ml: 0.5,
                "&:hover": {
                  textDecoration: selected.length > 0 ? "underline" : "none",
                },
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
      </Box>

      <ConfirmDialog
        open={open}
        title={"Delete Alert"}
        message={`Are you sure want to delete ${ids.length == 1 ? "This Alert" : `these ${ids.length} Alerts`
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
    </Card>
  );
}

