import { UtilityItem } from "@/utils";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import HeaderSection from "./HeaderSection";

const styles1 = StyleSheet.create({
  section1: {
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 4,
    backgroundColor: "#f9f9f9",
    marginTop: 2,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    padding: 3,
    fontSize: 10,
  },
  headerCell: {
    flex: 1,
    padding: 6,
    backgroundColor: "#dbeafe",
    fontWeight: "700",
    fontSize: 11,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "#dbeafe",
    padding: 6,
    marginBottom: 8,
  },
  smallText: {
    fontSize: 10,
    paddingTop: "10px",
    fontStyle: "normal",
    fontWeight: "700",
  },
  page: {
    padding: 12,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#F7F7F7",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
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
    fontWeight: "700",
    color: "#aaa",
    marginBottom: 4,
  },
  invoiceBox: {
    backgroundColor: "#38699C",
    color: "#fff",
    borderRadius: 6,
    padding: 4,
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
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    padding: 3,
    fontSize: 12,
  },
  tableHeader: {
    backgroundColor: "#eaeaea",
    fontWeight: "700",
  },
  totalBox: {
    backgroundColor: "#38699C",
    color: "#fff",
    borderRadius: 6,
    padding: 4,
    marginTop: 4,
    textAlign: "right",
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 5,
    fontSize: 10,
    color: "#444",
    textAlign: "center",
  },

  /* 🔽 Detachable Stub Section */
  bottomStub: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
 
  },
  instruction: {
    fontSize: 10,
    marginBottom: 3,
  },
  updateSection: {
    marginTop: 4,
  },
  underlineField: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginVertical: 1.5,
    width: "90%",
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rightBox: {
    width: "45%",
  },
  checkBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    marginTop: 2,
  },
  companyCustomerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    
  },
  companyCustomerRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    width : "700"
  },
  column: {
    width: "48%",
  },
  italicSmall: {
    fontSize: 9
  },

  /* 🔽 Payment Table Section */
  rightCol: {
    width: "60%",
    alignSelf: "flex-end",
  },
payTable: {
  borderWidth: 1,
  borderColor: "#000",
},

payRowHeader: {
  flexDirection: "row",
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
  paddingLeft: 10,
  display:"flex",
alignItems: "center",
justifyContent : "center",
  fontSize: 10,
  fontWeight: "700",
  backgroundColor: "#dbeafe",
  borderRightWidth: 1, // removed only via index for last cell
  borderColor: "#000",
  flexWrap: "nowrap",
  overflow: "hidden",
},

payCell: {
  flex: 1,
  paddingVertical: 4,
  paddingLeft: 10,
  fontSize: 10,
  borderRightWidth: 1, // removed only via index for last cell
  borderColor: "#000",
  flexWrap: "nowrap",
  overflow: "hidden",
}
,

  

  /* ✅ Clean Check + Invoice Section */
  checkContainer: {
  borderWidth: 1,
  borderColor: "#000",
  width: "50%",     // ⬅ FULL width so it appears UNDER invoice box
  alignSelf: "flex-start",
  marginTop: 10,
  backgroundColor: "#fff",
  borderBottomColor: "#fff",
  marginBottom : 2
},

