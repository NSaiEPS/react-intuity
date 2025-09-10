import * as React from "react";
import { colors } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import { useLoading } from "@/components/core/skeletion-context";
import { getInvoiceDetails } from "@/state/features/dashBoardSlice";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import InvoicePdfDocument from "./invoice-pdf-view";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { toast } from "react-toastify";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;

  width?: string | number;
  id?: string;
};

export default function CustomModal({
  open,
  onClose,
  title,
  children,
  width = "800px",
  id,
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
    if (!id) {
      toast.error("Invalid ID");
    } else {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", id ?? "");

      dispatch(getInvoiceDetails(formData, token, setContextLoading));
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
      onClick={onClose}
    >
      <SkeletonWrapper customLoader={dashboardLoader}>
        <>
          <PDFDownloadLink
            document={<InvoicePdfDocument invoiceDetails={invoiceDetails} />}
            fileName={`invoice_${"customer"}.pdf`}
          >
            {({ loading }) =>
              loading ? "Preparing PDF..." : "⬇️ Download Invoice PDF"
            }
          </PDFDownloadLink>

          <div style={{ height: "600px", marginTop: "20px" }}>
            <PDFViewer width="'100%" height="600">
              <InvoicePdfDocument invoiceDetails={invoiceDetails} />
            </PDFViewer>
          </div>
        </>
      </SkeletonWrapper>
    </div>
  );
}
