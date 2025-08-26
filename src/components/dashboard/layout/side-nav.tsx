import * as React from "react";

import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { boarderRadius, colors } from "@/utils";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { NavItemConfig } from "@/types/nav";
// import { paths } from '@/utils/paths'
import { isNavItemActive } from "@/lib/is-nav-item-active";
import { Logo } from "@/components/core/logo";

import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { paths } from "@/utils/paths";
import { getLocalStorage } from "@/utils/auth";

export function SideNav(): React.JSX.Element {
  // const pathname = usePathname();
  // console.log(pathname.split('/'), 'pathnamepathname');
  const location = useLocation();
  const pathname = location.pathname;
  let aliasUser: any = getLocalStorage("alias-details");

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
        "--NavItem-icon-active-color":
          "var(--mui-palette-primary-contrastText)",
        "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
        bgcolor: "var(--SideNav-background)",
        color: "var(--SideNav-color)",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        // height: '100%',
        height: "calc(100vh - 115px)", // important!

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
      <Stack
        spacing={2}
        // sx={{ p: 3, backgroundColor: colors.white,

        //  }}
        sx={{
          p: 3,
          backgroundColor: colors.white,
          borderRightWidth: 0.5,
          borderRightStyle: "solid",
          // borderRightColor: colors.darkBlue
          borderRightColor: "var(--mui-palette-divider)",
          display: "none",
          pl: 0,
        }}
      >
        <Box
          component={RouterLink}
          to={paths.dashboard.overview()}
          sx={{ display: "inline-flex" }}
        >
          <Logo
            color="dark"
            height={50}
            width={140}
            src={aliasUser ? aliasUser?.logo : null}
          />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
      <Box
        component="nav"
        sx={{ flex: "1 1 auto", p: "10px", paddingLeft: "0px", mt: 1 }}
      >
        {renderNavItems({ pathname, items: navItems })}
      </Box>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
}: {
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
      const { key, ...item } = curr;

      acc.push(<NavItem key={key} pathname={pathname} {...item} />);

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
}

function NavItem({
  disabled,
  external,

  href,
  icon,
  matcher,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });

  const Icon = icon ? navIcons[icon] : null;
  // const slug = getCurrentCompanySlug();

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

  // console.log(hrefs, href, pathFun, 'hrefshrefs', href?.split('/dashboard'));
  const handleClick = () => {
    if (hrefs && !external) {
      navigate(hrefs);
    } else if (hrefs && external) {
      window.open(hrefs, "_blank"); // ✅ external link
    }
  };
  return (
    <li>
      <Box
        // {...(hrefs
        //   ? {
        //       component: external ? 'a' : RouterLink,
        //       hrefs,
        //       target: external ? '_blank' : undefined,
        //       rel: external ? 'noreferrer' : undefined,
        //     }
        //   : { role: 'button' })}
        role="button"
        onClick={handleClick}
        sx={{
          alignItems: "center",
          // borderRadius: 1,
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
            // <Icon
            //   fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
            //   fontSize="var(--icon-fontSize-md)"
            //   weight={active ? 'fill' : undefined}
            // />
            <Icon
              color={
                active
                  ? "var(--NavItem-icon-active-color)"
                  : "var(--NavItem-icon-color)"
              }
              size={20}
              weight={active ? "fill" : "regular"}
              style={{
                fontSize: "var(--icon-fontSize-md)",
                background: "transparent", // forcefully remove any background
                fill: "currentColor", // enforce text color
              }}
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
