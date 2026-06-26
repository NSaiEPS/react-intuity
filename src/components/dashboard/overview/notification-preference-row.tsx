import * as React from "react";
import { FormControl, Grid, IconButton, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { Question } from "@phosphor-icons/react";

const tooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: "#E7E6E6",
      color: "#000000",
      border: "1px solid #d0cfcf",
      fontSize: "14px",
      lineHeight: 1.4,
      "& .MuiTooltip-arrow": {
        color: "#E7E6E6",
        "&::before": {
          border: "1px solid #d0cfcf",
        },
      },
    },
  },
};

export interface NotificationPreferenceOption {
  label: string;
  value: string;
  requiresVerifiedPhone?: boolean;
}

interface NotificationPreferenceRowProps {
  label: string;
  value: string;
  options: NotificationPreferenceOption[];
  onChange: (value: string) => void;
  phoneVerified: boolean;
  tooltip?: string;
  /** Top padding for the row's outer Grid (matches original per-row spacing). */
  pt?: number;
}

export function NotificationPreferenceRow({
  label,
  value,
  options,
  onChange,
  phoneVerified,
  tooltip,
  pt = 0,
}: NotificationPreferenceRowProps): React.JSX.Element {
  return (
    <Grid container p={2} alignItems="center" pt={pt}>
      <Grid item xs={12} sm={6} display="flex" alignItems="center">
        <Typography>{label}</Typography>
        {tooltip ? (
          <Tooltip title={tooltip} arrow componentsProps={tooltipSlotProps}>
            <IconButton edge="end">
              <Question size={20} color="#90caf9" weight="fill" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Select value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.requiresVerifiedPhone && !phoneVerified}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
