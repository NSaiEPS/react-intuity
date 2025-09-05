import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
// import { Search } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

export default function AlertsScreen() {
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [rows, setRows] = React.useState<any[]>([]);

  return (
    <Grid container spacing={2}>
      {/* Sidebar Filter */}
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2, bgcolor: "#1d2a38", color: "white" }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#4da3ff" }}>
            FILTER ALERTS
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            Alert Date between
          </Typography>

          <DatePicker
            label="Start Date"
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
            label="End Date"
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
            sx={{ bgcolor: "grey.500", mb: 1 }}
          >
            RESET ALL FILTERS
          </Button>
          <Button fullWidth variant="contained" sx={{ bgcolor: "#1e73be" }}>
            SUBMIT
          </Button>
        </Card>
      </Grid>

      {/* Alerts Table */}
      <Grid item xs={12} md={9}>
        <Card sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">ALERTS</Typography>

            <TextField
              placeholder="Search alert"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>{/* <Search /> */}</IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Display per page */}
          <Box display="flex" alignItems="center" mb={2} gap={1}>
            <Typography variant="body2">Display per page:</Typography>
            <Select defaultValue={50} size="small">
              {[1, 5, 10, 20, 50, 100].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>Alert Date</TableCell>
                  <TableCell>Acct Num</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Utility</TableCell>
                  <TableCell>Meter No</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Alerts
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.acct}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.utility}</TableCell>
                      <TableCell>{row.meter}</TableCell>
                      <TableCell>{row.message}</TableCell>
                      <TableCell>{row.actions}</TableCell>
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
              <Typography component="span" color="error">
                Delete
              </Typography>
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
