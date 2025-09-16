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

  const handleDownloadPDF = async () => {
    dispatch(setDashboardLoader(true));

    const original = pdfRef.current;
    if (!original) {
      dispatch(setDashboardLoader(false));
      return;
    }

    // Clone content
    const clone = original.cloneNode(true) as HTMLElement;

    // Force desktop look (disable breakpoints)
    clone.style.width = "1024px";
    clone.style.maxWidth = "1024px";
    clone.style.padding = "24px";
    clone.style.background = "#fff";
    clone.style.position = "fixed";
    clone.style.top = "-9999px"; // hide offscreen
    clone.style.left = "0";
    clone.style.zIndex = "-1";

    document.body.appendChild(clone);

    // Capture
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      windowWidth: 1024, // simulate desktop viewport
    });

    // Remove clone
    document.body.removeChild(clone);

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");

    dispatch(setDashboardLoader(false));
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
