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
import { getLocalStorage } from "@/utils/auth";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { CaretDown } from "@phosphor-icons/react";
import { CaretRight } from "@phosphor-icons/react";

// ✅ memo — SideNav never needs to re-render unless route changes

// ❌ Wrong — React.memo is for components, not helper functions


// ----- helper: does this item (or any descendant) match the current pathname? -----
function isItemOrDescendantActive(item: NavItemConfig, pathname: string): boolean {
  if (isNavItemActive({ disabled: item.disabled, external: item.external, href: item.href, matcher: item.matcher, pathname })) {
    return true;
  }
  return (item.items ?? []).some((child) => isItemOrDescendantActive(child, pathname));
}


// ✅ Fix — just a plain function
function renderNavItems({
  items = [],
  pathname,
  allow_auto_payment,
  openGroupKey,
  onGroupToggle,
}: {
  items?: NavItemConfig[];
  pathname: string;
  allow_auto_payment: string | number;
  openGroupKey: string | null;
  onGroupToggle: (key: string) => void;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig) => {
    const { key, items: subItems, ...item } = curr;

    // Filter out auto-pay if not allowed — works whether it's top-level or nested
    if (key === "auto-pay" && allow_auto_payment !== 1) {
      return acc;
    }

    if (subItems && subItems.length > 0) {
      const filteredSubItems = subItems.filter((sub) => sub.key !== "auto-pay" || allow_auto_payment === 1);
      acc.push(
        <NavGroup
          key={key}
          pathname={pathname}
          groupKey={key}
          {...item}
          items={filteredSubItems}
          open={openGroupKey === key}
          onToggle={onGroupToggle}
        />
      );
    } else {
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
  const { allow_auto_payment } = React.useMemo(() => {
    const companyDetails = getLocalStorage("intuity-company") as { allow_auto_payment?: number | string } | null;
    return {
      allow_auto_payment: dashBoardInfo?.body?.company?.allow_auto_payment ?? companyDetails?.allow_auto_payment,
    };
  }, [dashBoardInfo?.body?.company?.allow_auto_payment]); // ← only re-runs when company data changes

  // ----- accordion state: which top-level group is currently expanded -----
  // Only one dropdown should be open at a time.
  const activeGroupKey = React.useMemo(() => {
    for (const item of navItems) {
      if (item.items && item.items.length > 0) {
        if (item.items.some((child) => isItemOrDescendantActive(child, pathname))) {
          return item.key;
        }
      }
    }
    return null;
  }, [pathname]);

  const [openGroupKey, setOpenGroupKey] = React.useState<string | null>(activeGroupKey);

  // Whenever navigation lands on a route inside a group, auto-expand that group
  // (and implicitly collapse whatever else was open, since only one key is tracked).
  React.useEffect(() => {
    if (activeGroupKey) setOpenGroupKey(activeGroupKey);
  }, [activeGroupKey]);

  const handleGroupToggle = React.useCallback((key: string) => {
    setOpenGroupKey((prev) => (prev === key ? null : key));
  }, []);

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
        "--NavItem-group-active-background": "rgba(255, 255, 255, 0.08)",
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
        {renderNavItems({
          pathname,
          items: navItems,
          allow_auto_payment,
          openGroupKey,
          onGroupToggle: handleGroupToggle,
        })}
      </Box>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
    </Box>
  );
});

// ✅ memo — only re-renders when pathname or allow_auto_payment changes


interface NavGroupProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  groupKey: string;
  items: NavItemConfig[];
  open: boolean;
  onToggle: (key: string) => void;
}

