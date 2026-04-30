import * as React from "react";
import { getInvoiceDetails } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/lib/custom-toast";
import OneTimePdf from "./one-time-invoice";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";

import InvoicePdfDocument from "./invoice-pdf-view";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;

  width?: string | number;
  id?: string;
  oneTime?: boolean;
};

export default function CustomModal({
  open,
  onClose,
  title,

  width = "800px",
  id,
  oneTime,
}: ModalProps) {
  const dispatch = useDispatch();

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const dashboardLoader = useSelector(
    (state: RootState) => state.DashBoard.dashboardLoader
  );
  const oneTimeData = useSelector(
    (state: RootState) => state.Account.oneTimePaymentInfo
  );

  // const raw = getLocalStorage('intuity-user');
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const { setContextLoading } = useLoading();

  //   React.useLayoutEffect(() => {
  //     setContextLoading(true);
  //   }, []);
  React.useEffect(() => {
    //TODO: change here
    if (!id && !oneTime) {
      toast.error("Invalid ID");
    } else {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", id ?? "");
      if (!oneTime) {
        dispatch(getInvoiceDetails(formData, token, setContextLoading));
      }
    }
  }, [id]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
      // onClick={onClose}
    >
      <SkeletonWrapper customLoader={dashboardLoader}>
   <div
        style={{ position: "relative", display: "inline-block" }}
        onClick={(e) => e.stopPropagation()}
      >
         <button
        onClick={(e) => {
          e.stopPropagation(); // prevent backdrop click
          onClose();
        }}
        style={{
            position: "absolute",
            top: "35px",
            right: "-45px",
            background: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
      >
        ✕
      </button>
          <PDFDownloadLink
            document={
              <InvoicePdfDocument
                invoiceDetails={oneTime ? oneTimeData : invoiceDetails}
              />
            }
            fileName={`invoice.pdf`}
          >
            {({ loading }) => (loading ? "Preparing PDF..." : "")}
          </PDFDownloadLink>

          <div style={{ height: "600px", marginTop: "20px" }}>
            <PDFViewer width="1000px" height="600">
              {oneTime ? (
                <OneTimePdf invoiceDetails={oneTimeData} />
              ) : (
                <InvoicePdfDocument invoiceDetails={invoiceDetails} />
              )}
            </PDFViewer>
          </div>
</div>
      </SkeletonWrapper>
    </div>
  );
}
