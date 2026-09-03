import * as React from "react";
import {
  getInvoiceDetails,
  setDashboardLoader,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useSearchParams } from "react-router";
import { downloadInvoicePdf } from "@/utils/pdfHelper";

import Button from "@/components/CommonComponents/button-comp";
import { useLoading } from "@/components/core/skeleton-context";

import { InvoiceMainDetails } from "./InvoiceMainDetailsNew";

export default function InvoiceDetails() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const lastBillInfo = useSelector(
    (state: RootState) => state.Payment.lastBillInfo
  );
  const dashBoardInfo = useSelector(
    (state: RootState) => state.DashBoard.dashBoardInfo
  );

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  React.useEffect(() => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId || "");
    formData.append("customer_id", userId || "");
    formData.append("id", id ?? "");

    dispatch(getInvoiceDetails(formData, setContextLoading));
  }, [id, roleId, userId]);

  const pdfRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    dispatch(setDashboardLoader(true));

    try {
      const invoiceNumber =
        invoiceDetails?.last_bill?.[0]?.invoice_number ||
        invoiceDetails?.last_bill?.invoice_number ||
        lastBillInfo?.get_invoices?.[0]?.invoice_number ||
        lastBillInfo?.last_bill?.invoice_number;

      await downloadInvoicePdf({
        customerId: userId,
        invoiceNumber,
        invoiceDetails,
        lastBillInfo,
        dashBoardInfo,
        userInfo,
      });
    } catch (err) {
      console.error("Error downloading PDF from API, attempting client-side fallback:", err);
      // Client-side fallback if backend API is temporarily unreachable
      const original = pdfRef.current;
      if (!original) {
        dispatch(setDashboardLoader(false));
        return;
      }

      const clone = original.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        width: "1024px",
        maxWidth: "1024px",
        padding: "24px",
        background: "#fff",
        position: "absolute",
        top: "0",
        left: "-9999px",
        zIndex: "-1",
        overflow: "visible",
      });
      document.body.appendChild(clone);

      try {
        await new Promise((r) => setTimeout(r, 200));

        const [html2canvasModule, { default: jsPDF }] = await Promise.all([
          import("html2canvas").then((m) => m.default),
          import("jspdf"),
        ]);

        const fullHeight = clone.scrollHeight;
        clone.style.height = `${fullHeight}px`;

        const canvas = await html2canvasModule(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          windowWidth: clone.scrollWidth,
          windowHeight: fullHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgHeightMM = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeightMM;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightMM);
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position -= pdfPageHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightMM);
          heightLeft -= pdfPageHeight;
        }

        pdf.save("invoice.pdf");
      } catch (fallbackErr) {
        console.error("Fallback PDF generation failed:", fallbackErr);
      } finally {
        if (clone?.parentNode) document.body.removeChild(clone);
      }
    } finally {
      dispatch(setDashboardLoader(false));
    }
  };

  return (
    <>
      <div
        style={{
          marginLeft: "auto",
          maxWidth: "180px",
        }}
      >
        <Button
          onClick={handleDownloadPDF}
          type="button"
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{
            borderRadius: "12px",
            height: "41px",
          }}
        >
          Download Invoice PDF
        </Button>
      </div>

      <div ref={pdfRef} id="print-section">
        <InvoiceMainDetails />
      </div>
    </>
  );
}
