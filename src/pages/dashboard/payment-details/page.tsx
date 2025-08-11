// pages/invoice.js (or any component file)
import { useLoading } from "@/components/core/skeletion-context";
import PaymentForm from "@/components/dashboard/account/payment-details";
import * as React from "react";

export default function PaymentDetailsPage() {
  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  return <PaymentForm />;
}
