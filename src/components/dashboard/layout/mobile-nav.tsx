import * as React from "react";

import { colors } from "@/utils";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { X, CaretDown, CaretRight } from "@phosphor-icons/react/dist/ssr";

import type { NavItemConfig } from "@/types/nav";

import { isNavItemActive } from "@/lib/is-nav-item-active";
import { Logo } from "@/components/core/logo";

import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { paths } from "@/utils/paths";
import { getLocalStorage } from "@/utils/auth";
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { CustomerServiceTabs, getCustomerServiceTabsFromCustomer } from "@/state/features/sideNavSlice";

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const location = useLocation();
  const pathname = location.pathname;
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const customerServiceTabs = useSelector((state: RootState) => state?.SideNav?.customerServiceTabs);

  const effectiveCustomerServiceTabs = React.useMemo(() => {
    const companyDetails = dashBoardInfo?.body?.company ?? dashBoardInfo?.company ?? getLocalStorage("intuity-company");
    const customerInfo = dashBoardInfo?.body?.customer ?? dashBoardInfo?.customer ?? getLocalStorage("intuity-customerInfo");
    const mergedData = {
      ...(typeof companyDetails === "object" && companyDetails ? companyDetails : {}),
      ...(typeof customerInfo === "object" && customerInfo ? customerInfo : {}),
    };
    if (Object.keys(mergedData).length > 0) {
      return getCustomerServiceTabsFromCustomer(mergedData);
    }
    return customerServiceTabs;
  }, [dashBoardInfo, customerServiceTabs]);

  interface AliasUser {
    company_name: string;
    logo?: string;
  }
  const aliasUser: AliasUser | null = getLocalStorage("alias-details") as AliasUser | null;

  interface CompanyDetails {
    allow_auto_payment?: number | string;
    logo?: string;
    company_name?: string;
    optional_instructions?: string;
  }

  const localCompany = (dashBoardInfo?.body?.company ?? dashBoardInfo?.company ?? getLocalStorage("intuity-company")) as any;
  const companyDetails = localCompany;
  const apiCompany = dashBoardInfo?.body?.company ?? dashBoardInfo?.company;
  const companyLogo = apiCompany?.logo || aliasUser?.logo || localCompany?.logo || null;
  const companyName = apiCompany?.company_name || aliasUser?.company_name || localCompany?.company_name || "";

  const { allow_auto_payment, hasOptionalInstructions } = React.useMemo(() => {
    const cureentProcessor = dashBoardInfo?.body?.cureentProcessor ?? dashBoardInfo?.cureentProcessor ?? dashBoardInfo?.body?.currentProcessor ?? dashBoardInfo?.currentProcessor ?? companyDetails?.cureentProcessor ?? companyDetails?.currentProcessor;
    const cureentProcessorAch = dashBoardInfo?.body?.cureentProcessorAch ?? dashBoardInfo?.cureentProcessorAch ?? dashBoardInfo?.body?.currentProcessorAch ?? dashBoardInfo?.currentProcessorAch ?? companyDetails?.cureentProcessorAch ?? companyDetails?.currentProcessorAch;
    
    const allowPayments = companyDetails?.allow_payments;
    const optionalInstructions = companyDetails?.optional_instructions;

    const hasCardProcessor = Boolean(cureentProcessor?.[0]?.config_value);
    const hasAchProcessor = Boolean(cureentProcessorAch?.[0]?.config_value);
    const hasNoProcessors = (cureentProcessor !== undefined || cureentProcessorAch !== undefined)
      ? (!hasCardProcessor && !hasAchProcessor)
      : false;

    const isPaymentDisabled = hasNoProcessors || allowPayments == 0;
    const hasInstructionsText = Boolean(optionalInstructions && String(optionalInstructions).trim() !== "");

    return {
      allow_auto_payment: companyDetails?.allow_auto_payment,
      hasOptionalInstructions: Boolean(isPaymentDisabled && hasInstructionsText),
    };
  }, [dashBoardInfo, companyDetails]);

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
            "--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
            "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
            "--NavItem-group-active-background": "rgba(255, 255, 255, 0.08)",
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
            px: 2,
            py: 2,
            minHeight: "79px",
            height: "79px",
            justifyContent: "center",
            backgroundColor: colors.white,
            borderRight: 0.5,
            borderRightColor: "var(--mui-palette-divider)",
          }}
        >
          <Box component={RouterLink} to={paths.dashboard.overview()} sx={{
            display: "inline-flex",
            textDecoration: "none",
            color: "black",
            "&:hover": { textDecoration: "none" },
          }}>
            {companyLogo ? (
              <Logo color="dark" height={50} width={140} src={companyLogo} />
            ) : null}
            {companyName ? (
              <Typography sx={{ fontSize: "22px", my: "auto", fontWeight: 600, textDecoration: "none", ml: companyLogo ? 1.5 : 0 }}>
                {companyName}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />

        <Box component="nav" sx={{ flex: "1 1 auto", p: "10px", paddingLeft: "0px", mt: 1 }}>
          {renderNavItems({
            pathname,
            items: navItems,
            onClose,
            allow_auto_payment,
            customerServiceTabs: effectiveCustomerServiceTabs,
            hasOptionalInstructions,
          })}
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
            zIndex: (theme) => theme.zIndex.drawer + 10,
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
          <X size={24} color={colors.blue} weight="bold" />
        </Box>
      )}
    </>
  );
}

