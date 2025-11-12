import * as React from "react";
import { RootState } from "@/state/store";
import { colors, formatToMMDDYYYY } from "@/utils";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Stack
} from "@mui/material";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useSelector } from "react-redux";

export const InvoiceMainDetails = () => {
  const invoiceDetails = useSelector(
    (state: RootState) => state.DashBoard.invoiceDetails
  );
  const dashboardLoader = useSelector(
    (state: RootState) => state.DashBoard.dashboardLoader
  );
  const {
    company,
    company_settings,
    customer,
    unique_by_utility = {},

    last_bill = [],
    extra_params = [],
    //   } = InvoiceDetails?.body ?? {};
  } = invoiceDetails ?? {};

  let subtotal=null
  let utilityDetails =null
  let itemsData =null
  let utilityNameData = ""
  let serviceAddress = ""

  Object.entries(unique_by_utility).map(([key, items]: any) => {
  const [utilityName, , meterNumber, ...addressParts] = key.split(";");
   serviceAddress = addressParts.join(";");

  // First item (safe access)
  console.log(items)
  itemsData =items
   utilityDetails = items?.[0] ?? {};
   utilityNameData = utilityName

  // ✅ Consumption from the first item
  const consumption = utilityDetails.consumption;

  // ✅ Subtotal
   subtotal = items.reduce(
    (acc, item) => acc + (item?.amount || 0),
    0
  );
});

console.log(utilityNameData)


  return (
   <Box
  sx={{
    bgcolor: "#fff",
    maxWidth: 950,
    border: "1px solid #000",
    mx: "auto",
    overflow: "hidden",
  }}
>
  {/* ===================== HEADER ===================== */}
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      justifyContent: "space-between",
      alignItems: { xs: "left", sm: "flex-start" },
      px: { xs: 1.5, sm: 2 },
      pt: 2,
      gap: { xs: 1.5, sm: 0 },
    }}
  >
    {/* LEFT SIDE — CENTERED BLOCK */}
    <Box sx={{ textAlign: "left", flex: 1 }}>
      <Typography
                 sx={{
                   fontWeight: 600,
                   fontSize: { xs: 18, sm: 20, md: 18 },
                   letterSpacing: 0.4,
                 }}
               >
                 {company?.company_name}
               </Typography>
               <Typography variant="subtitle2" sx={{ color: "#999" }}>
                 {company_settings?.invoice_subheadline}
               </Typography>
    </Box>

    {/* RIGHT SIDE — OFFICE HOURS */}
    <Box
      sx={{
        textAlign: { xs: "center", sm: "right" },
        minWidth: { xs: "auto", sm: "120px" },
        fontSize: { xs: 11, sm: 14 },
        marginTop: { xs: 0, sm: "8px" },
        paddingRight: { xs: 0, sm: "24px" },
      }}
    >
    
      <Stack
            spacing={2}
          >
            <Typography sx={{ fontSize: 14, color: "#888" }}>
              {company_settings?.invoice_text_header_email}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#888" }}>
              {company_settings?.invoice_text_header_open}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#888" }}>
              {company_settings?.invoice_text_header_web}
              <br />
              {company_settings?.direct_debit}
            </Typography>
          </Stack>
    </Box>
  </Box>
  <Box
    sx={{
      width: "100%",
      overflowX: "auto",
      p: { xs: 1.5, sm: 2 },
      fontFamily: "'Arial', sans-serif",
    }}
  >
    <Table
      size="small"
      sx={{
        border: "1px solid #000",
        // borderCollapse: "collapse",
        width: "100%",
        minWidth: 600, // enables scroll on mobile
        "& td, & th": {
          border: "1px solid #000",
          verticalAlign: "top",
          // wordBreak: "break-word",
        },
        fontSize: { xs: 11, sm: 13 },
      }}
    >
      <TableBody>
        {/* Header */}
     <TableRow sx={{ bgcolor: "rgb(227, 242, 253)" }}>
  {[
    "INVOICE #",
    "CUSTOMER NAME",
    "EMAIL",
    "TELEPHONE NUMBER",
    "BILLING ADDRESS",
  ].map((header, i) => (
    <TableCell
      key={i}
      colSpan={header === "BILLING ADDRESS" ? 6 : 1}
      sx={{
     
        fontWeight: 600,
      }}
    >
      {header}
    </TableCell>
  ))}
</TableRow>


        <TableRow>
          <TableCell> {last_bill?.[0]?.invoice_number}</TableCell>
          <TableCell> {customer?.customer_name}</TableCell>
          <TableCell>{customer?.email}</TableCell>
          <TableCell> {customer?.phone}</TableCell>
          <TableCell colSpan={4}>{customer?.address}, {customer?.city}</TableCell>
        </TableRow>

           <TableRow sx={{ bgcolor: "rgb(227, 242, 253)" }}>
  {[
    "Invoice Date",
    "WATER Service at",
    "Number of Days",
    "Meter Readings",
    "Usage in Gallons",
  ].map((header, i) => (
    <TableCell
      key={i}
      colSpan={header === "Usage in Gallons" ? 6 : 1}
      sx={{
     
        fontWeight: 600,
      }}
    >
      {header}
    </TableCell>
  ))}
