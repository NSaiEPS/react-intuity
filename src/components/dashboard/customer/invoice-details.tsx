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
import { InvoiceMainDetails } from "./Invoice-main-details";

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

  // Create clone and style it for desktop capture
  const clone = original.cloneNode(true) as HTMLElement;
  clone.style.width = "1024px";
  clone.style.maxWidth = "1024px";
  clone.style.padding = "24px";
  clone.style.background = "#fff";
  clone.style.position = "fixed";
  clone.style.top = "-9999px";
  clone.style.left = "0";
  clone.style.zIndex = "-1";
  // ensure full height (important)
  clone.style.height = `${(original as HTMLElement).scrollHeight}px`;

  document.body.appendChild(clone);

  try {
    // Give browser a tick to render off-screen clone (helps html2canvas)
    await new Promise((r) => setTimeout(r, 120));

    // Capture the clone to a canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // 2 gives good quality without exploding memory in most cases
      useCORS: true,
      windowWidth: 1024,
      // scrollY: -window.scrollY, // optional
    });

    // Small safety pause so canvas finishes encoding (helps avoid corrupt PNG)
    await new Promise((r) => setTimeout(r, 200));

    // Convert to image data
    const imgData = canvas.toDataURL("image/png");

    // Create PDF and compute sizes
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();

    // computed image height in pdf units (mm)
    const imgProps = {
      widthPx: canvas.width,
      heightPx: canvas.height,
    };
    const imgHeightInPdfUnits = (imgProps.heightPx * pdfWidth) / imgProps.widthPx;

    // Add image(s) to PDF handling multi-page by offsetting
    let position = 0;
    let heightLeft = imgHeightInPdfUnits;

    // first page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightInPdfUnits);
    heightLeft -= pdfPageHeight;

    // additional pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeightInPdfUnits;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightInPdfUnits);
      heightLeft -= pdfPageHeight;
    }

    // Save PDF (you can set filename dynamically)
    pdf.save(`invoice.pdf`);
  } catch (err) {
    console.error("Error generating PDF:", err);
    // Optional: show a user-friendly message
    alert("Failed to generate PDF. Please try again.");
  } finally {
    // Remove clone (if still present) and stop loader
    if (clone && clone.parentNode) {
      document.body.removeChild(clone);
    }
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
