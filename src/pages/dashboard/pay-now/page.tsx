import * as React from "react";
import { getInvoiceDetails } from "@/state/features/dashBoardSlice";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import Stack from "@mui/material/Stack";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useLoading } from "@/components/core/skeleton-context";
import { PayNowSkeleton } from "@/components/dashboard/skeletons";
import { LastBill } from "@/components/dashboard/customer/last-bill-box";
import { Card, Divider } from "@mui/material";
import { boarderRadius } from "@/utils";
import Header from '@/components/CommonComponents/Header';


export default function PayNowPage(): React.JSX.Element {
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const { contextLoading, setContextLoading } = useLoading();

  const stored: IntuityUser | null = React.useMemo(() => {
    const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  }, [userInfo]);
  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const dispatch = useDispatch();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    dispatch(
      getLastBillInfo(formData, undefined, false, (res) => {
        if (res?.last_bill?.id) {
          const fd = new FormData();
          fd.append("acl_role_id", roleId);
          fd.append("customer_id", userId);
          fd.append("id", res?.last_bill?.id ?? "");
          dispatch(getInvoiceDetails(fd, setContextLoading));
        } else {
          setContextLoading(false);
        }
      })
    );
  }, [userId]);

  return (
    <>
      {contextLoading && <PayNowSkeleton />}
      <Card sx={{ borderRadius: boarderRadius.card, display: contextLoading ? 'none' : 'block' }}>
        <Header title="Pay Now" />
        <Divider sx={{ borderColor: "rgba(0,0,0,0.08)", borderBottomWidth: 1 }} />
        <Stack spacing={3} p={2}>
          <LastBill />
        </Stack>
      </Card>
    </>
  );
}
