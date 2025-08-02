import * as React from "react";
import { useNavigate } from "react-router-dom"; // Correct hook for App Router

import { boarderRadius } from "@/utils";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ListBullets as ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";

import { paths } from "@/utils/paths";

export interface TasksProgressProps {
  sx?: SxProps;
  value: number;
}

export function TasksProgress({ sx }: TasksProgressProps): React.JSX.Element {
  const navigate = useNavigate(); // Use the hook from next/navigation

  return (
    <Card
      sx={{
        ...sx,
        cursor: "pointer", // makes it feel clickable
        borderRadius: boarderRadius.card,
      }}
      onClick={() => {
        navigate(paths.dashboard.paperless());
      }} // Navigate to the target path
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack
              spacing={1}
              sx={{
                marginBottom: "40px",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                Paperless
              </Typography>
              <Typography variant="h4" textAlign="center">
                OFF
              </Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-warning-main)",
                height: "56px",
                width: "56px",
              }}
            >
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
