// import { useMemo, useState } from "react";
// import {
//   Box,
//   Dialog,
//   DialogTitle,
//   IconButton,
//   Typography,
// } from "@mui/material";
// import { X } from "@phosphor-icons/react";
// import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
// import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
// import { DownloadSimple } from "@phosphor-icons/react/dist/ssr/DownloadSimple";
// import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
// import { Minus } from "@phosphor-icons/react/dist/ssr/Minus";
// import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
// import { Printer } from "@phosphor-icons/react/dist/ssr/Printer";
// import { colors } from "@/utils";
// import { Document, Page, pdfjs } from "react-pdf";
// import { InvoiceMainDetails } from "../customer/Invoice-main-details";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// interface PdfViewProps {
//   open: boolean;
//   onClose: () => void;
//   fileUrl: string | null;
// }

// export default function PdfViewer({ open, onClose, fileUrl }: PdfViewProps) {
//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1.0);

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//     setPageNumber(1);
//   };

//   // return (
//   //   <Dialog open={open} maxWidth="sm" fullWidth>
//   //     <DialogTitle sx={{ m: 0, p: 2 }}>
//   //       Invoice Preview
//   //       <IconButton
//   //         aria-label="close"
//   //         onClick={onClose}
//   //         sx={{
//   //           position: "absolute",
//   //           right: 13,
//   //           top: 8,
//   //           color: (theme) => theme.palette.grey[500],
//   //         }}
//   //       >
//   //         <X size={24} color={colors.blue} />
//   //       </IconButton>
//   //     </DialogTitle>
//   //     <Box
//   //       sx={{
//   //         width: "100%",
//   //         maxWidth: "900px",
//   //         mx: "auto",
//   //         textAlign: "center",
//   //         p: 2,
//   //       }}
//   //     >
//   //       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//   //         <Box>
//   //           <IconButton onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
//   //             <Minus size={20} />
//   //           </IconButton>
//   //           <Typography component="span" sx={{ mx: 1 }}>{`${Math.round(
//   //             scale * 100
//   //           )}%`}</Typography>
//   //           <IconButton onClick={() => setScale(scale + 0.1)}>
//   //             <Plus size={20} />
//   //           </IconButton>
//   //         </Box>

//   //         <Box>
//   //           <IconButton>
//   //             <MagnifyingGlass size={20} />
//   //           </IconButton>
//   //           <IconButton
//   //           onClick={handleDownload}
//   //           >
//   //             <DownloadSimple size={20} />
//   //           </IconButton>
//   //           <IconButton onClick={() => window.print()}>
//   //             <Printer size={20} />
//   //           </IconButton>
//   //         </Box>
//   //       </Box>

//   //       {renderDocument}

//   //       <Box
//   //         sx={{
//   //           mt: 2,
//   //           display: "flex",
//   //           justifyContent: "center",
//   //           alignItems: "center",
//   //         }}
//   //       >
//   //         <IconButton
//   //           onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
//   //           disabled={pageNumber <= 1}
//   //         >
//   //           <ArrowLeft size={20} />
//   //         </IconButton>
//   //         <Typography sx={{ mx: 2 }}>
//   //           Page {pageNumber} of {numPages}
//   //         </Typography>
//   //         <IconButton
//   //           onClick={() => setPageNumber((p) => Math.min(p + 1, numPages!))}
//   //           disabled={pageNumber >= (numPages ?? 1)}
//   //         >
//   //           <ArrowRight size={20} />
//   //         </IconButton>
//   //       </Box>
//   //     </Box>
//   //   </Dialog>
//   // );

//   return (
//     <Dialog open={open} maxWidth="md" fullWidth>
//       <DialogTitle>
//         Invoice Preview
//         <IconButton
//           aria-label="close"
//           onClick={onClose}
//           sx={{ position: "absolute", right: 13, top: 8 }}
//         >
//           <X size={24} />
//         </IconButton>
//       </DialogTitle>

