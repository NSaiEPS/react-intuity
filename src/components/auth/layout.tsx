import * as React from "react";

import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import {
//   Envelope as EnvelopeIcon,
//   Globe as GlobeIcon,
//   MapPin as MapPinIcon,
//   Phone as PhoneIcon,
// } from '@phosphor-icons/react';
import {
  Envelope,
  GlobeHemisphereWest,
  Headphones,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";

// import { paths } from '@/utils/paths'

import OneTimePaymentCard from "./register-slag";

export interface LayoutProps {
  reset?: boolean;
  children: React.ReactNode;
  company?: boolean;
}

export function Layout({
  reset = false,

  company = false,
}: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "grid" },
        flexDirection: "column",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100%",
      }}
    >
      {/* {false ? null : (
        <Box
          sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column" }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              component={RouterLink}
              href={paths.home()}
              sx={{ display: "inline-block", fontSize: 0 }}
            >
              <DynamicLogo
                colorDark="light"
                colorLight="dark"
                height={50}
                width={140}
              />
            </Box>
          </Box>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flex: "1 1 auto",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Box sx={{ maxWidth: "450px", width: "100%" }}>{children}</Box>
          </Box>
        </Box>
      )} */}

      {company ? (
        <OneTimePaymentCard />
      ) : (
        <Box
          sx={{
            backgroundImage: !reset
              ? "url(/assets/depositphotos_527571100-stock-photo-water-splash-isolated-on-white.jpg)"
              : "url(/assets/pngtree-a-drop-of-water-background-material-in-the-ocean-image_140350.jpg)",

            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#0d1b2a", // dark text for readability
            py: 6,
            px: 3,
          }}
        >
          <Stack
            spacing={4}
            sx={{ maxWidth: 500, mx: "auto", p: 4, borderRadius: 2 }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ textAlign: "center" }}
            >
              Contact Us
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Headphones size={24} weight="regular" />

                <Typography variant="body1">+1 234 567 8900</Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Envelope size={24} weight="duotone" />
                <Typography variant="body1">info@intuity.com</Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <GlobeHemisphereWest size={24} weight="duotone" />
                <Typography variant="body1">www.intuity.com</Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="flex-start">
                <MapPin size={24} weight="duotone" />
                <Typography variant="body1">
                  1234 Water Ave, Suite 100
                  <br />
                  Springfield, IL 62701
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: "rgba(0,0,0,0.2)", my: 2 }} />

            <Typography variant="h6" fontWeight="bold">
              Company Details
            </Typography>
            <Typography variant="body1">
              VAT No.: US123456789
              <br />
              Company Reg. No.: 98765432
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
