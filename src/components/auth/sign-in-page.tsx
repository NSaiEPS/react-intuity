import * as React from "react";
import Box from "@mui/material/Box";

import CompanyDetails from "./company-details";
import OneTimePaymentCard from "./register-slag";
import { Helmet } from "react-helmet";
import PdfViewer from "../dashboard/layout/invoice-pdf-view";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// import OneTimePaymentCard from '@/components/auth/register-slag';
// import { SignInForm } from '@/components/auth/sign-in-form';

export function SignInPage({ title }): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  const invoiceRef = React.useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  const handlePreview = async () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
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

  return (
    <>
      <div ref={invoiceRef} style={{ padding: 20, background: "#fff" }}>
        <Box
          sx={{
            // height: '100vh', // 🔥 important: fills full screen
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Helmet key={title}>
            <title>{title}</title>
          </Helmet>
          <Box
            sx={{
              marginTop: 5,
            }}
          >
            <OneTimePaymentCard />
          </Box>
          <Box
            sx={{
              marginTop: 5,
            }}
          >
            <CompanyDetails />
          </Box>
        </Box>
        <button onClick={handlePreview}>Preview Invoice PDF</button>
      </div>
      <PdfViewer open={open} onClose={() => setOpen(false)} fileUrl={pdfUrl} />
    </>
  );
}
