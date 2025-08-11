import * as React from "react";

import { CardHeader, Grid, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";

//import { companySlugs, config } from "@/config";
import { BillingHistory } from "@/components/dashboard/customer/billing-history";
import type { Customer } from "@/components/dashboard/customer/customers-table";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";

//export const metadata = {
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }  title: `Billing - ${config.site.name}`,
// } satisfies Metadata;

type IntuityUser = {
  body?: {
    acl_role_id?: string;
    customer_id?: string;
    token?: string;
  };
};
export default function PriorBillsPage(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 10;
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const dispatch = useDispatch();
  const { setContextLoading } = useLoading();

  const currentYear = new Date().getFullYear();

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    const years = Array.from({ length: 15 }, (_, index) => currentYear - index);

    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("year", String(years[2]));

    dispatch(getLastBillInfo(formData, token, setContextLoading));
  }, [userInfo]);

  return (
    <SkeletonWrapper>
      <Stack spacing={3}>
        <BillingHistory count={10} page={page} />
      </Stack>
    </SkeletonWrapper>
  );
}

function applyPagination(
  rows: Customer[],
  page: number,
  rowsPerPage: number
): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
