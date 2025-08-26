import * as React from "react";

import {
  getInvoiceDetails,
  setDashboardLoader,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { colors, formatToMMDDYYYY } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Button from "@/components/CommonComponents/Button";
import { useSearchParams } from "react-router";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { InvoiceMainDetails } from "./Invoice-main-details";
import PdfViewer from "../layout/invoice-pdf-view";

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

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  React.useEffect(() => {
    //TODO: change here
    if (false) {
      toast.error("Invalid ID");
    } else {
      const formData = new FormData();

      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);
      formData.append("id", id ?? "");

      dispatch(getInvoiceDetails(formData, token, setContextLoading));
    }
  }, [id]);

  const {
    company,
    company_settings,
    customer,
    unique_by_utility = {},

    last_bill = [],
    extra_params = [],
    //   } = InvoiceDetails?.body ?? {};
  } = invoiceDetails ?? {};

  const pdfRef = React.useRef<HTMLDivElement>(null);

  // const handleDownloadPDF = async () => {
  //   dispatch(setDashboardLoader(true));

  //   // window.print();
  //   // return;

  //   const input = pdfRef.current;
  //   if (!input) {
  //     dispatch(setDashboardLoader(false));

  //     return;
  //   }

  //   const canvas = await html2canvas(input, { scale: 2 });
  //   const imgData = canvas.toDataURL('image/png');

  //   const pdf = new jsPDF('p', 'mm', 'a4');

  //   const imgProps = pdf.getImageProperties(imgData);
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  //   dispatch(setDashboardLoader(false));

  //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //   pdf.save(`invoice_${customer?.customer_name || 'customer'}.pdf`);
  // };

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

  // const handleDownloadPDF = async () => {
  //   dispatch(setDashboardLoader(true));

  //   const input = pdfRef.current;
  //   if (!input) {
  //     dispatch(setDashboardLoader(false));
  //     return;
  //   }

  //   // Clone node & force desktop width
  //   const clonedElement = input.cloneNode(true) as HTMLElement;
  //   clonedElement.style.width = '1224px'; // Force desktop view
  //   clonedElement.style.maxWidth = '1224px';
  //   clonedElement.style.position = 'absolute';
  //   clonedElement.style.top = '-9999px'; // Hide off-screen
  //   clonedElement.style.left = '0';
  //   clonedElement.style.zIndex = '-1';
  //   document.body.appendChild(clonedElement);

  //   // Capture desktop view
  //   const canvas = await html2canvas(clonedElement, {
  //     scale: 2, // High resolution
  //     useCORS: true,
  //   });

  //   document.body.removeChild(clonedElement); // Cleanup

  //   const imgData = canvas.toDataURL('image/png');
  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //   pdf.save(`invoice_${invoiceDetails?.customer?.customer_name || 'customer'}.pdf`);

  //   dispatch(setDashboardLoader(false));
  // };
  const [open, setOpen] = React.useState(false);

  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  const handlePreview = async () => {
    if (!pdfRef.current) return;

    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setOpen(true);
  };

  React.useEffect(() => {
    handlePreview();
  }, []);
  return (
    <SkeletonWrapper>
      {/* <Button variant="contained" onClick={handleDownloadPDF} sx={{ mb: 2 }}>
        Download Invoice PDF
      </Button> */}
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
      <button onClick={handlePreview}>Preview Invoice PDF</button>

      <PdfViewer open={open} onClose={() => setOpen(false)} fileUrl={pdfUrl} />
    </SkeletonWrapper>
  );
}
