import * as React from "react";
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
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
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  badge?: "Required" | "Optional";
  description: string;
  isLast?: boolean;
}

export function NotificationPreferenceRow({
  label,
  value,
  options,
  onChange,
  phoneVerified,
  tooltip,
  icon,
  iconBgColor,
  iconColor,
  badge,
  description,
  isLast,
}: NotificationPreferenceRowProps): React.JSX.Element {
  const hasDisabledOption = options.some(
    (opt) => opt.requiresVerifiedPhone && !phoneVerified
  );
  const disabledTooltip = "Add a mobile number to enable this option";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 1.5, md: 3 },
        py: { xs: 1.5, md: 2.5 },
        borderBottom: isLast ? "none" : "1px solid #E2E8F0",
      }}
    >
      {/* Left: icon + label + badge + description */}
      <Box display="flex" alignItems="start" sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            width: { xs: 35, sm: 40 },
            height: { xs: 35, sm: 40 },
            borderRadius: "50%",
            backgroundColor: iconBgColor,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: { xs: 1, md: 2 },
            flexShrink: 0,

            "& svg": {
              width: { xs: 18, sm: 20 },
              height: { xs: 18, sm: 20 },
            },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap={{ xs: .6, md: 1 }} flexWrap="wrap">
            <Typography sx={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
              {label}
            </Typography>
            {badge && (
              <Box
                sx={{
                  backgroundColor: badge === "Required" ? "#E6F0FD" : "#E6F4EA",
                  color: badge === "Required" ? "#0B57D0" : "#137333",
                  fontSize: { xs: "9px", sm: "11px" },
                  fontWeight: 600,
                  px: 1,
                  py: 0.25,
                  borderRadius: "4px",
                  textTransform: "capitalize",
                }}
              >
                {badge}
              </Box>
            )}
            {tooltip ? (
              <Tooltip title={tooltip} arrow componentsProps={tooltipSlotProps}>
                <IconButton size="small" edge="end" sx={{ p: 0.25 }}>
                  <Question size={16} color="#90caf9" weight="fill" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
          <Typography sx={{ color: "#64748B", fontSize: "13px", mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Right: dropdown, full width on mobile, fixed width on desktop */}
      {/* <Tooltip
        title={hasDisabledOption ? disabledTooltip : ""}
        arrow
        componentsProps={tooltipSlotProps}
      > */}
      <FormControl
        size="small"
        sx={{
          width: { xs: "100%", sm: "30%" },
          flexShrink: 0,
        }}
      >
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
          sx={{ borderRadius: "8px", fontSize: "14px" }}
        >
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
      {/* </Tooltip> */}
    </Box>
  );
}