</TableRow>


        <TableRow>
          <TableCell> {last_bill?.[0]?.invoice_number}</TableCell>
          <TableCell> {serviceAddress}</TableCell>
          <TableCell>{utilityDetails.consumption_days}</TableCell>
          <TableCell> start : {utilityDetails?.previous_reading}  End: {utilityDetails?.current_reading}</TableCell>
          <TableCell colSpan={4}>{utilityDetails?.consumption}</TableCell>
        </TableRow>

        {/* Subheader Row */}
        <TableRow sx={{ bgcolor: "#f7f7f7" }}>
          <TableCell colSpan={2}>Service</TableCell>
          <TableCell>Number Days</TableCell>
          <TableCell colSpan={2}>Meter Readings</TableCell>
          <TableCell>Usage in Gallon</TableCell>
          <TableCell
            rowSpan={5}
            align="center"
            sx={{
              bgcolor: "rgb(227, 242, 253)",
              borderLeft: "2px solid #000",
              width: { xs: "120px", sm: "160px" },
              fontWeight: 700,
              verticalAlign: "top",
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1 }}>CHARGES</Typography>
          <Box sx={{ textAlign: "left", pl: { xs: 1.5, sm: 3 } }}>
  {itemsData?.map((item, index) => (
    <Typography key={index}>
      {item?.product_id}     ${item?.amount?.toFixed(2)}
    </Typography>
  ))}
</Box>

          </TableCell>
        </TableRow>

        <TableRow sx={{ bgcolor: "rgb(227, 242, 253)" }}>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Previous</TableCell>
          <TableCell>Current</TableCell>
          <TableCell colSpan={2}> {utilityDetails?.consumption
}</TableCell>
        </TableRow>

        <TableRow>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
        </TableRow>

        <TableRow>
          <TableCell colSpan={6}>
            <Typography sx={{ fontWeight: 600, fontSize: { xs: 11, sm: 13 }, }}>
            {last_bill?.[0]?.last_payment_info}
            </Typography>
            <Typography sx={{ fontWeight: 600 ,  fontSize: { xs: 11, sm: 13 }, }} >
              YOUR PAYMENT IS DUE NOW :  ${last_bill?.[0]?.amount}
            </Typography>
            <Typography sx={{ fontWeight: 600 , fontSize: { xs: 11, sm: 13 },}}>
              PLEASE PAY BY DUE DATE {formatToMMDDYYYY(
                      last_bill?.[0]?.due_date,
                      false,
                      false,
                      true
                    )}
            </Typography>
          </TableCell>
        </TableRow>

        <TableRow sx={{ bgcolor: "rgb(227, 242, 253)" }}>
          <TableCell>COMPARISONS</TableCell>
          <TableCell>Days of Service</TableCell>
          <TableCell>Total Usage</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Due by -</TableCell>
          <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
            $49.50
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Current Billing Period -</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>On/After </TableCell>
          <TableCell colSpan={3} align="right">
            ${subtotal?.toFixed(2)}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Previous Billing Period</TableCell>
          <TableCell>-</TableCell>
          <TableCell>N/A</TableCell>
    <TableCell colSpan={4}>
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      color: "blue",
      fontWeight: 300,
      width: "100%",
      fontSize : 10
    }}
  >
    <span>1 Month</span>
    <span>2 Months</span>
    <span>3 Months</span>
    <span>4+ Months</span>
  </Box>
