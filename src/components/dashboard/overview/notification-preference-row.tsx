import * as React from "react";
import { Box, IconButton, Radio, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
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
}: NotificationPreferenceRowProps): React.JSX.Element {
  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell sx={{ borderBottom: "1px solid #E2E8F0", py: 2.5, px: 3 }}>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: iconBgColor,
              color: iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 2,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
                {label}
              </Typography>
              {badge && (
                <Box
                  sx={{
                    backgroundColor: badge === "Required" ? "#E6F0FD" : "#E6F4EA",
                    color: badge === "Required" ? "#0B57D0" : "#137333",
                    fontSize: "11px",
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
      </TableCell>

      {["Email", "Text", "Both", "None"].map((col) => {
        const option = options.find((opt) => opt.label.toUpperCase() === col.toUpperCase());
        return (
          <TableCell
            key={col}
            align="center"
            sx={{ borderBottom: "1px solid #E2E8F0", py: 2.5 }}
          >
            {option ? (
              <Radio
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={option.requiresVerifiedPhone && !phoneVerified}
                sx={{
                  color: "#CBD5E1",
                  // "&.Mui-checked": {
                  //   color: "#0B57D0",
                  // },
                  "&.Mui-disabled": {
                    color: "#F1F5F9",
                  },
                }}
              />
            ) : (
              <Typography sx={{ color: "#94A3B8", fontWeight: 500 }}>—</Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
