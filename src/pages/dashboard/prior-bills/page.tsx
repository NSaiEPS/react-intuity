import * as React from "react";
import Stack from "@mui/material/Stack";
import { BillingHistory } from "@/components/dashboard/customer/billing-history";
import { useDispatch, useSelector } from "@/hooks/redux";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { useLoading } from "@/components/core/skeleton-context";
import { PriorBillsSkeleton } from "@/components/dashboard/skeletons";

export default function PriorBillsPage(): React.JSX.Element {
  const page = 0;
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const dispatch = useDispatch();
  const { contextLoading, setContextLoading } = useLoading();
  const currentYear = new Date().getFullYear();

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  React.useEffect(() => {
    const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
    const formData = new FormData();
    formData.append("acl_role_id", stored?.body?.acl_role_id);
    formData.append("customer_id", stored?.body?.customer_id);
    formData.append("id", stored?.body?.customer_id);
    formData.append("year", String(years[0]));
    dispatch(getLastBillInfo(formData, setContextLoading));
  }, [userInfo]);

  return (
    <>
      {contextLoading && <PriorBillsSkeleton />}
      <Stack spacing={3} sx={{ display: contextLoading ? 'none' : 'flex' }}>
        <BillingHistory />
      </Stack>
    </>
  );
}
