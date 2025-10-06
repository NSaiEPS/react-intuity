import * as React from 'react';
import { getInvoiceDetails } from '@/state/features/dashBoardSlice';
import { getLastBillInfo } from '@/state/features/paymentSlice';
import { RootState } from '@/state/store';
import { getLocalStorage } from '@/utils/auth';
import Stack from '@mui/material/Stack';
import { useDispatch, useSelector } from 'react-redux';

import { useLoading } from '@/components/core/skeletion-context';
import { SkeletonWrapper } from '@/components/core/withSkeleton';
//import { companySlugs, config } from "@/config";
import { LastBill } from '@/components/dashboard/customer/last-bill-box';

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
  const raw = userInfo?.body ? userInfo : getLocalStorage('intuity-user');

  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;

  const lastBillInfo = useSelector((state: RootState) => state?.Payment?.lastBillInfo);
  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const dispatch = useDispatch();
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);
    formData.append('id', userId);

    dispatch(
      getLastBillInfo(formData, token, undefined, false, (res) => {
        console.log(res);
        if (res?.last_bill?.id) {
          const formData = new FormData();

          formData.append('acl_role_id', roleId);
          formData.append('customer_id', userId);
          formData.append('id', res?.last_bill?.id ?? '');

          dispatch(getInvoiceDetails(formData, token, setContextLoading));
        } else {
          setContextLoading(false);
        }
      })
    );
  }, [userInfo]);

  // React.useEffect(() => {
  //   if (lastBillInfo?.last_bill?.id) {
  //     const formData = new FormData();

  //     formData.append('acl_role_id', roleId);
  //     formData.append('customer_id', userId);
  //     formData.append('id', lastBillInfo?.last_bill?.id ?? '');

  //     dispatch(getInvoiceDetails(formData, token));
  //   }
  // }, [lastBillInfo?.last_bill?.id]);

  return (
    <SkeletonWrapper>
      <Stack spacing={3}>
        <LastBill />
      </Stack>
    </SkeletonWrapper>
  );
}