parentWrap: {
  flexDirection: "column",   // ⬅ FORCES vertical stacking
  width: "100%",
},
checkContainerInvoice: {
  borderWidth: 1,
  borderColor: "#000",
  width: "50%",     // ⬅ FULL width so next box comes below
  alignSelf: "flex-start",
  marginTop: 1,
  backgroundColor: "#fff",
  paddingVertical :6,
  paddingHorizontal : 4
},

  checkContainer1: {
    borderWidth: 1,
    borderColor: "#fcf9f9",
    width: "30%",
    alignSelf: "flex-start",
    marginTop: 1,
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
    fontWeight: "700",
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
    // fontWeight: "700",
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
    paddingHorizontal : 3
  },
  companyCol: { width: "50%"  , paddingHorizontal : 3},
  rightHeaderCol: { width: "50%", textAlign: "right" ,paddingHorizontal : 3},
  companyName: { fontSize: 12, fontWeight: "700",paddingHorizontal : 3, width : "100%"},
  subHeadline: { fontSize: 10, color: "#888", marginBottom: 4 , marginTop : 4,paddingHorizontal : 3},
  rightHeaderText: { fontSize: 10, color: "#888" , marginBottom : 2 ,marginTop : 2 , paddingHorizontal : 3},

  // Invoice / InvoiceBox
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    marginBottom: 3,
  },
  balanceRowWrapper: {
  flexDirection: "column",   // stack vertically
  alignItems: "flex-end",    // push everything to right

  width: "100%",
  marginTop: 10,
  paddingHorizontal : 3
},
itemDescription:{
   flexDirection: "row",
  justifyContent: "space-between", 
},
  sectionTitleRight: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 2,
    color: "#0B3D91",
    paddingHorizontal : 3,
    marginLeft:"auto"
  },

  invoiceToCol: { width: "65%" , paddingHorizontal : 4},
  invoiceBoxCol: { width: "33%", alignItems: "flex-end" , paddingHorizontal : 4},

  invoiceTitle: {
    fontSize: 30,
    color: "#aaa",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom : 3
  },
  invoiceBox: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#38699C",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal : 4,
    borderRadius: 6,
  },
  invoiceBoxLabel: { fontSize: 10, color: "#fff", marginBottom : 4},
  invoiceBoxValue: { fontSize: 10,  color: "#fff" , paddingTop : 3},

  // Item Description / table
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 2,
    color: "#0B3D91",
    paddingHorizontal : 3
  },
  utilityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#38699C",
    marginBottom: 3,
    paddingHorizontal : 3
  },

  tableRow: { flexDirection: "row", paddingVertical: 6, alignItems: "center" },
  tableCellLeft: { width: "70%", fontSize: 12, fontWeight: "700" , padding :4},
  tableCellRight: { width: "30%", fontSize: 10, textAlign: "right" , padding : 4},
  rowStrip: { backgroundColor: "#E9F5FF" },

  // box under items (service address + dates + meter readings etc)
  detailBox: {
    marginTop: 4,
    padding: 8,
    borderWidth: .5,
    marginHorizontal : 4,
    marginBottom : 4,
    borderRadius: 6,
    borderColor : "#f9f9f9",
    backgroundColor: "#f9f9f9",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  detailCol1: { width: "30%" },
  detailCol2: { width: "20%" },
  detailCol3: { width: "30%" },
  detailCol4: { width: "20%" },
  detailSubtitle: { fontSize: 10, color: "#666", marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: "700" },

  // previous balance and totals
  prevBalRow: {
  backgroundColor: "#38699C",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 6,
  },
  totalBox: {
    alignSelf: "flex-end",
    width: 150,
    backgroundColor: "#38699C",
    padding: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  subTotalBox: {
    alignSelf: "flex-end",
    width: 150,
    backgroundColor: "#3377c0ff",
    padding: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  totalText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
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
    marginBottom: 8,
    // marginTop : 110,
    marginTop:'auto',
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
    fontWeight: "700",
    padding: 6,
    textAlign: "center",
  },

  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  checkboxChar: { fontSize: 12, marginRight: 6 },
  payTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderCollapse: "collapse",
  },
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
const summaryStyles = StyleSheet.create({
  subTotalBox: {
    alignSelf: "flex-end",
    width: 180,
    padding: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  subTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

 
  totalBox: {
    alignSelf: "flex-end",
    width: 180,
    backgroundColor: "#38699C",
    padding: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  subTotalLabel: {
  fontSize: 12,
  textAlign: "left",
  flex: 1,        // ← add this
},
subTotalValue: {
  fontSize: 12,
  textAlign: "right",
  flex: 1,        // ← add this
},
totalText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 12,
  textAlign: "left",
  flex: 1,        // ← add this
},
totalValue: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 12,
  textAlign: "right",
  flex: 1,        // ← add this
},
});
interface InvoiceItem {
  product_id?: string;
  amount?: number | string;
}

interface ExtraParam {
  amount?: number | string;
}

type DateInput = string | number | Date | null | undefined;
const formatDate = (val?: DateInput):string => {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

type MoneyInput = string | number | null | undefined;

const money = (n?: MoneyInput):string =>
  n == null || n === "" ? "-" : `$${Number(n).toFixed(2)}`;

 interface Company {
  company_name?: string;
  street?: string;
  city?: string;
  state_abbrev?: string;
  zip?: string;
}
export interface Customer {
  customer_name?: string;
  address?: string;
  city?: string;
  state_abbrev?: string;
  zipcode?: string;
  email?: string;
  phone?: string;
  acctnum?: string;
  autopay?: boolean;
}
export interface BillingInfo {
  billing_date?: string;
  due_date?: string;
  late_date?: string;
  late_date_amount?: number;
  amount?: number;
  invoice_number?: string;
  last_payment_info?: string;
}

export interface CompanySettings {
  invoice_subheadline?: string;
  invoice_text_header_email?: string;
  invoice_text_header_open?: string;
  invoice_text_header_web?: string;
  direct_debit?: string;
  invoice_footer_column_3?: string;
}

 interface InvoiceDetails {
  company?: Company;
  company_settings?: CompanySettings;
  customer?: Customer;
  unique_by_utility?: Record<string, UtilityItem[]>;
  last_bill?: BillingInfo[];
  extra_params?: ExtraParam[];
  autopay_do_not_pay_text?: string;
}

export default function InvoicePdfDocument({
  invoiceDetails,
}: {
  invoiceDetails: InvoiceDetails;
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

  const utilityDetails: UtilityItem = Object.values(unique_by_utility || {})?.[0]?.[0] ?? ({} as UtilityItem);
const firstKey = Object.keys(unique_by_utility || {})?.[0] ?? "";
const [utilityName = "", , meterNumber = "", ...addressParts] = String(firstKey).split(";");
const serviceAddress = addressParts.join(";");
const utilityTotal = Object.values(unique_by_utility || {})
  .flat()
  .filter((item) => item?.product_id)
  .reduce((sum, item) => sum + (item?.amount || 0), 0);

const extraParamsTotal = Array.isArray(extra_params)
  ? extra_params.reduce(
      (sum, item) => sum + (Number(item?.amount) || 0),
      0
    )
  : 0;

const grandTotal = utilityTotal + extraParamsTotal;;
  return (
    <Document>
      <Page size="A4" style={styles1.page}>
        <View style={{ marginTop: 4 ,backgroundColor : "#f4f1f1ff" ,  borderColor: "#ddd", paddingBottom :6,
    borderRadius: 4 }}>
        <View style={styles.headerRow}>
          <View style={styles.companyCol}>
            <Text style={styles.companyName}>
              {company?.company_name || ""} 
            </Text>
            <Text style={styles.subHeadline}>
              {company_settings?.invoice_subheadline || ""}
            </Text>
              <Text style={styles.rightHeaderText}>
              {company_settings?.invoice_text_header_email || ""}
            </Text>
          </View>
          {/* <View style={styles.rightHeaderCol}>
            <Text style={styles.rightHeaderText}>
              {company_settings?.invoice_text_header_open || ""}
            </Text>
            <Text style={styles.rightHeaderText}>
              {company_settings?.invoice_text_header_web || ""}
              <Text style={styles.rightHeaderText}>
              {company_settings?.direct_debit || ""}
              </Text>   
            </Text>
          </View> */}
          <View style={styles.rightHeaderCol}>
                     
                      <Text style={styles.rightHeaderText}>
                        {/* {invoiceDetails?.invoice_text_header_email || ""} */}
                        {/* <Text style={styles.rightHeaderText}>
                        {invoiceDetails?.invoice_text_header_email|| ""}
                        </Text>    */}
                      </Text>
                    </View>
          <HeaderSection customerDetails={{
            company_website: company_settings?.company_url || "",
            company_phone: company_settings?.invoice_text_header_web || "",
            company_email: company_settings?.invoice_text_header_email || ""
          }}/>

        </View>

        {/* Invoice + Total Due */}
        <View style={styles.invoiceRow}>
          <View style={styles.invoiceToCol}>
            <Text style={{ fontSize: 10, color: "#777", marginBottom: 4 , fontWeight : "700" ,paddingHorizontal : 3}}>
              INVOICE TO
            </Text>
            <Text style={{ fontWeight: "700", fontSize: 12 , marginBottom: 2 , paddingHorizontal : 3}}>
              {customer?.customer_name || ""}
            </Text>
            <Text style={{ fontSize: 10 ,marginBottom: 4 , paddingHorizontal : 3}}>
              {customer?.address
                ? `Billing address: ${customer.address}, ${customer.city || ""}`
                : ""}
            </Text>
            <Text style={{ fontSize: 10, color: "#666" ,marginBottom: 4, paddingHorizontal : 3}}>
              Email: {customer?.email || ""}
            </Text>
            <Text style={{ fontSize: 10, color: "#666" ,marginBottom: 4, paddingHorizontal : 3}}>
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
                    marginTop: 5
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
  {/* The special boxed detail (the MUI TableRow -> Box you pointed out) */}
                  <View style={{ marginTop: 3 }}>
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
                              fontWeight: "700",
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
                          <Text style={{ fontSize: 12, marginBottom: 4 , fontWeight:"700" }}>
                            Meter #: {utilityDetails?.meter_number ?? "-"}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: "700" }}>
                            {utilityDetails?.consumption ?? "-"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
        {/* Item Descriptions (per utility) */}
        {Object.entries(unique_by_utility || {}).map(
          ([key, items]: [string, UtilityItem[]], uIdx: number) => {
            const [utilityName = "", , meterNumber = "", ...addressParts] =
              String(key).split(";");
              let updatedItems=items?.filter((item)=>item?.product_id)
            const serviceAddress = addressParts.join(";");
            // const utilityDetails : UtilityItem = items?.[0] ?? ({} as UtilityItem);
            const subtotal = updatedItems.reduce(
              (acc, item) => acc + (item?.amount || 0),
              0
            );

            return (
              <View
                key={String(key) + uIdx}
                wrap={false}
                style={{ marginTop: 8 , paddingHorizontal : 3}}
              >
                {/* <Text style={styles.sectionTitle}>Item Description</Text>
                 */}
                      <View
                                 style={
                                   styles.itemDescription
                                 }
                                 >
                            
                                       <Text style={styles.sectionTitle}>Item Description</Text>
                                       <Text style={styles.sectionTitleRight}>Total</Text>
                                       </View>
                <Text style={styles.utilityTitle}>
                  <Text style={{ fontWeight: "700", fontSize:12 }}>{utilityName}</Text>
                  {meterNumber ? ` - ${meterNumber}` : ""}{" "}
                  {serviceAddress ? ` - ${serviceAddress}` : ""}
                </Text>

                {/* Items table (product_id + amount) */}
                <View style={{ marginTop: 4 ,backgroundColor : "#ffff" ,  borderColor: "#ddd",
    borderRadius: 4}}>
                  {updatedItems.map((item: InvoiceItem, idx: number) => (
                    item?.product_id &&
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


                    {Array.isArray(extra_params) &&
          (extra_params as ExtraParam[]).map((it, i) => (
             <View
                     
                      style={[
                        styles.tableRow,
                        styles.rowStrip
                      ]}
                    >
                      <Text style={styles.tableCellLeft}>
                        PREVIOUS BALANCE
                      </Text>
                      <Text style={styles.tableCellRight}>
                     {money(it?.amount)}
                      </Text>
                    </View>
          ))}
                   
                
                </View>
              </View>
            );
          }
        )}

        {/* Previous Balance */}
        <View style={styles.balanceRowWrapper}>
      

        {/* Total Due Box */}
        {/* <View style={styles.totalBox}>
          <Text style={styles.totalText}>
            Total Due: {money(billing?.amount)}
          </Text>
        </View> */}

        <View style={summaryStyles.subTotalBox}>
          <View style={summaryStyles.subTotalRow}>
            <Text style={summaryStyles.subTotalLabel}>SUB TOTAL:</Text>
            <Text style={summaryStyles.subTotalValue}>{grandTotal}</Text>
          </View>
          <View style={summaryStyles.subTotalRow}>
            <Text style={summaryStyles.subTotalLabel}>Tax:</Text>
            <Text style={summaryStyles.subTotalValue}>
              {/* {Number(invoiceDetails.invoice?.amount) - Number(subtotal)} */}
                $ {(Number(billing?.amount) - Number(grandTotal)).toFixed(2)}
        
              </Text>
          </View>
        </View>
        
        <View style={summaryStyles.totalBox}>
          <View style={summaryStyles.totalRow}>
            <Text style={summaryStyles.totalText}>Total Due:</Text>
            <Text style={summaryStyles.totalValue}>{money(billing?.amount)}</Text>
          </View>
        </View>
        </View>
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
        <Text style={styles.dashed} >{"- ".repeat(90)}</Text>

        {/* Bottom Paper / Payment stub */}
        {/* --- Detachable Payment Stub Section (New Fields) --- */}
        {/* <View style={styles1.bottomStub}> */}
          {/* Instruction */}
          <Text style={styles1.instruction}>
            Please detach and return with your payment. Make Checks Payable to:{" "}
            <Text style={{ fontWeight: "700" }}>
              {company?.company_name || ""}
            </Text>
          </Text>

          {/* Update Info + Payment Table (Side by Side) */}
          <View style={styles1.twoCol}>
            {/* LEFT: Update Info */}
      <View style={styles1.parentWrap}>
  <View style={styles1.checkContainerInvoice}>
    <Text style={styles1.invoiceLabel}>
      Invoice#: <Text style={styles1.invoiceValue}>{billing?.invoice_number}</Text>
    </Text>
  </View>

  <View style={styles1.checkContainer}>
    <View style={styles1.checkRow}>
      <Text style={styles1.checkLabel}>Check Number:</Text>
    </View>

    <View style={styles1.checkRow}>
      <Text style={styles1.checkLabel}>Amount Paid:</Text>
    </View>
  </View>
</View>


            {/* RIGHT: Payment Table */}
      <View style={styles1.rightCol}>
  <View style={styles1.payTable}>

    {/* Header Row 1 */}
    <View style={styles1.payRowHeader}>
      {["ACCOUNT NUMBER", "DUE DATE", "AMOUNT DUE"].map((label, index) => (
        <Text
          key={index}
          style={[
            styles1.payCellHeader,
            index === 2 && { borderRightWidth: 0 },
            index===1 && {paddingTop : 10}
          ]}
        >
          {label}
        </Text>
      ))}
    </View>

    {/* Data Row 1 */}
    <View style={styles1.payRow}>
      {[customer?.acctnum || "",
        formatDate(billing?.due_date),
        money(billing?.amount)]
        .map((value, index) => (
          <Text
            key={index}
            style={[
              styles1.payCell,
              index === 2 && { borderRightWidth: 0 }
            ]}
          >
            {value}
          </Text>
        ))}
    </View>

    {/* Header Row 2 */}
    <View style={styles1.payRowHeader}>
      {["BILL DATE", "LATE DATE", "LATE AMOUNT"].map((label, index) => (
     <Text
  key={index}
  style={[
    styles1.payCellHeader,
    index === 2 && { borderRightWidth: 0 },
    (index === 1 || index === 0) && { paddingTop : 10 }
  ]}
>

          {label}
        </Text>
      ))}
    </View>

    {/* Data Row 2 → REMOVE bottom border */}
    <View style={[styles1.payRow, { borderBottomWidth: 0 }]}>
      {[formatDate(billing?.billing_date),
        formatDate(billing?.late_date),
        money((billing?.amount || 0) + (billing?.late_date_amount || 0))]
        .map((value, index) => (
          <Text
            key={index}
            style={[
              styles1.payCell,
              index === 2 && { borderRightWidth: 0 }
            ]}
          >
            {value}
          </Text>
        ))}
    </View>

  </View>
</View>


          </View>
         

          {/* Company and Customer Info */}
          <View style={styles1.companyCustomerRow}>
            {/* Company Column */}
       <View style={styles1.column}>

  <Text
    style={{
      fontWeight: "700",
      fontSize: 10,
      marginBottom: 4,
    }}
  >
    {company?.company_name || ""}
  </Text>

  <Text
    style={{
      fontWeight: "700",
      fontSize: 10,
      marginBottom: 4,
    }}
  >
    {company?.street || ""}
  </Text>

  {/* CITY + STATE + ZIP in one line */}
  <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
    <Text
      style={{
        fontWeight: "700",
        fontSize: 10,
        marginBottom: 4,
      }}
    >
      {company?.city || ""}, {company?.state_abbrev || ""},{" "}
    </Text>

    <Text
      style={{
        fontWeight: "700",
        fontSize: 10,
        marginBottom: 4,
      }}
    >
      {company?.zip || ""}
    </Text>
  </View>

</View>


            {/* Customer Column */}
    <View style={{ width: 215 }}>
  <View>

    <Text style={{ fontWeight: "700", fontSize: 10, marginBottom: 4 }}>
      {customer?.customer_name}
    </Text>

    <Text style={{ fontWeight: "700", fontSize: 10, marginBottom: 4 }}>
      {customer?.address}
    </Text>

    <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
      <Text style={{ fontWeight: "700", fontSize: 10, marginBottom: 4 }}>
        {customer?.city}, {customer?.state_abbrev},{" "}
      </Text>
      <Text style={{ fontWeight: "700", fontSize: 10, marginBottom: 4 }}>
        {customer?.zipcode}
      </Text>
    </View>

  </View>
</View>


          </View>
        {/* </View> */}
      </Page>
    </Document>
  );
}