</TableCell>

        </TableRow>

        <TableRow>
          <TableCell>Same Period Last Year</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell colSpan={4} align="right" sx={{ fontSize: 12 }}>
            RATE SCHEDULES ARE AVAILABLE UPON REQUEST
          </TableCell>
        </TableRow>

        {/* Footer */}
        <TableRow>
          <TableCell>
            <Typography sx={{ fontSize: 12 }}>
              RATE CODE DESCRIPTIONS
              <br />
              01: Residential W/S/G
              <br />
              02: Commercial W/S/G
            </Typography>
          </TableCell>
          <TableCell colSpan={2}>
            <Typography sx={{ fontSize: 12 }}>
              If you have any questions about your bill, service, or need to
              discuss payment arrangements, please call or come by.
            </Typography>
            <Typography sx={{ fontSize: 12 }}>City of Coleharbor</Typography>
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }} colSpan={4}>
            Happy Halloween
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Box>

    <Box
         sx={{
           width: "100%",
           textAlign: "center",
           fontSize: 14,
           letterSpacing: 2,
           whiteSpace: "nowrap",
           overflow: "hidden",
           textOverflow: "clip",
           my: 2,
           mt : 5
         }}
       >
         {"- ".repeat(200)}
       </Box>
  <Box
    sx={{
      maxWidth: 1000,
      mx: "auto",
      fontFamily: "'Arial', sans-serif",
      px: { xs: 1.5, sm: 3 },
    }}
  >
    <Typography
      sx={{
        textAlign: "right",
        fontSize: { xs: 12, sm: 14 },
        mb: 1,
      }}
    >
      Please detach and return with your payment &nbsp; Make Check Payable to
      Cole Harbor
    </Typography>

    <Grid container spacing={2} alignItems="flex-start">
      {/* LEFT SIDE */}
      <Grid item xs={12} md={6}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: { xs: 18, md: 16 }, mb: 0.5 }}
          >
               {company?.company_name}
          </Typography>
          <Typography sx={{ fontSize: { xs: 14, md: 12 }, fontWeight: 600 }}>
           {company?.city} {company?.street ? `,${company?.street},` : ""}
              {company?.zip ? `,${company?.zip},` : ""}
          </Typography>
        </Box>

        <Box
          sx={{
            border: "1px solid #000",
            maxWidth: 250,
            mx: "auto",
            textAlign: "center",
            bgcolor: "rgb(227, 242, 253)",
          
            py: 1,
            fontSize: { xs: 16, md: 16 },
            fontWeight: 700,
            mb: 3,
          }}
        >
          Utility Billing
        </Box>

        <Box sx={{ textAlign: "left", pl: { xs: 2, md: 8 } ,pt : "50px" , mb:1}}>
          <Typography sx={{ fontSize: { xs: 14, md: 12 } }}>
          {customer?.customer_name}
          </Typography>
          <Typography sx={{ fontSize: { xs: 14, md: 12 } }}></Typography>
          <Typography sx={{ fontSize: { xs: 14, md: 12} }}>
           {customer?.address}
          </Typography>
        </Box>
      </Grid>

      {/* RIGHT SIDE */}
      <Grid item xs={12} md={6}>
        <Grid container sx={{ bgcolor: "rgb(227, 242, 253)",  py: 1    , border: "1px solid #000",}}>
          {["ACCOUNT NUMBER", "DUE DATE", "AMOUNT DUE"].map((label, i) => (
            <Grid
              key={i}
              item
              xs={4}
              textAlign="center"
              sx={{ fontWeight: 700, fontSize: { xs: 12, sm: 14 } }}
            >
              {label}
            </Grid>
          ))}
        </Grid>

        <Grid
          container
          sx={{
            border: "1px solid #000",
            borderTop: "none",
            py: 1.2,
            fontWeight: 700,
            fontSize: { xs: 13, sm: 14 },
          }}
        >
          <Grid item xs={4} textAlign="center">
           {customer?.acctnum}
          </Grid>
          <Grid item xs={4} textAlign="center">
           {formatToMMDDYYYY(
                      last_bill?.[0]?.due_date,
                      false,
                      false,
                      true
                    )}
          </Grid>
          <Grid item xs={4} textAlign="center">
           ${last_bill?.[0]?.amount}
          </Grid>
        </Grid>

        <Grid
          container
          sx={{
            border: "1px solid #000",
            borderTop: "none",
            py: 1,
            fontWeight: 600,
            bgcolor: "#fafafa",
            fontSize: { xs: 12, sm: 13 },
          }}
        >
          <Grid item xs={4} textAlign="center">
            Billing Date
          </Grid>
          <Grid item xs={4} textAlign="center">
            Rate Code
          </Grid>
          <Grid item xs={4} textAlign="center">
            Meter #
          </Grid>
        </Grid>

        <Grid
          container
          sx={{
            border: "1px solid #000",
            borderTop: "none",
            py: 1.2,
            fontWeight: 700,
            fontSize: { xs: 13, sm: 14 },
          }}
        >
          <Grid item xs={4} textAlign="center">
            {formatToMMDDYYYY(
                      last_bill?.[0]?.billing_date,
                      false,
                      false,
                      true
                    )}
          </Grid>
          <Grid
            item
            xs={4}
            textAlign="center"
            sx={{
              borderLeft: "1px solid #0d47a1",
              borderRight: "1px solid #0d47a1",
            }}
          >
            -
          </Grid>
          <Grid item xs={4} textAlign="center">
            -
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "left", mt: "30px" , mb : 1 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: { xs: 16, md: 12 } }}
          >
              {company?.company_name}
          </Typography>
          <Typography sx={{ fontSize: { xs: 14, md: 12 } }}>{company?.city} {company?.street ? `,${company?.street},` : ""}
              {company?.zip ? `,${company?.zip},` : ""}</Typography>
          <Typography sx={{ fontSize: { xs: 14, md: 12 } }}>
           
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Box>

  {/* ===================== BACKDROP ===================== */}
  <CustomBackdrop open={dashboardLoader} style={{ zIndex: 1300, color: "#fff" }}>
    <Loader />
  </CustomBackdrop>
</Box>

  );
};