const NavGroup = React.memo(function NavGroup({
  groupKey,
  icon,
  items,
  pathname,
  title,
  open,
  onToggle,
}: NavGroupProps): React.JSX.Element {
  const hasActiveChild = React.useMemo(
    () => items.some((child) => isItemOrDescendantActive(child, pathname)),
    [items, pathname]
  );

  const Icon = icon ? navIcons[icon] : null;

  // Toggling this group closes whatever other group was open, since
  // openGroupKey in the parent only ever holds a single key at a time.
  const handleToggle = React.useCallback(() => {
    onToggle(groupKey);
  }, [onToggle, groupKey]);

  return (
    <li>
      <Box
        role="button"
        onClick={handleToggle}
        aria-expanded={open}
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
          // CHANGED — highlight whenever a child is active, whether expanded or collapsed
          ...(hasActiveChild && {
            bgcolor: "var(--NavItem-group-active-background)",
            color: "var(--NavItem-active-color)",
          }),
          "&:hover": {
            bgcolor: hasActiveChild ? "var(--NavItem-group-active-background)" : "var(--NavItem-hover-background)",
          },
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
          {Icon && (
            <Icon
              color={hasActiveChild ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              size={20}
              weight={hasActiveChild ? "fill" : "regular"}
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
        <Box sx={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>
          {open ? <CaretDown size={16} weight="bold" /> : <CaretRight size={16} weight="bold" />}
        </Box>
      </Box>

      {open && (
        <Stack component="ul" spacing={0.5} sx={{ listStyle: "none", m: 0, mt: 0.5, p: 0 }}>
          {items.map((child) => (
            <NavItem key={child.key} pathname={pathname} {...child} nested />
          ))}
        </Stack>
      )}
    </li>
  );
});

// =====================================================================
// NavItem — leaf item (top-level, or nested inside a NavGroup)
// =====================================================================

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  nested?: boolean;
}

const NavItem = React.memo(function NavItem({
  description,
  disabled,
  external,
  href,
  icon,
  matcher,
  nested = false,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  const location = useLocation();
  const pathnames = location.pathname;
  const routeChecker = useSelector((state: RootState) => state?.DashBoard?.routeChecker);
  const navigate = useNavigate();

  const slug = React.useMemo(() => {
    if (!pathnames) return "intuityfe";
    const pathParts = pathnames.split("/");
    if (pathParts.length > 1 && pathParts[1] !== "intuityfe") {
      return pathParts.includes("register") ? pathParts[2] : pathParts[1];
    }
    return "intuityfe";
  }, [pathnames]);

  const hrefs = `/${slug}/dashboard${href?.split("/dashboard")[1]}`;

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
          alignItems: "flex-start",
          borderTopRightRadius: "5px",
          borderBottomRightRadius: "5px",
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: nested ? "8px 16px 8px 40px" : "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...(disabled && { bgcolor: "var(--NavItem-disabled-background)", color: "var(--NavItem-disabled-color)", cursor: "not-allowed" }),
          // CHANGED — active nested items get a left accent bar + bolder weight
          // so they read as more emphasized than the group header's muted tint
          ...(active && {
            bgcolor: "var(--NavItem-active-background)",
            color: "var(--NavItem-active-color)",
            ...(nested && {
              boxShadow: "inset 3px 0 0 var(--mui-palette-common-white)",
            }),
          }),
          ...(!active && !disabled && {
            "&:hover": { bgcolor: "var(--NavItem-hover-background)" },
          }),
        }}
      >
        {Icon && (
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto", pt: "2px" }}>
            <Icon
              color={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              size={20}
              weight={active ? "fill" : "regular"}
              style={{ fontSize: "var(--icon-fontSize-md)", background: "transparent", fill: "currentColor" }}
            />
          </Box>
        )}
        <Box sx={{ flex: "1 1 auto", whiteSpace: description ? "normal" : "nowrap" }}>
          <Typography
            component="span"
            sx={{
              display: "block",
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: active && nested ? 700 : 500,
              lineHeight: description ? "20px" : "28px",
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              component="span"
              sx={{
                display: "block",
                color: active ? "var(--NavItem-active-color)" : "var(--mui-palette-neutral-400)",
                fontSize: "0.75rem",
                lineHeight: "16px",
                mt: "2px",
                whiteSpace: "normal",
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>
    </li>
  );
});