// ----- helper: does this item (or any descendant) match the current pathname? -----
function isItemOrDescendantActive(item: NavItemConfig, pathname: string): boolean {
  if (
    isNavItemActive({
      disabled: item.disabled,
      external: item.external,
      href: item.href,
      matcher: item.matcher,
      pathname,
    })
  ) {
    return true;
  }
  return (item.items ?? []).some((child) => isItemOrDescendantActive(child, pathname));
}

function isSubItemAllowed(
  subKey: string,
  allow_auto_payment: number | string,
  customerServiceTabs?: CustomerServiceTabs,
  hasOptionalInstructions?: boolean
): boolean {
  if (subKey === "auto-pay" && allow_auto_payment !== 1) {
    return false;
  }
  if (subKey === "payment-methods" && hasOptionalInstructions) {
    return false;
  }
  if (customerServiceTabs) {
    if (subKey === "history" && customerServiceTabs.usageHistory === false) return false;
    if (subKey === "service" && customerServiceTabs.service === false) return false;
    if (subKey === "account" && customerServiceTabs.account === false) return false;
    if (subKey === "stop-service" && customerServiceTabs.stopService === false) return false;
  }
  return true;
}

function renderNavItems({
  items = [],
  pathname,
  onClose,
  allow_auto_payment,
  customerServiceTabs,
  hasOptionalInstructions,
}: {
  items?: NavItemConfig[];
  pathname: string;
  onClose?: () => void;
  allow_auto_payment: number | string;
  customerServiceTabs?: CustomerServiceTabs;
  hasOptionalInstructions?: boolean;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, items: subItems, ...item } = curr;

    if (key === "auto-pay" && allow_auto_payment !== 1) {
      return acc;
    }

    if (key === "payment-methods" && hasOptionalInstructions) {
      return acc;
    }

    if (key === "history" && customerServiceTabs?.usageHistory === false) {
      return acc;
    }

    if (subItems && subItems.length > 0) {
      const filteredSubItems = subItems.filter((sub) =>
        isSubItemAllowed(sub.key, allow_auto_payment, customerServiceTabs, hasOptionalInstructions)
      );
      if (filteredSubItems.length > 0) {
        acc.push(
          <NavGroup key={key} pathname={pathname} groupKey={key} onClose={onClose} {...item} items={filteredSubItems} />
        );
      }
    } else {
      acc.push(<NavItem key={key} pathname={pathname} {...item} onClose={onClose} />);
    }
    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

// =====================================================================
// NavGroup — expandable parent (Billing & Payments, My Account, Customer Service)
// =====================================================================

interface NavGroupProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  groupKey: string;
  items: NavItemConfig[];
  onClose?: () => void;
}

function NavGroup({ groupKey, icon, items, pathname, title, onClose }: NavGroupProps): React.JSX.Element {
  const hasActiveChild = React.useMemo(
    () => items.some((child) => isItemOrDescendantActive(child, pathname)),
    [items, pathname]
  );

  const [open, setOpen] = React.useState(hasActiveChild);

  React.useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  const Icon = icon ? navIcons[icon] : null;

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

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
          // "&:hover": { bgcolor: "var(--NavItem-hover-background)" },
          ...(hasActiveChild &&
          {
            bgcolor: "var(--NavItem-group-active-background)",
            color: "var(--NavItem-active-color)",
          }),
          "&:hover": {
            bgcolor: hasActiveChild ? "var(--NavItem-group-active-background)" : "var(--NavItem-hover-background)",
          },
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
          {Icon ? (
            <Icon
              fill={hasActiveChild ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              fontSize="var(--icon-fontSize-md)"
              weight={hasActiveChild ? "fill" : undefined}
            />
          ) : null}
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
            <NavItem key={child.key} pathname={pathname} {...child} onClose={onClose} nested />
          ))}
        </Stack>
      )}
    </li>
  );
}

// =====================================================================
// NavItem — leaf item (top-level, or nested inside a NavGroup)
// =====================================================================

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  onClose?: () => void;
  nested?: boolean;
}

function NavItem({
  description,
  disabled,
  external,
  href,
  icon,
  matcher,
  nested = false,
  pathname,
  title,
  onClose,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
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

  const hrefs = `/${slug}/dashboard${href?.split("/dashboard")[1]}`;
  const navigate = useNavigate();
  const handleClick = () => {
    if (hrefs && !external) {
      navigate(hrefs);
    } else if (hrefs && external) {
      window.open(hrefs, "_blank");
    }
    onClose?.();
  };

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
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),
          ...(active && {
            bgcolor: "var(--NavItem-active-background)",
            color: "var(--NavItem-active-color)",
          }),
          ...(!active &&
            !disabled && {
            "&:hover": { bgcolor: "var(--NavItem-hover-background)" },
          }),
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
            pt: "2px",
          }}
        >
          {Icon ? (
            <Icon
              fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: "1 1 auto", whiteSpace: description ? "normal" : "nowrap" }}>
          <Typography
            component="span"
            sx={{
              display: "block",
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: 500,
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
}