import * as React from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Button } from "nsaicomponents";

import { MagnifyingGlass, Trash } from "@phosphor-icons/react/dist/ssr";

import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux"; // to get alerts from redux
import { RootState } from "@/state/store";
import { colors } from "@/utils";

export default function AlertsScreen() {
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);

  const { usageAlerts } = useSelector((state: RootState) => state?.Account);
  const alertsList = [];
  return (
    <Grid container spacing={2}>
      {/* Sidebar Filter */}
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2, bgcolor: "#1d2a38", color: "white", height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#4da3ff" }}>
            FILTER ALERTS
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            Alert Date between
          </Typography>

          <DatePicker
            value={startDate}
            onChange={setStartDate}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { mb: 2, bgcolor: "white", borderRadius: 1 },
              },
            }}
          />
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { mb: 2, bgcolor: "white", borderRadius: 1 },
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            style={{
              marginBottom: "16px",
            }}
            hoverBackgroundColor={colors.blue}
            bgColor={"gray"}
          >
            RESET ALL FILTERS
          </Button>
          <Button
            fullWidth
            variant="contained"
            bgColor={colors.blue}
            hoverBackgroundColor={colors["blue.3"]}
          >
            SUBMIT
          </Button>
        </Card>
      </Grid>

      {/* Alerts Table */}
      <Grid item xs={12} md={9}>
        <Card sx={{ p: 2 }}>
          {/* Header with MagnifyingGlass */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">ALERTS</Typography>

            <TextField
              placeholder="MagnifyingGlass alert"
              size="small"
              sx={{ width: 300 }}
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
            <Select defaultValue={20} size="small">
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
                    <Checkbox />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Alert Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Acct Num</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Utility</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Meter No</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usageAlerts?.usage_alerts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Alerts
                    </TableCell>
                  </TableRow>
                ) : (
                  usageAlerts?.usage_alerts?.map((row: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{ bgcolor: index % 2 ? "#f9fcff" : "white" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        {dayjs(row.data).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>{row.acctnum}</TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{row.utility_type_name}</TableCell>
                      <TableCell>{row.meter_number}</TableCell>
                      <TableCell>{row.message}</TableCell>
                      <TableCell>
                        <IconButton color="error" size="small">
                          <Trash fontSize="small" />
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
                color="error"
                sx={{ cursor: "pointer" }}
              >
                Delete
              </Typography>
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
