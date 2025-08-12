import * as React from "react";

import Stack from "@mui/material/Stack";

//import { companySlugs, config } from "@/config";
import { LastBill } from "@/components/dashboard/customer/last-bill-box";
import withSkeleton, { SkeletonWrapper } from "@/components/core/withSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { useLoading } from "@/components/core/skeletion-context";

//export const metadata = {
//   title: `Billing - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function PayNowPage(): React.JSX.Element {
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const { setContextLoading } = useLoading();

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const dispatch = useDispatch();
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);

    dispatch(getLastBillInfo(formData, token, setContextLoading));
  }, [userInfo]);

  return (
    <SkeletonWrapper>
      <Stack spacing={3}>
        <LastBill />
      </Stack>
    </SkeletonWrapper>
  );
}
