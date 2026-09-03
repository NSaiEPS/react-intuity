import * as React from "react";
import { getInvoiceDetails } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { useDispatch, useSelector } from "@/hooks/redux";
import { toast } from "@/lib/custom-toast";
import { useLoading } from "@/components/core/skeleton-context";
import {
  fetchInvoicePdfBlobUrl,
  downloadFile,
  resolveInvoicePdfParams,
} from "@/utils/pdfHelper";
import { Loader } from "nsaicomponents";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  id?: string;
  invoiceNumber?: string;
  customerId?: number | string;
  companyId?: number | string;
  isGuestPage?: number | string | boolean;
  oneTime?: boolean;
};

export default function CustomModal({
  onClose,
  id,
  invoiceNumber,
  customerId,
  companyId,
  isGuestPage,
  oneTime,
}: ModalProps) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const dashBoardInfo = useSelector(
    (state: RootState) => state.DashBoard.dashBoardInfo
  );
  const lastBillInfo = useSelector(
    (state: RootState) => state.Payment.lastBillInfo
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

  // PDF Preview state for backend-generated PDF
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = React.useState<boolean>(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const lastFetchedKeyRef = React.useRef<string>("");

  // React-pdf fallback for one-time payments
  type PdfComponents = {
    PDFDownloadLink: any;
    PDFViewer: any;
    InvoicePdfDocument: any;
    OneTimePdf: any;
  };
  const [pdfComponents, setPdfComponents] = React.useState<PdfComponents | null>(null);

  // Load react-pdf components if oneTime payment
  React.useEffect(() => {
    if (oneTime) {
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
    }
  }, [oneTime]);

  // Fetch legacy invoice details only if invoiceNumber is not provided
  React.useEffect(() => {
    if (id && !invoiceNumber && !oneTime) {
      const formData = new FormData();
      formData.append("acl_role_id", roleId || "");
      formData.append("customer_id", userId || "");
      formData.append("id", id);
      dispatch(getInvoiceDetails(formData, setContextLoading));
    }
  }, [id, invoiceNumber, roleId, userId, oneTime]);

  // Fetch PDF from new API for authenticated flow (deduplicated)
  React.useEffect(() => {
    let revokeFn: (() => void) | null = null;
    let isCancelled = false;

    if (!oneTime) {
      const resolved = resolveInvoicePdfParams({
        customerId: customerId || userId,
        invoiceNumber,
        companyId,
        isGuestPage,
        lastBillInfo,
        invoiceDetails,
        dashBoardInfo,
        userInfo,
        oneTimeData,
      });

      if (!resolved.invoice_number) {
        console.warn("⚠️ [Invoice PDF] Invoice number could not be resolved from params:", {
          customerId,
          invoiceNumber,
          companyId,
          isGuestPage,
          userId,
          oneTimeData,
          lastBillInfo,
          invoiceDetails,
        });
        setPdfError("Invoice number is not available for this invoice.");
        return;
      }

      const fetchKey = `${resolved.customer_id}_${resolved.invoice_number}_${resolved.company_id}_${resolved.is_guest_page ?? ""}`;
      if (lastFetchedKeyRef.current === fetchKey) {
        return;
      }
      lastFetchedKeyRef.current = fetchKey;

      setPdfLoading(true);
      setPdfError(null);

      fetchInvoicePdfBlobUrl({
        customerId: resolved.customer_id,
        invoiceNumber: resolved.invoice_number,
        companyId: resolved.company_id,
        isGuestPage: resolved.is_guest_page,
        lastBillInfo,
        invoiceDetails,
        dashBoardInfo,
        userInfo,
        oneTimeData,
      })
        .then(({ url, revoke }) => {
          if (isCancelled) {
            revoke();
            return;
          }
          revokeFn = revoke;
          setPdfUrl(url);
          setPdfLoading(false);
        })
        .catch((err) => {
          if (isCancelled) return;
          console.error("Failed to load invoice PDF:", err);
          setPdfError(err?.message || "Failed to load invoice PDF");
          setPdfLoading(false);
        });
    }

    return () => {
      isCancelled = true;
      if (revokeFn) {
        revokeFn();
      }
    };
  }, [
    oneTime,
    invoiceNumber,
    customerId,
    companyId,
    isGuestPage,
    userId,
    lastBillInfo,
    dashBoardInfo,
    userInfo,
    oneTimeData,
  ]);


  const resolvedParams = React.useMemo(() => {
    return resolveInvoicePdfParams({
      customerId: customerId || userId,
      invoiceNumber,
      companyId,
      isGuestPage,
      lastBillInfo,
      invoiceDetails,
      dashBoardInfo,
      userInfo,
      oneTimeData,
    });
  }, [
    customerId,
    userId,
    invoiceNumber,
    companyId,
    isGuestPage,
    lastBillInfo,
    invoiceDetails,
    dashBoardInfo,
    userInfo,
    oneTimeData,
  ]);

  const handleDownload = () => {
    if (pdfUrl) {
      const fileName = `invoice-${resolvedParams.invoice_number || "file"}.pdf`;
      downloadFile(pdfUrl, fileName);
    }
  };

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
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          background: "#fff",
          borderRadius: "12px",
          padding: "24px 20px 20px 20px",
          maxWidth: "95vw",
          maxHeight: "90vh",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            background: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {oneTime ? (
          // One-Time / Guest Payment View
          pdfComponents ? (
            <>
              <pdfComponents.PDFDownloadLink
                document={
                  <pdfComponents.InvoicePdfDocument
                    invoiceDetails={oneTimeData}
                  />
                }
                fileName={`invoice-${oneTimeData?.last_bill?.invoice_number || "file"}.pdf`}
                style={{
                  color: "#0284c7",
                  fontWeight: 600,
                  textDecoration: "underline",
                  fontSize: "14px",
                  display: "inline-block",
                  marginBottom: "10px",
                }}
              >
                {({ loading }: { loading: boolean }) =>
                  loading ? "Preparing PDF..." : "Download PDF"
                }
              </pdfComponents.PDFDownloadLink>

              <div style={{ height: "600px", width: "1000px", maxWidth: "90vw" }}>
                <pdfComponents.PDFViewer width="100%" height="100%">
                  <pdfComponents.OneTimePdf invoiceDetails={oneTimeData as any} />
                </pdfComponents.PDFViewer>
              </div>
            </>
          ) : (
            <div
              style={{
                height: "600px",
                width: "1000px",
                maxWidth: "90vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>Loading PDF viewer...</span>
            </div>
          )
        ) : (
          // Authenticated Backend PDF View
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                Invoice {resolvedParams.invoice_number ? `#${resolvedParams.invoice_number}` : "Preview"}
              </span>

              {pdfUrl && !pdfLoading && (
                <button
                  onClick={handleDownload}
                  style={{
                    backgroundColor: "#0284c7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Download PDF
                </button>
              )}
            </div>

            <div
              style={{
                height: "600px",
                width: "1000px",
                maxWidth: "90vw",
                maxHeight: "75vh",
                background: "#f8fafc",
                borderRadius: "8px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {pdfLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <Loader />
                  <span style={{ fontSize: "14px", color: "#64748b" }}>Loading Invoice PDF...</span>
                </div>
              ) : pdfError ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: "8px" }}>
                    {pdfError}
                  </p>
                  <button
                    onClick={() => {
                      lastFetchedKeyRef.current = "";
                      setPdfLoading(true);
                      setPdfError(null);
                      fetchInvoicePdfBlobUrl({
                        customerId: resolvedParams.customer_id,
                        invoiceNumber: resolvedParams.invoice_number,
                        companyId: resolvedParams.company_id,
                        isGuestPage: resolvedParams.is_guest_page,
                        lastBillInfo,
                        invoiceDetails,
                        dashBoardInfo,
                        userInfo,
                        oneTimeData,
                      })
                        .then(({ url }) => {
                          setPdfUrl(url);
                          setPdfLoading(false);
                        })
                        .catch((err) => {
                          setPdfError(err?.message || "Failed to load invoice PDF");
                          setPdfLoading(false);
                        });
                    }}
                    style={{
                      backgroundColor: "#0284c7",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="Invoice PDF Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                    background: "#fff",
                  }}
                />
              ) : (
                <span style={{ fontSize: "14px", color: "#64748b" }}>
                  Preparing PDF preview...
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
