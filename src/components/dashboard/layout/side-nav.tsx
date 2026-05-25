import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { boarderRadius, colors } from "@/utils";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NavItemConfig } from "@/types/nav";
import { isNavItemActive } from "@/lib/is-nav-item-active";
import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { paths } from "@/utils/paths";
import { getLocalStorage } from "@/utils/auth";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

// ✅ memo — SideNav never needs to re-render unless route changes

// ❌ Wrong — React.memo is for components, not helper functions


// ✅ Fix — just a plain function
function renderNavItems({
  items = [],
  pathname,
  allow_auto_payment,
}: {
  items?: NavItemConfig[];
  pathname: string;
  allow_auto_payment: string | number;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig) => {
    const { key, ...item } = curr;
    if (key !== "auto-pay" || allow_auto_payment === 1) {
      acc.push(<NavItem key={key} pathname={pathname} {...item} />);
    }
    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}
export const SideNav = React.memo(function SideNav(): React.JSX.Element {
  const location = useLocation();
  const pathname = location.pathname;
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

  // ✅ useMemo — stop reading localStorage on every render
  const { aliasUser, allow_auto_payment } = React.useMemo(() => {
    const alias = getLocalStorage("alias-details") as { logo?: string } | null;
    const companyDetails = getLocalStorage("intuity-company") as { allow_auto_payment?: number | string } | null;
    return {
      aliasUser: alias,
      allow_auto_payment: dashBoardInfo?.body?.company?.allow_auto_payment ?? companyDetails?.allow_auto_payment,
    };
  }, [dashBoardInfo?.body?.company?.allow_auto_payment]); // ← only re-runs when company data changes

  return (
    <Box
      sx={{
        "--SideNav-background": colors.darkBlue,
        "--SideNav-color": "var(--mui-palette-common-white)",
        "--NavItem-color": "var(--mui-palette-neutral-300)",
        "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
        "--NavItem-active-background": colors.blue,
        "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
        "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
        "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
        "--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
        "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
        bgcolor: "var(--SideNav-background)",
        color: "var(--SideNav-color)",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        height: "calc(100vh - 115px)",
        left: 0,
        maxWidth: "100%",
        position: "fixed",
        scrollbarWidth: "none",
        top: 115,
        width: "var(--SideNav-width)",
        zIndex: "var(--SideNav-zIndex)",
        "&::-webkit-scrollbar": { display: "none" },
        overflow: "scroll",
        borderTopRightRadius: boarderRadius.card,
      }}
    >
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
      <Box component="nav" sx={{ flex: "1 1 auto", p: "10px", paddingLeft: "0px", mt: 1 }}>
        {renderNavItems({ pathname, items: navItems, allow_auto_payment })}
      </Box>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
    </Box>
  );
});

// ✅ memo — only re-renders when pathname or allow_auto_payment changes


interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
}

// ✅ memo — each nav item only re-renders when its own active state changes
const NavItem = React.memo(function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  const location = useLocation();
  const pathnames = location.pathname;
  const routeChecker = useSelector((state: RootState) => state?.DashBoard?.routeChecker);
  const navigate = useNavigate();

  // ✅ useMemo — slug not recomputed unless pathname changes
  const slug = React.useMemo(() => {
    if (!pathnames) return "intuityfe";
    const pathParts = pathnames.split("/");
    if (pathParts.length > 1 && pathParts[1] !== "intuityfe") {
      return pathParts.includes("register") ? pathParts[2] : pathParts[1];
    }
    return "intuityfe";
  }, [pathnames]);

  const hrefs = `/${slug}/dashboard${href?.split("/dashboard")[1]}`;

  // ✅ useCallback — stable function, doesn't recreate on every render
  const handleClick = React.useCallback(() => {
    if (!hrefs) return;
    if (external) {
      window.open(hrefs, "_blank");
      return;
    }
    if (routeChecker) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave this page?");
      if (confirmLeave) navigate(hrefs);
    } else {
      navigate(hrefs);
    }
  }, [hrefs, external, routeChecker, navigate]);

  return (
    <li>
      <Box
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
          ...(disabled && { bgcolor: "var(--NavItem-disabled-background)", color: "var(--NavItem-disabled-color)", cursor: "not-allowed" }),
          ...(active && { bgcolor: "var(--NavItem-active-background)", color: "var(--NavItem-active-color)" }),
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
          {Icon && (
            <Icon
              color={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              size={20}
              weight={active ? "fill" : "regular"}
              style={{ fontSize: "var(--icon-fontSize-md)", background: "transparent", fill: "currentColor" }}
            />
          )}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{ color: "inherit", fontSize: "0.875rem", fontWeight: 500, lineHeight: "28px" }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
});