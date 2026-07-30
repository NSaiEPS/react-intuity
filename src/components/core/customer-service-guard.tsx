import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "@/hooks/redux";
import { RootState } from "@/state/store";
import { CustomerServiceTabs, getCustomerServiceTabsFromCustomer } from "@/state/features/sideNavSlice";
import { getLocalStorage } from "@/utils/auth";

interface CustomerServiceGuardProps {
  tabKey: keyof CustomerServiceTabs;
  children: React.JSX.Element;
}

export function CustomerServiceGuard({
  tabKey,
  children,
}: CustomerServiceGuardProps): React.JSX.Element {
  const { company } = useParams<{ company?: string }>();
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const customerServiceTabs = useSelector(
    (state: RootState) => state?.SideNav?.customerServiceTabs
  );

  const effectiveTabs = React.useMemo(() => {
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

  const isAllowed = effectiveTabs ? effectiveTabs[tabKey] !== false : true;

  if (!isAllowed) {
    const redirectPath = company ? `/${company}/dashboard` : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
