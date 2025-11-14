import React from 'react';
import { formatToMMDDYYYY } from '@/utils';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// ✅ Register Arial (or fallback to Helvetica if Arial not found)

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    // fontFamily: "Arial",
    fontSize: 12,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftHeader: {
    textAlign: 'center',
  },
  rightHeader: {
    textAlign: 'right',
  },
  table: {
    display: 'flex',
    width: '100%',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    padding: 5,
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
  itemList: {
    marginTop: 5,
    paddingLeft: 10,
  },
  blueText: {
    color: 'blue',
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  address: {
    marginTop: 20,
    fontSize: 12,
    marginBottom: 10,
  },
  table1: {
    display: 'flex',
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow1: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableCell1: {
    padding: 5,
    flex: 1,
    fontSize: 12,
  },
  tableHeader: {
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  footer1: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 9,
    color: 'gray',
    borderTop: '1px solid black',
    paddingTop: 10,
  },
});

const InvoicePdfDocument = ({ invoiceDetails }) => {
  const { company, company_settings, customer, last_bill = [], unique_by_utility = {} } = invoiceDetails ?? {};
  let subtotal = null;
  let utilityDetails = null;
  let itemsData = null;

  Object.entries(unique_by_utility).map(([key, items]: any) => {
    const [utilityName, , meterNumber, ...addressParts] = key.split(';');
    itemsData = items;
    utilityDetails = items?.[0] ?? {};

    // Subtotal calculation (sum of item amounts)
    subtotal = items.reduce((acc, item) => acc + (item?.amount || 0), 0);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{company?.company_name}</Text>
            <Text style={{ fontSize: 10 }}>
              {company?.city} {company?.street ? `,${company?.street},` : ''} {company?.zip ? `,${company?.zip},` : ''}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{company_settings?.invoice_text_header_web}</Text>
          </View>
          <View style={styles.rightHeader}>
            <Text>{company_settings?.invoice_text_header_open}</Text>
          </View>
        </View>

        {/* TABLE SECTION */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            {['ACCOUNT #', 'CUSTOMER NAME', 'RATE', 'TELEPHONE NUMBER', 'SERVICE ADDRESS'].map((header, i) => (
              <View key={i} style={[styles.tableCell, { flex: header === 'SERVICE ADDRESS' ? 6 : 1 }]}>
                <Text style={styles.bold}>{header}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>{customer?.acctnum}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{customer?.customer_name}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{customer?.phone}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 4 }]}>
              <Text>-</Text>
            </View>
          </View>

          {/* Subheader Row */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Service</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Number Days</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Meter Readings</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Usage in Gallon</Text>
            </View>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text style={styles.bold}>CHARGES</Text>
              {itemsData?.map((item, index) => (
                <Text key={index} style={styles.itemList}>
                  {item?.product_id} ${item?.amount?.toFixed(2)}
                </Text>
              ))}
            </View>
          </View>

          {/* Data Rows */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>From</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>To</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{utilityDetails?.consumption}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { flex: 6 }]}>
              <Text>{last_bill?.[0]?.last_payment_info}</Text>
              <Text style={styles.bold}>YOUR PAYMENT IS DUE NOW : ${last_bill?.[0]?.amount}</Text>
              <Text style={styles.bold}>
                PLEASE PAY BY DUE DATE {formatToMMDDYYYY(last_bill?.[0]?.due_date, false, false, true)}
              </Text>
            </View>
          </View>

          {/* Comparison Rows */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>COMPARISONS</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Days of Service</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Total Usage</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.bold}>Due by -</Text>
            </View>
            <View style={[styles.tableCell, { flex: 3, textAlign: 'right' }]}>
              <Text>$49.50</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Current Billing Period -</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>On/After </Text>
            </View>
            <View style={[styles.tableCell, { flex: 3, textAlign: 'right' }]}>
              <Text>${subtotal?.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Previous Billing Period</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>N/A</Text>
            </View>
            <View style={[styles.tableCell, { flex: 3 }]}>
              <Text style={styles.blueText}>1 Month</Text>
              <Text style={styles.blueText}>2 Months</Text>
              <Text style={styles.blueText}>3 Months</Text>
              <Text style={styles.blueText}>4+ Months</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Same Period Last Year</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>N/A</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>N/A</Text>
            </View>
          </View>
        </View>
        <View style={styles.address}>
          <Text>TUCKER, GARY</Text>
          <Text>VIRGINIA CHRISTIE 40 PECAN COVE CT</Text>
        </View>

        {/* Table Section */}
        <View style={styles.table1}>
          {/* Table Row 1 (Account Number, Billing Date) */}
          <View style={styles.tableRow1}>
            <Text style={[styles.tableCell1]}>ACCOUNT NUMBER</Text>
            <Text style={[styles.tableCell1]}>1146</Text>
          </View>
          <View style={styles.tableRow1}>
            <Text style={[styles.tableCell1]}>BILLING DATE</Text>
            <Text style={[styles.tableCell1]}>03/21/2023</Text>
          </View>
          {/* Table Row 2 (Due Date, Amount Due) */}
          <View style={styles.tableRow1}>
            <Text style={[styles.tableCell1]}>DUE DATE</Text>
            <Text style={[styles.tableCell1]}>04/21/2023</Text>
          </View>
          <View style={styles.tableRow1}>
            <Text style={[styles.tableCell1]}>AMOUNT DUE</Text>
            <Text style={[styles.tableCell1]}>$130.86</Text>
          </View>
          {/* Table Row 3 (Rate Code, Meter #) */}
          <View style={styles.tableRow1}>
            <Text style={[styles.tableCell1]}>RATE CODE</Text>
            <Text style={[styles.tableCell1]}>-</Text>
          </View>
          <View style={styles.tableRow1}>
            <Text style={[styles.tableCell1]}>METER #</Text>
            <Text style={[styles.tableCell1]}>-</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePdfDocument;
