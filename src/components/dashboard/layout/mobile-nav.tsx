import * as React from "react";

import { colors } from "@/utils";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import CloseIcon from '@mui/icons-material/Close';
import { X } from "@phosphor-icons/react/dist/ssr";

import type { NavItemConfig } from "@/types/nav";

import { isNavItemActive } from "@/lib/is-nav-item-active";
import { Logo } from "@/components/core/logo";

import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { paths } from "@/utils/paths";

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({
  open,
  onClose,
}: MobileNavProps): React.JSX.Element {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <Drawer
        PaperProps={{
          sx: {
            "--MobileNav-background": colors.darkBlue,
            "--MobileNav-color": "var(--mui-palette-common-white)",
            "--NavItem-color": "var(--mui-palette-neutral-300)",
            "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
            "--NavItem-active-background": colors.blue,
            "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
            "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
            "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
            "--NavItem-icon-active-color":
              "var(--mui-palette-primary-contrastText)",
            "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
            bgcolor: "var(--MobileNav-background)",
            color: "var(--MobileNav-color)",
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            scrollbarWidth: "none",
            width: "var(--MobileNav-width)",
            zIndex: "var(--MobileNav-zIndex)",
            "&::-webkit-scrollbar": { display: "none" },
            border: "5px",
            borderColor: colors["blue.3"],
          },
        }}
        onClose={onClose}
        open={open}
      >
        {/* Drawer content */}
        <Stack
          sx={{
            p: 3,
            backgroundColor: colors.white,
            borderRight: 0.5,
            borderRightColor: "var(--mui-palette-divider)",
          }}
        >
          <Box
            component={RouterLink}
            href={paths.dashboard.overview()}
            sx={{ display: "inline-flex" }}
          >
            <Logo color="dark" height={50} width={140} />
          </Box>
        </Stack>

        <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />

        <Box
          component="nav"
          sx={{ flex: "1 1 auto", p: "10px", paddingLeft: "0px", mt: 1 }}
        >
          {renderNavItems({ pathname, items: navItems, onClose })}
        </Box>

        <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
      </Drawer>

      {/* Floating Close Button */}
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 2,
            left: "var(--MobileNav-width)",
            zIndex: (theme) => theme.zIndex.drawer + 10, // ⬅️ make sure it's above the drawer
            bgcolor: "#fff",
            borderRadius: "50%",
            boxShadow: 3,
            p: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={24} weight="bold" color={colors.darkBlue} />
        </Box>
      )}
    </>
  );
}

function renderNavItems({
  items = [],
  pathname,
  onClose,
}: {
  items?: NavItemConfig[];
  pathname: string;
  onClose?: () => void;
}): React.JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
      const { key, ...item } = curr;
      acc.push(
        <NavItem key={key} pathname={pathname} {...item} onClose={onClose} />
      );
      return acc;
    },
    []
  );

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  onClose?: () => void;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  onClose,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });
  const Icon = icon ? navIcons[icon] : null;
  const location = useLocation();
  const pathnames = location.pathname;

  const slug = React.useMemo(() => {
    if (!pathnames) return "intuityfe";
    const pathParts = pathnames.split("/");

    if (pathParts.length > 1 && pathParts[1] !== "intuityfe") {
      return pathParts.includes("register") ? pathParts[2] : pathParts[1];
    }
    return "intuityfe";
  }, [pathnames]);

  // console.log(slug, pathnames.split('/'), 'slugslug');

  // const hrefs = pathFun(slug);
  // const hrefs = typeof pathFun === 'function' ? pathFun(slug) : undefined;
  const hrefs = `/${slug}/dashboard${href?.split("/dashboard")[1]}`;
  const navigate = useNavigate();

  // console.log(hrefs, href, 'hrefshrefs', href?.split('/dashboard'));
  const handleClick = () => {
    if (hrefs && !external) {
      navigate(hrefs);
    } else if (hrefs && external) {
      window.open(hrefs, "_blank"); // ✅ external link
    }
    onClose();
  };
  return (
    <li>
      <Box
        // onClick={}
        // {...(href
        //   ? {
        //       component: external ? 'a' : RouterLink,
        //       href,
        //       target: external ? '_blank' : undefined,
        //       rel: external ? 'noreferrer' : undefined,
        //     }
        //   : { role: 'button' })}
        role="button"
        onClick={handleClick}
        sx={{
          alignItems: "center",
          borderTopRightRadius: "5px",
          borderBottomRightRadius: "5px",
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),
          ...(active && {
            bgcolor: "var(--NavItem-active-background)",
            color: "var(--NavItem-active-color)",
          }),
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          {Icon ? (
            <Icon
              fill={
                active
                  ? "var(--NavItem-icon-active-color)"
                  : "var(--NavItem-icon-color)"
              }
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
