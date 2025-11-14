import * as React from "react";

import {
  getInvoiceDetails,
  setDashboardLoader,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/CommonComponents/Button";
import { useSearchParams } from "react-router";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { InvoiceMainDetails } from "./Invoice-main-details-new";

export default function InvoiceDetails() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);

  // const raw = getLocalStorage('intuity-user');
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    //TODO: change here

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", id ?? "");

    dispatch(getInvoiceDetails(formData, token, setContextLoading));
  }, [id]);

  const pdfRef = React.useRef<HTMLDivElement>(null);

  // make sure you have these imports at top of the file
  // import html2canvas from "html2canvas";
  // import jsPDF from "jspdf";
  const handleDownloadPDF = async () => {
    dispatch(setDashboardLoader(true));

    const original = pdfRef.current;
    if (!original) {
      dispatch(setDashboardLoader(false));
      return;
    }

    // Clone content for PDF rendering
    const clone = original.cloneNode(true) as HTMLElement;

    // Force consistent layout
    Object.assign(clone.style, {
      width: "1024px",
      maxWidth: "1024px",
      height: "auto",
      padding: "24px",
      background: "#fff",
      position: "fixed",
      top: "0",
      left: "-9999px",
      zIndex: "-1",
      overflow: "visible",
      transform: "none",
      zoom: "1",
    });

    document.body.appendChild(clone);

    try {
      // Wait for render
      await new Promise((r) => setTimeout(r, 300));

      const fullHeight = Math.ceil(clone.getBoundingClientRect().height);
      clone.style.height = `${fullHeight}px`;

      // Detect device pixel ratio and normalize scale
      const dpr = window.devicePixelRatio || 1;
      const adjustedScale = dpr > 2 ? 1 / (dpr / 2) : 1; // e.g. iPhone DPR 3 → scale ~0.66

      const canvas = await html2canvas(clone, {
        scale: 2 * adjustedScale, // Normalize actual pixel size
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: 1024,
        windowHeight: fullHeight,
        width: 1024,
        height: fullHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const imgHeightMM = (imgHeightPx * pdfWidth) / imgWidthPx;
      const roundedHeight = Math.round(imgHeightMM * 100) / 100;

      // 🔒 If the height slightly exceeds A4, shrink it instead of creating a new page
      const adjustedHeight =
        roundedHeight > pdfPageHeight ? pdfPageHeight : roundedHeight;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, adjustedHeight);

      pdf.save("invoice.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      if (clone && clone.parentNode) document.body.removeChild(clone);
      dispatch(setDashboardLoader(false));
    }
  };

  return (
    <SkeletonWrapper>
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
          // onClick={onSubmit}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{
            borderRadius: "12px",
            height: "41px",
            marginBottom: "5px",
          }}
        >
          Download Invoice PDF
        </Button>
      </div>

      <div ref={pdfRef} id="print-section">
        <InvoiceMainDetails />
      </div>
    </SkeletonWrapper>
  );
}
