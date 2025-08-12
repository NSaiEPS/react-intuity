import * as React from "react";
import { boarderRadius } from "@/utils";
import Card from "@mui/material/Card";

// Lazy load the modal
const PayerTermsConditionsModal = React.lazy(
  () => import("@/components/dashboard/customer/payer-terms-conditions-modal")
);

export default function PaperLessPage(): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <React.Suspense fallback={null}>
        <PayerTermsConditionsModal />
      </React.Suspense>
    </Card>
  );
}
