import React, { useState } from "react";
import { colors } from "@/utils";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { X } from "@phosphor-icons/react";
import dayjs, { Dayjs } from "dayjs";

const DateRangeSelector = ({ onSubmit }) => {
  const [selectedLabel, setSelectedLabel] = useState("This Month");
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().endOf("month"));
  const [openCustomDialog, setOpenCustomDialog] = useState(false);
  //need to change type here
  const [customDateRange, setCustomDateRange] = useState<any>([null, null]);

  const datePresets = ["This Month", "Last Month", "Custom Range"];

  const formatRange = (start: Dayjs, end: Dayjs) =>
    `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;

  const handleChange = (e: SelectChangeEvent) => {
    const label = e.target.value;

    setSelectedLabel(label);

    const today = dayjs();
    let start = today;
    let end = today;

    switch (label) {
      // not required as of now
      // case 'Today':
      //   break;
      // case 'Yesterday':
      //   start = end = today.subtract(1, 'day');
      //   break;
      // case 'Last 7 Days':
      //   start = today.subtract(6, 'day');
      //   break;
      // case 'Last 30 Days':
      //   start = today.subtract(29, 'day');
      //   break;
      case "This Month":
        start = today.startOf("month");
        break;
      case "Last Month":
        start = today.subtract(1, "month").startOf("month");
        end = today.subtract(1, "month").endOf("month");
        break;
      case "Custom Range":
        return; // Stopping here because date will come from calendar & modal from onclick
    }

    setStartDate(start);
    setEndDate(end);
    onSubmit(start, end);
  };

  const handleCustomSave = () => {
    if (customDateRange[0] && customDateRange[1]) {
      setStartDate(customDateRange[0]);
      setEndDate(customDateRange[1]);
      onSubmit(customDateRange[0], customDateRange[1]);
    }

    setOpenCustomDialog(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid item>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel
            sx={{
              color: "#111827", // default label color
              "&.Mui-focused": {
                color: colors.blue, // or set to same as text if needed
              },
            }}
          >
            Date Range
          </InputLabel>
          <Select
            value={selectedLabel}
            label="Date Range"
            onChange={handleChange}
            renderValue={() => formatRange(startDate, endDate)}
          >
            {datePresets.map((label) => (
              <MenuItem
                onClick={() => {
                  if (label === "Custom Range") {
                    setOpenCustomDialog(true);
                  }
                }}
                key={label}
                value={label}
              >
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Custom Range Dialog */}
        <Dialog open={openCustomDialog} maxWidth="xs" fullWidth>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pl: 3,
              pr: 1,
              pt: 2,
            }}
          >
            <Typography variant="h6">Select Custom Date Range</Typography>
            <IconButton onClick={() => setOpenCustomDialog(false)}>
              <X size={24} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 1 }}>
            <Box sx={{ mt: 1 }}>
              <DateRangePicker
                value={customDateRange}
                onChange={(newValue) => setCustomDateRange(newValue)}
                // calendars={1}
                sx={{ width: "100%" }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCustomSave}
              disabled={!customDateRange[0] || !customDateRange[1]}
              sx={{
                backgroundColor: colors.blue,
                "&:hover": {
                  backgroundColor: colors["blue.3"],
                },
                borderRadius: "12px",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </LocalizationProvider>
  );
};

export default DateRangeSelector;