//       {fileUrl && (
//         <iframe
//           src={fileUrl}
//           style={{ width: "100%", height: "80vh", border: "none" }}
//           title="PDF Preview"
//         />
//       )}

//       <Box
//         sx={{
//           width: "100%",
//           maxWidth: "900px",
//           mx: "auto",
//           textAlign: "center",
//           p: 2,
//           overflowY: "auto",
//           maxHeight: "80vh",
//           bgcolor: "#fff",
//         }}
//       >
//         {/* 👇 Render the same invoice UI here */}
//         {/* <InvoiceMainDetails /> */}
//       </Box>
//     </Dialog>
//   );
// }

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// PDF styles (replace sx with StyleSheet rules)
const styles = StyleSheet.create({
  section1: {
    padding: 12,
    border: "1pt solid black",
    marginBottom: 12,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  table: {
    // display: "table",
    width: "100%",
    border: "1pt solid black",
    borderCollapse: "collapse",
    marginTop: 8,

    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    padding: 6,
    borderRight: "1pt solid black",
    borderBottom: "1pt solid black",
    fontSize: 10,
  },
  headerCell: {
    flex: 1,
    padding: 6,
    borderRight: "1pt solid black",
    borderBottom: "1pt solid black",
    backgroundColor: "#dbeafe", // light blue
    fontWeight: "bold",
    fontSize: 11,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#dbeafe",
    padding: 6,
    marginBottom: 8,
  },
  smallText: {
    fontSize: 10,
  },
  page: {
    padding: 24,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#F7F7F7",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subHeadline: {
    fontSize: 10,
    color: "#666",
  },
  rightHeader: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#aaa",
    marginBottom: 8,
  },
  invoiceBox: {
    backgroundColor: "#38699C",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    maxWidth: 200,
    alignSelf: "flex-end",
  },
  section: {
    marginVertical: 10,
  },
  label: {
    fontSize: 10,
    color: "#777",
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // table: {
  //   width: "100%",
  //   borderWidth: 1,
  //   borderColor: "#ddd",
  //   marginVertical: 8,
  // },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 12,
  },
  tableHeader: {
    backgroundColor: "#eaeaea",
    fontWeight: "bold",
  },
  totalBox: {
    backgroundColor: "#38699C",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    textAlign: "right",
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 10,
    fontSize: 10,
    color: "#444",
    textAlign: "center",
  },
});

