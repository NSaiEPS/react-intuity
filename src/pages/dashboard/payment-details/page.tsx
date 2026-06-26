import { useLoading } from "@/components/core/skeleton-context";
import { PaymentDetailsSkeleton } from "@/components/dashboard/skeletons";
import PaymentForm from "@/components/dashboard/account/payment-details";
import * as React from "react";

export default function PaymentDetailsPage() {
  const { contextLoading, setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  return (
    <>
      {contextLoading && <PaymentDetailsSkeleton />}
      <div style={{ display: contextLoading ? "none" : "block" }}>
        <PaymentForm />
      </div>
    </>
  );
}
