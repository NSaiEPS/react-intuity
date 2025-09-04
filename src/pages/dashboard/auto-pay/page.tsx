import * as React from "react";

//import { companySlugs, config } from "@/config";
import AutoPayDetails from "@/components/dashboard/customer/auto-pay-details";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import { Navigate } from "react-router";

//export const metadata = {
//   title: `Auto Pay  - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function AutoPayPage(): React.JSX.Element {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const companyDetails: any = getLocalStorage("intuity-company");

  const { allow_auto_payment } =
    dashBoardInfo?.body?.company || companyDetails || {};

  if (allow_auto_payment !== 1) {
    return <Navigate to={"/"} replace />;
  }
  return <AutoPayDetails />;
}