export default function InvoicePdfDocument({
  invoiceDetails,
}: {
  invoiceDetails: any;
}) {
  const {
    company,
    company_settings,
    customer,
    unique_by_utility = {},
    last_bill = [],
    extra_params = [],
  } = invoiceDetails || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{company?.company_name}</Text>
            <Text style={styles.subHeadline}>
              {company_settings?.invoice_subheadline}
            </Text>
          </View>
          <View style={styles.rightHeader}>
            <Text>{company_settings?.invoice_text_header_email}</Text>
            <Text>{company_settings?.invoice_text_header_open}</Text>
            <Text>
              {company_settings?.invoice_text_header_web} {"\n"}
              {company_settings?.direct_debit}
            </Text>
          </View>
        </View>

        {/* Invoice Title + Box */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>INVOICE TO</Text>
            <Text style={styles.value}>{customer?.customer_name}</Text>
            <Text>
              {customer?.address}, {customer?.city}
            </Text>
            <Text>Email: {customer?.email}</Text>
            <Text>Phone: {customer?.phone}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceBox}>
              <Text>Invoice Date: {last_bill?.[0]?.billing_date}</Text>
              <Text>Total Due: ${last_bill?.[0]?.amount}</Text>
            </View>
          </View>
        </View>

        {/* Items by Utility */}
        {Object.entries(unique_by_utility).map(([key, items]: any) => {
          const [utilityName, , meterNumber, ...addressParts] = key.split(";");
          const serviceAddress = addressParts.join(";");
          const utilityDetails = items?.[0] ?? {};

          return (
            <View key={key} style={styles.section}>
              <Text style={styles.value}>Item Description</Text>
              <Text>
                {utilityName} - {meterNumber} - {serviceAddress}
              </Text>

              {/* Table */}
              <View style={styles.table}>
                {items.map((item: any, idx: number) => (
                  <View style={styles.tableRow} key={idx}>
                    <Text style={[styles.tableCell, styles.tableHeader]}>
                      {item.product_id}
                    </Text>
                    <Text style={styles.tableCell}>
                      ${item.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Utility Info */}
              <View style={styles.section}>
                <Text>Service Address: {utilityDetails.service_address}</Text>
                <Text>
                  From: {utilityDetails?.start_date} To:{" "}
                  {utilityDetails?.end_date}
                </Text>
                <Text>Days: {utilityDetails.consumption_days}</Text>
                <Text>
                  Meter Start: {utilityDetails.previous_reading} / End:{" "}
                  {utilityDetails.current_reading}
                </Text>
                <Text>
                  Usage (Gallons): {utilityDetails.consumption} (Meter #{" "}
                  {utilityDetails.meter_number})
                </Text>
              </View>
            </View>
          );
        })}

        {/* Previous Balance */}
        {extra_params.map((item: any, idx: number) => (
          <View key={idx} style={styles.section}>
            <Text>PREVIOUS BALANCE: ${item.amount}</Text>
          </View>
        ))}

        {/* Total Box */}
        <View style={styles.totalBox}>
          <Text>Total Due: ${last_bill?.[0]?.amount}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{company_settings?.invoice_footer_column_3}</Text>
        </View>

        {/* //footer */}
        <View style={styles.section1}>
          {/* Invoice Number */}
          <Text style={styles.smallText}>
            Invoice#:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {last_bill?.[0]?.invoice_number}
            </Text>
          </Text>

          {/* Instruction */}
          <Text style={[styles.smallText, { marginTop: 6 }]}>
            Please detach and return with your payment. Make Checks Payable to:
            <Text style={{ fontWeight: "bold" }}> {company?.company_name}</Text>
          </Text>

          {/* Checkbox + Email row */}
          <View style={styles.inline}>
            <Text style={[styles.smallText, { marginRight: 4 }]}>☐</Text>
            <Text style={styles.smallText}>
              I would like to go paperless. Here is my email address:
              _____________________
            </Text>
          </View>

          {/* Left Column (Customer + Bill Payment) */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>
              {customer?.customer_name}
            </Text>
            <Text style={styles.smallText}>{customer?.address}</Text>

            <Text style={styles.title}>BILL PAYMENT</Text>

            <Text style={{ fontWeight: "bold", fontSize: 12 }}>
              {company?.company_name}
            </Text>
            <Text style={styles.smallText}>
              {company?.city} {company?.street ? `, ${company?.street},` : ""}
              {company?.zip ? ` ${company?.zip}` : ""}
            </Text>
          </View>

          {/* Right Column (Table) */}
          <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.row}>
              <Text style={styles.headerCell}>ACCOUNT NUMBER</Text>
              <Text style={styles.headerCell}>DUE DATE</Text>
              <Text style={[styles.headerCell, { borderRight: "none" }]}>
                AMOUNT DUE
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>{customer?.acctnum}</Text>
              <Text style={styles.cell}>{last_bill?.[0]?.due_date}</Text>
              <Text style={[styles.cell, { borderRight: "none" }]}>
                ${last_bill?.[0]?.amount}
              </Text>
            </View>

            {/* Second Header Row */}
            <View style={styles.row}>
              <Text style={styles.headerCell}>BILL DATE</Text>
              <Text style={styles.headerCell}>LATE DATE</Text>
              <Text style={[styles.headerCell, { borderRight: "none" }]}>
                LATE AMOUNT
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>{last_bill?.[0]?.billing_date}</Text>
              <Text style={styles.cell}>{last_bill?.[0]?.late_date}</Text>
              <Text style={[styles.cell, { borderRight: "none" }]}>
                $
                {(
                  last_bill?.[0]?.amount + last_bill?.[0]?.late_date_amount
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
