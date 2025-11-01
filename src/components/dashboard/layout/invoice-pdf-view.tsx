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

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// PDF styles (replace sx with StyleSheet rules)
const styles1 = StyleSheet.create({
  section1: {
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#f9f9f9",
    marginTop: 6,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  table: {
    width: "100%",
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
    fontSize: 10,
  },
  headerCell: {
    flex: 1,
    padding: 6,
    backgroundColor: "#dbeafe",
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
    paddingTop: "10px",
    fontStyle: "normal",
    fontWeight: "bold",
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

  /* 🔽 Detachable Stub Section */
  bottomStub: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#000",
  },
  instruction: {
    fontSize: 10,
    marginBottom: 6,
  },
  updateSection: {
    marginTop: 8,
  },
  underlineField: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginVertical: 3,
    width: "90%",
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rightBox: {
    width: "45%",
  },
  checkBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    marginTop: 6,
  },
  companyCustomerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  column: {
    width: "48%",
  },
  italicSmall: {
    fontSize: 9,
    fontStyle: "italic",
  },

  /* 🔽 Payment Table Section */
  rightCol: {
    width: "50%",
    alignSelf: "flex-end",
  },
  payTable: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 6,
  },
  payRowHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  payRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  payCellHeader: {
    flex: 1,
    paddingVertical: 4,
    paddingLeft: 10, // left spacing
    fontSize: 10,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderColor: "#000",
    textAlign: "left",
    backgroundColor: "#dbeafe",
    flexWrap: "nowrap", // ✅ prevents text wrapping
    overflow: "hidden", // ✅ keeps layout clean
  },

  payCell: {
    flex: 1,
    paddingVertical: 4,
    paddingLeft: 10,
    fontSize: 10,
    borderRightWidth: 1,
    borderColor: "#000",
    textAlign: "left",
    flexWrap: "nowrap", // ✅ keeps all words in a single line
    overflow: "hidden",
  },

  /* ✅ Clean Check + Invoice Section */
  checkContainer: {
    borderWidth: 1,
    borderColor: "#000",
    width: "50%",
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "#fff",
    borderBottomColor: "#fff",
  },

  checkContainerInvoice: {
    borderWidth: 1,
    borderColor: "#000",
    width: "50%",
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "#fff",
  },

  checkContainer1: {
    borderWidth: 1,
    borderColor: "#fcf9f9",
    width: "50%",
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "#ffffff",
  },
  invoiceBlock: {
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#f5f5f5",
  },
  invoiceLabel: {
    fontSize: 9,
  },
  invoiceValue: {
    fontWeight: "bold",
    fontSize: 9,
  },
  checkRow: {
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  checkLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
    lineHeight: 1.2,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  companyCol: { width: "55%" },
  rightHeaderCol: { width: "40%", textAlign: "right" },
  companyName: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  subHeadline: { fontSize: 10, color: "#888", marginBottom: 2 },
  rightHeaderText: { fontSize: 10, color: "#888" },

  // Invoice / InvoiceBox
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  invoiceToCol: { width: "65%" },
  invoiceBoxCol: { width: "33%", alignItems: "flex-end" },

  invoiceTitle: {
    fontSize: 34,
    color: "#aaa",
    fontWeight: "700",
    letterSpacing: 1,
  },
  invoiceBox: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#38699C",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
  },
  invoiceBoxLabel: { fontSize: 11, color: "#fff" },
  invoiceBoxValue: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Item Description / table
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
    color: "#0B3D91",
  },
  utilityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#38699C",
    marginBottom: 6,
  },

  tableRow: { flexDirection: "row", paddingVertical: 6, alignItems: "center" },
  tableCellLeft: { width: "70%", fontSize: 12, fontWeight: "600" },
  tableCellRight: { width: "30%", fontSize: 12, textAlign: "right" },
  rowStrip: { backgroundColor: "#E9F5FF" },

  // box under items (service address + dates + meter readings etc)
  detailBox: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailCol1: { width: "30%" },
  detailCol2: { width: "20%" },
  detailCol3: { width: "30%" },
  detailCol4: { width: "20%" },
  detailSubtitle: { fontSize: 10, color: "#666", marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: "600" },

  // previous balance and totals
  prevBalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  totalBox: {
    alignSelf: "flex-end",
    width: 150,
    backgroundColor: "#38699C",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  subTotalBox: {
    alignSelf: "flex-end",
    width: 150,
    backgroundColor: "#3377c0ff",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  totalText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "right",
  },

  // autopay / warning
  autopayText: {
    color: "red",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "right",
    marginTop: 6,
  },

  // divider/dashes
  dashed: {
    textAlign: "center",
    marginVertical: 8,
    color: "#999",
    fontSize: 10,
    maxWidth: "100%",
    overflow: "hidden",
  },

  // bottom paper / paystub
  paper: {
    marginTop: 8,
    padding: 10,
    //  borderWidth: 1,
    backgroundColor: "#fff",
  },
  invoiceNumberBox: {
    borderWidth: 1,
    borderColor: "#000",
    // display: "inline-block",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  paySplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  leftCol: { width: "48%" },
  rightCol: { width: "48%" },

  billPaymentTitleBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 2,
    marginBottom: 8,
    width: "100%",
  },
  billPaymentInnerTitle: {
    backgroundColor: "#E9F5FF",
    color: "#000",
    fontWeight: "900",
    padding: 6,
    textAlign: "center",
  },

  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  checkboxChar: { fontSize: 12, marginRight: 6 },

  // right payment table
  payTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderCollapse: "collapse",
  },
  // payRowHeader: {
  //   flexDirection: 'row',
  //   backgroundColor: '#E9F5FF',
  //   borderBottomWidth: 1,
  //   borderColor: '#000',
  // },
  // payCellHeader: {
  //   flex: 1,
  //   padding: 6,
  //   fontSize: 10,
  //   fontWeight: '700',
  //   textAlign: 'center',
  //   borderRightWidth: 1,
  //   borderColor: '#000',
  // },
  // payCell: {
  //   flex: 1,
  //   padding: 6,
  //   fontSize: 10,
  //   textAlign: 'center',
  //   borderRightWidth: 1,
  //   borderColor: '#000',
  // },
  // payCellLast: { flex: 1, padding: 6, fontSize: 10, textAlign: 'center' },

  // footer
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  lastPaymentText: { fontSize: 10, color: "#444" },
  payRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  payRowHeader: {
    flexDirection: "row",
    backgroundColor: "#E9F5FF",
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  // no borderRight here
});
const formatDate = (val?: any) => {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};
const money = (n?: any) =>
  n == null || n === "" ? "-" : `$${Number(n).toFixed(2)}`;

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
  const billing = last_bill?.[0];
  return (
    <Document>
      <Page size="A4" style={styles1.page}>
        <View style={styles.headerRow}>
          <View style={styles.companyCol}>
            <Text style={styles.companyName}>
              {company?.company_name || ""}
            </Text>
            <Text style={styles.subHeadline}>
              {company_settings?.invoice_subheadline || ""}
            </Text>
          </View>

          <View style={styles.rightHeaderCol}>
            <Text style={styles.rightHeaderText}>
              {company_settings?.invoice_text_header_email || ""}
            </Text>
            <Text style={styles.rightHeaderText}>
              {company_settings?.invoice_text_header_open || ""}
            </Text>
            <Text style={styles.rightHeaderText}>
              {company_settings?.invoice_text_header_web || ""}
              {"\n"}
              {company_settings?.direct_debit || ""}
            </Text>
          </View>
        </View>

        {/* Invoice + Total Due */}
        <View style={styles.invoiceRow}>
          <View style={styles.invoiceToCol}>
            <Text style={{ fontSize: 10, color: "#777", marginBottom: 4 }}>
              INVOICE TO
            </Text>
            <Text style={{ fontWeight: "700", fontSize: 12 }}>
              {customer?.customer_name || ""}
            </Text>
            <Text style={{ fontSize: 10 }}>
              {customer?.address
                ? `Billing address: ${customer.address}, ${customer.city || ""}`
                : ""}
            </Text>
            <Text style={{ fontSize: 10, color: "#666" }}>
              Email: {customer?.email || ""}
            </Text>
            <Text style={{ fontSize: 10, color: "#666" }}>
              Phone: {customer?.phone || ""}
            </Text>
          </View>

          <View style={styles.invoiceBoxCol}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceBox}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={styles.invoiceBoxLabel}>Invoice Date:</Text>
                <Text style={styles.invoiceBoxValue}>
                  {formatDate(billing?.billing_date)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.invoiceBoxLabel}>Total Due:</Text>
                <Text style={styles.invoiceBoxValue}>
                  {money(billing?.amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Item Descriptions (per utility) */}
        {Object.entries(unique_by_utility || {}).map(
          ([key, items]: any, uIdx: number) => {
            const [utilityName = "", , meterNumber = "", ...addressParts] =
              String(key).split(";");
            const serviceAddress = addressParts.join(";");
            const utilityDetails = items?.[0] ?? {};
            const subtotal = items.reduce(
              (acc, item) => acc + (item?.amount || 0),
              0
            );

            return (
              <View
                key={String(key) + uIdx}
                wrap={false}
                style={{ marginTop: 8 }}
              >
                <Text style={styles.sectionTitle}>Item Description</Text>
                <Text style={styles.utilityTitle}>
                  <Text style={{ fontWeight: "700" }}>{utilityName}</Text>
                  {meterNumber ? ` - ${meterNumber}` : ""}{" "}
                  {serviceAddress ? ` - ${serviceAddress}` : ""}
                </Text>

                {/* Items table (product_id + amount) */}
                <View style={{ marginTop: 4 }}>
                  {items.map((item: any, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.tableRow,
                        idx % 2 === 1 ? styles.rowStrip : {},
                      ]}
                    >
                      <Text style={styles.tableCellLeft}>
                        {item?.product_id || ""}
                      </Text>
                      <Text style={styles.tableCellRight}>
                        {money(item?.amount)}
                      </Text>
                    </View>
                  ))}
                  {/* <View
                    style={[
                      styles.tableRow,
                      styles.rowStrip,
                      {
                        marginTop: 6,
                      },
                    ]}
                  >
                    <Text style={styles.tableCellLeft}>Subtotal</Text>
                    <Text style={styles.tableCellRight}>{money(subtotal)}</Text>
                  </View> */}
                  <View style={styles.subTotalBox}>
                    <Text style={styles.totalText}>
                      Subtotal: {money(subtotal)}
                    </Text>
                  </View>

                  {/* The special boxed detail (the MUI TableRow -> Box you pointed out) */}
                  <View style={{ marginTop: 6 }}>
                    <View style={styles.detailBox}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailCol1}>
                          <Text style={styles.detailSubtitle}>
                            {utilityName} Service at
                          </Text>
                          <Text style={styles.detailValue}>
                            {utilityDetails?.service_address || ""}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "600",
                              marginTop: 4,
                            }}
                          >
                            From: {formatDate(utilityDetails?.start_date)}
                            {"\n"}To: {formatDate(utilityDetails?.end_date)}
                          </Text>
                        </View>

                        <View style={styles.detailCol2}>
                          <Text style={styles.detailSubtitle}>
                            Number of Days
                          </Text>
                          <Text style={styles.detailValue}>
                            {utilityDetails?.consumption_days ?? "-"}
                          </Text>
                        </View>

                        <View style={styles.detailCol3}>
                          <Text style={styles.detailSubtitle}>
                            Meter Readings
                          </Text>
                          <Text style={styles.detailValue}>
                            Start: {utilityDetails?.previous_reading ?? "-"}
                            {"\n"}End: {utilityDetails?.current_reading ?? "-"}
                          </Text>
                        </View>

                        <View style={styles.detailCol4}>
                          <Text style={styles.detailSubtitle}>
                            Usage in Gallons
                          </Text>
                          <Text style={{ fontSize: 10, marginBottom: 4 }}>
                            Meter #: {utilityDetails?.meter_number ?? "-"}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: "700" }}>
                            {utilityDetails?.consumption ?? "-"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          }
        )}

        {/* Previous Balance */}
        {Array.isArray(extra_params) &&
          extra_params.map((it: any, i: number) => (
            <View key={i} style={styles.prevBalRow}>
              <Text style={{ fontWeight: "700", color: "#666" }}>
                PREVIOUS BALANCE
              </Text>
              <Text style={{ fontWeight: "700", color: "#666" }}>
                {money(it?.amount)}
              </Text>
            </View>
          ))}

        {/* Total Due Box */}
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>
            Total Due: {money(billing?.amount)}
          </Text>
        </View>

        {/* Autopay do not pay text */}
        {customer?.autopay ? (
          <View>
            <Text style={styles.autopayText}>
              {invoiceDetails?.autopay_do_not_pay_text || ""}
            </Text>
          </View>
        ) : null}
        {/* Footer: last payment info + company footer */}
        <View style={styles.footerRow}>
          <Text style={styles.lastPaymentText}>
            {billing?.last_payment_info || ""}
          </Text>
          <Text style={styles.lastPaymentText}>
            {company_settings?.invoice_footer_column_3 || ""}
          </Text>
        </View>
        {/* Divider */}
        <Text style={styles.dashed}>{"- ".repeat(90)}</Text>

        {/* Bottom Paper / Payment stub */}
        {/* --- Detachable Payment Stub Section (New Fields) --- */}
        <View style={styles1.bottomStub}>
          {/* Instruction */}
          <Text style={styles1.instruction}>
            Please detach and return with your payment. Make Checks Payable to:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {company?.company_name || ""}
            </Text>
          </Text>

          {/* Update Info + Payment Table (Side by Side) */}
          <View style={styles1.twoCol}>
            {/* LEFT: Update Info */}
            <View style={{ width: "50%" }}>
              <View style={styles1.updateSection}>
                <Text style={{ fontSize: "10px" }}>
                  Update Account information:
                </Text>
                <Text style={{ fontSize: "10px" }}>
                  I would like to go paperless (email to):
                  ___________________________
                </Text>
                <Text style={styles1.smallText}>
                  Update My Address:
                  ____________________________________________
                </Text>
                <Text style={styles1.smallText}>
                  Update My Phone #:
                  ____________________________________________
                </Text>
              </View>
            </View>

            {/* RIGHT: Payment Table */}
            <View style={styles1.rightCol}>
              <View style={styles1.payTable}>
                {/* Header row 1 */}
                <View style={styles1.payRowHeader}>
                  <Text style={styles1.payCellHeader}>ACCOUNT NUMBER</Text>
                  <Text style={styles1.payCellHeader}>DUE DATE</Text>
                  <Text style={styles1.payCellHeader}>AMOUNT DUE</Text>
                </View>

                {/* Data row 1 */}
                <View style={styles1.payRow}>
                  <Text style={styles1.payCell}>{customer?.acctnum || ""}</Text>
                  <Text style={styles1.payCell}>
                    {formatDate(billing?.due_date)}
                  </Text>
                  <Text style={styles1.payCell}>{money(billing?.amount)}</Text>
                </View>

                {/* Header row 2 */}
                <View style={styles1.payRowHeader}>
                  <Text style={styles1.payCellHeader}>BILL DATE</Text>
                  <Text style={styles1.payCellHeader}>LATE DATE</Text>
                  <Text style={styles1.payCellHeader}>LATE AMOUNT</Text>
                </View>

                {/* Data row 2 */}
                <View style={styles1.payRow}>
                  <Text style={styles1.payCell}>
                    {formatDate(billing?.billing_date)}
                  </Text>
                  <Text style={styles1.payCell}>
                    {formatDate(billing?.late_date)}
                  </Text>
                  <Text style={styles1.payCell}>
                    {money(
                      (billing?.amount || 0) + (billing?.late_date_amount || 0)
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles1.checkContainerInvoice}>
            <Text style={styles1.invoiceLabel}>
              Invoice#:{" "}
              <Text style={styles1.invoiceValue}>
                {billing?.invoice_number || ""}
              </Text>
            </Text>
          </View>
          <View style={styles1.checkContainer1}>&nbsp;</View>
          {/* Check Number + Amount Paid */}
          {/* 🔹 Invoice + Check Details Section */}
          <View style={styles1.checkContainer}>
            {/* Invoice Row */}
            {/* Check Number Row */}
            <View style={styles1.checkRow}>
              <Text style={styles1.checkLabel}>Check Number:</Text>
            </View>

            {/* Amount Paid Row */}
            <View style={styles1.checkRow}>
              <Text style={styles1.checkLabel}>Amount Paid:</Text>
            </View>
          </View>

          {/* Company and Customer Info */}
          <View style={styles1.companyCustomerRow}>
            {/* Company Column */}
            <View style={styles1.column}>
              <Text style={styles1.italicSmall}>
                Company Name:
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                    fontStyle: "normal",
                  }}
                >
                  {company?.company_name || ""}
                  {"\n\n"}
                </Text>
              </Text>
              <Text style={styles1.italicSmall}>
                Address 1:
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                    fontStyle: "normal",
                    marginTop: 100, // works perfectly
                  }}
                >
                  {company?.street || ""}
                  {"\n\n"}
                </Text>
              </Text>
              <Text style={styles1.italicSmall}>
                Address 2:
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                    fontStyle: "normal",
                  }}
                >
                  {""}
                  {"\n\n"}
                </Text>
              </Text>
              <Text style={styles1.italicSmall}>
                {" "}
                City, State, zip:
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                    fontStyle: "normal",
                  }}
                >
                  {company?.city || ""} {company?.state || ""}{" "}
                  {company?.zip || ""}
                </Text>
              </Text>
            </View>

            {/* Customer Column */}
            <View style={styles1.column}>
              <Text style={styles1.italicSmall}>
                Customer Name:
                <Text style={styles1.smallText}>
                  {customer?.customer_name || ""}
                  {"\n\n"}
                </Text>
              </Text>
              <Text style={styles1.italicSmall}>
                Address 1:
                <Text style={styles1.smallText}>
                  {customer?.address || ""}
                  {"\n\n"}
                </Text>
              </Text>
              <Text style={styles1.italicSmall}>
                Address 2:
                <Text style={styles1.smallText}>
                  {""}
                  {"\n\n"}
                </Text>
              </Text>
              <Text style={styles1.italicSmall}>
                City, State, zip:
                <Text style={styles1.smallText}>
                  {customer.city} {customer?.state || ""} {customer?.zip || ""}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
