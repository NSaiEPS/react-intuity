import * as React from "react";
import { getInvoiceDetails } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { useDispatch, useSelector } from "@/hooks/redux";
import { toast } from "@/lib/custom-toast";
import { useLoading } from "@/components/core/skeleton-context";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;

  width?: string | number;
  id?: string;
  oneTime?: boolean;
};

export default function CustomModal({ onClose, id, oneTime }: ModalProps) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const oneTimeData = useSelector(
    (state: RootState) => state.Account.oneTimePaymentInfo
  );

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const { setContextLoading } = useLoading();

  type PdfComponents = {
    PDFDownloadLink: any;
    PDFViewer: any;
    InvoicePdfDocument: any;
    OneTimePdf: any;
  };
  const [pdfComponents, setPdfComponents] = React.useState<PdfComponents | null>(null);

  React.useEffect(() => {
    Promise.all([
      import("@react-pdf/renderer"),
      import("./invoice-pdf-view"),
      import("./one-time-invoice"),
    ]).then(([renderer, invoiceView, oneTimeInvoice]) => {
      setPdfComponents({
        PDFDownloadLink: renderer.PDFDownloadLink,
        PDFViewer: renderer.PDFViewer,
        InvoicePdfDocument: invoiceView.default,
        OneTimePdf: oneTimeInvoice.default,
      });
    });
  }, []);

  React.useEffect(() => {
    if (!id && !oneTime) {
      toast.error("Invalid ID");
    } else {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", id ?? "");
      if (!oneTime) {
        dispatch(getInvoiceDetails(formData, setContextLoading));
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
      <>
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
          {pdfComponents ? (
            <>
              <pdfComponents.PDFDownloadLink
                document={
                  <pdfComponents.InvoicePdfDocument
                    invoiceDetails={oneTime ? oneTimeData : invoiceDetails}
                  />
                }
                fileName={`invoice.pdf`}
              >
                {({ loading }: { loading: boolean }) => (loading ? "Preparing PDF..." : "")}
              </pdfComponents.PDFDownloadLink>

              <div style={{ height: "600px", marginTop: "20px" }}>
                <pdfComponents.PDFViewer width="1000px" height="600">
                  {oneTime ? (
                    <pdfComponents.OneTimePdf invoiceDetails={oneTimeData as any} />
                  ) : (
                    <pdfComponents.InvoicePdfDocument invoiceDetails={invoiceDetails} />
                  )}
                </pdfComponents.PDFViewer>
              </div>
            </>
          ) : (
            <div style={{ height: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span>Loading PDF viewer...</span>
            </div>
          )}
</div>
      </>
    </div>
  );
}
