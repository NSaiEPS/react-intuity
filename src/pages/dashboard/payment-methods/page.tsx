import * as React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import Stack from "@mui/material/Stack";
import { PaymentMethods } from "@/components/dashboard/customer/payment-methods";
import { useLoading } from "@/components/core/skeleton-context";
import { PaymentMethodsSkeleton } from "@/components/dashboard/skeletons";

export default function PaymentMethodsPage(): React.JSX.Element {
  const { contextLoading } = useLoading();
  const { company } = useParams<{ company?: string }>();
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

  const hasOptionalInstructions = React.useMemo(() => {
    const companyDetails = (dashBoardInfo?.body?.company ?? dashBoardInfo?.company ?? getLocalStorage("intuity-company")) as any;
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

    return Boolean(isPaymentDisabled && hasInstructionsText);
  }, [dashBoardInfo]);

  if (hasOptionalInstructions) {
    const redirectPath = company ? `/${company}/dashboard` : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <>
      {contextLoading && <PaymentMethodsSkeleton />}
      <Stack spacing={3} sx={{ display: contextLoading ? 'none' : 'flex' }}>
        <PaymentMethods count={10} page={0} rowsPerPage={10} accountInfo={true} />
      </Stack>
    </>
  );
}
