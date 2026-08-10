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
import { X } from "@phosphor-icons/react";
import dayjs, { Dayjs } from "dayjs";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css"; // important!

interface DateRangeSelectorProps {
  onSubmit: (start: Dayjs | null, end: Dayjs | null) => void;
  maxDate?: Date;
  label?: string;
  initialStartDate?: Dayjs | null;
  initialEndDate?: Dayjs | null;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onSubmit,
  maxDate,
  label = "Date Range",
  initialStartDate,
  initialEndDate,
}) => {
  const [selectedLabel, setSelectedLabel] = useState("Date Range");
  const [startDate, setStartDate] = useState<Dayjs | null>(
    initialStartDate !== undefined ? initialStartDate : dayjs().startOf("month")
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    initialEndDate !== undefined ? initialEndDate : dayjs().endOf("month")
  );
  const [openCustomDialog, setOpenCustomDialog] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<
    [Date | null, Date | null]
  >([null, null]);

  const datePresets = ["This Month", "Last Month", "Custom Range"];

  React.useEffect(() => {
    if (initialStartDate !== undefined) {
      setStartDate(initialStartDate);
    }
    if (initialEndDate !== undefined) {
      setEndDate(initialEndDate);
    }
    if (initialStartDate === null && initialEndDate === null) {
      setSelectedLabel("Date Range");
    }
  }, [initialStartDate, initialEndDate]);

  const formatRange = (start: Dayjs | null, end: Dayjs | null) => {
    if (!start && !end) return "Select Date Range";
    if (start && !end) return `${start.format("MMM D, YYYY")} - ...`;
    if (!start && end) return `... - ${end.format("MMM D, YYYY")}`;
    return `${start!.format("MMM D, YYYY")} - ${end!.format("MMM D, YYYY")}`;
  };

  const handleChange = (e: SelectChangeEvent) => {
    const label = e.target.value;
    setSelectedLabel(label);

    const today = dayjs();
    let start: Dayjs | null = today;
    let end: Dayjs | null = today;

    switch (label) {
      case "This Month":
        start = today.startOf("month");
        end = maxDate && today.endOf("month").isAfter(dayjs(maxDate)) ? dayjs(maxDate) : today.endOf("month");
        break;
      case "Last Month":
        start = today.subtract(1, "month").startOf("month");
        end = today.subtract(1, "month").endOf("month");
        break;
      case "Custom Range":
        return;
    }

    setStartDate(start);
    setEndDate(end);
    onSubmit(start, end);
  };

  const handleCustomSave = () => {
    if (customDateRange[0] && customDateRange[1]) {
      const [start, end] = customDateRange;
      const startDayjs = dayjs(start);
      const endDayjs = dayjs(end);

      setStartDate(startDayjs);
      setEndDate(endDayjs);
      onSubmit(startDayjs, endDayjs);
    }
    setOpenCustomDialog(false);
  };

  return (
    <Grid item>
      <FormControl size="small" sx={{ minWidth: 250 }}>
        <InputLabel
          sx={{
            color: "#111827",
            "&.Mui-focused": { color: colors.blue },
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
              key={label}
              value={label}
              onClick={() => {
                if (label === "Custom Range") setOpenCustomDialog(true);
              }}
              sx={{
                "&.Mui-selected": { backgroundColor: "#f0f4ff" },
              }}
            >
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Custom Range Dialog */}
      <Dialog
        open={openCustomDialog}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            px: "6px",
            py: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: "6px",
            pt: 2,
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Select Custom Date Range
          </Typography>
          <IconButton onClick={() => setOpenCustomDialog(false)}>
            <X size={24} color={colors.blue} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: "12px", py: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              alignItems: "stretch",
              gap: 2,
              mt: 1,
              mb: 1,
            }}
          >
            {/* Start Date Calendar */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                width: { xs: "100%", sm: "auto" },
                maxWidth: "400px",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ mb: 1, color: colors.blue, fontSize: "14px" }}
              >
                Start Date
              </Typography>
              <DatePicker
                selected={customDateRange[0]}
                onChange={(date: Date | null) =>
                  setCustomDateRange([date, customDateRange[1]])
                }
                selectsStart
                startDate={customDateRange[0]}
                endDate={customDateRange[1]}
                maxDate={
                  customDateRange[1] && maxDate
                    ? customDateRange[1] < maxDate
                      ? customDateRange[1]
                      : maxDate
                    : customDateRange[1] || maxDate || new Date(2035, 11, 31)
                }
                minDate={new Date(2000, 0, 1)}
                dateFormat="MM/dd/yyyy"
                inline
                showMonthDropdown
                showYearDropdown
                dropdownMode="scroll"
                calendarClassName="custom-datepicker"
                fixedHeight
              />
            </Box>

            {/* End Date Calendar */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                width: { xs: "100%", sm: "auto" },
                maxWidth: "400px",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ mb: 1, color: colors.blue, fontSize: "14px" }}
              >
                End Date
              </Typography>
              <DatePicker
                selected={customDateRange[1]}
                onChange={(date: Date | null) =>
                  setCustomDateRange([customDateRange[0], date])
                }
                selectsEnd
                startDate={customDateRange[0]}
                endDate={customDateRange[1]}
                minDate={customDateRange[0] || new Date(2000, 0, 1)}
                maxDate={maxDate || new Date(2035, 11, 31)}
                dateFormat="MM/dd/yyyy"
                inline
                showMonthDropdown
                showYearDropdown
                dropdownMode="scroll"
                calendarClassName="custom-datepicker"
                fixedHeight
              />
            </Box>
          </Box>
        </DialogContent>

        {/* Reset + Save Buttons */}
        <DialogActions sx={{ px: "12px", pb: 2, pt: 1, display: "flex", gap: 1.5 }}>
          {/* Reset Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setCustomDateRange([null, null])}
            sx={{
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "none",
              color: colors.blue,
              borderColor: colors.blue,
              "&:hover": { backgroundColor: "#f0f4ff" },
            }}
          >
            Reset
          </Button>

          {/* Save Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleCustomSave}
            disabled={!customDateRange[0] || !customDateRange[1]}
            sx={{
              backgroundColor: colors.blue,
              "&:hover": { backgroundColor: colors["blue.3"] },
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inline CSS for DatePicker */}
      <style>
        {`
          .custom-datepicker {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 8px;
          }

          .react-datepicker__month-container {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
          }

          .react-datepicker__month {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }

          .react-datepicker__year-dropdown,
          .react-datepicker__month-dropdown,
          .react-datepicker__month-year-dropdown {
            width: 50%;
            background: #f9fafb;
          }

          .react-datepicker__month-option:hover,
          .react-datepicker__year-option:hover {
            background: #2A72B9;
            color: white;
          }

          .custom-datepicker .react-datepicker__week {
            display: flex !important;
            justify-content: space-between;
          }

          .custom-datepicker .react-datepicker__day {
            width: 36px;
            height: 36px;
            margin: 2px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-weight: 500;
            color: #111827;
            transition: all 0.2s;
          }

          .react-datepicker__day-names {
            display: flex;
            align-items: center;
            white-space: nowrap;
            margin-bottom: -8px;
            justify-content: space-between;
          }

          .custom-datepicker .react-datepicker__current-month {
            margin-bottom: 16px;
            font-weight: 600;
            color: #111827;
          }

          .react-datepicker__day-name {
            width: 36px;
            height: 36px;
            margin: 2px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-weight: 500;
            color: #111827;
            transition: all 0.2s;
          }

          .custom-datepicker .react-datepicker__day--disabled,
          .custom-datepicker .react-datepicker__day--disabled:hover {
            color: #d1d5db !important;
            background-color: transparent !important;
            cursor: not-allowed !important;
            opacity: 0.4 !important;
            pointer-events: none !important;
          }

          .custom-datepicker .react-datepicker__day:not(.react-datepicker__day--disabled):hover {
            background-color: ${colors.blue};
            color: white;
          }

          .custom-datepicker .react-datepicker__day--selected,
          .custom-datepicker .react-datepicker__day--in-range,
          .custom-datepicker .react-datepicker__day--range-start,
          .custom-datepicker .react-datepicker__day--range-end {
            background-color: ${colors.blue};
            color: white;
            border-radius: 8px;
          }

          .custom-datepicker .react-datepicker__header {
            background-color: #f9fafb;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          .custom-datepicker .react-datepicker__navigation-icon::before {
            border-color: ${colors.blue};
          }
        `}
      </style>
    </Grid>
  );
};

export default DateRangeSelector;
