import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { FileText, Minus, Plus } from "@phosphor-icons/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { paths } from "@/utils/paths";
import { boarderRadius, colors } from "@/utils";

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const TABS = [
  { label: "Invoice", value: "invoice" },
  { label: "Transaction", value: "transaction" },
];

export default function InvoiceTransactionTabs({
  dummyInvoice,
  rows,
  isInvoice,
  handleInvoiceToggle,
  setPdfModal,
  count,
  page,
  rowsPerPage,
}) {
  const [currentTab, setCurrentTab] = useState("invoice");
  const navigate = useNavigate();

  // Demo filtering, adjust as per your data
  const displayedData =
    currentTab === "invoice"
      ? dummyInvoice?.get_invoices ?? []
      : dummyInvoice?.get_transactions ?? [];

  const statusMap = {
    1: {
      label: "Success",
      color: colors["blue.3"],
      textColor: colors.white,
    },
    0: { label: "Declined", color: "#e74c3c", textColor: colors.white },
    2: { label: "Pending", color: "#f39c12", textColor: colors.white },
    3: { label: "Authorization", color: "#1abc9c", textColor: colors.white },
  };
  return (
    <Card sx={{ borderRadius: boarderRadius.card }}>
      {/* Tabs Top Bar */}
      <Tabs
        value={currentTab}
        onChange={(_, tab) => setCurrentTab(tab)}
        indicatorColor="primary"
        textColor="primary"
        sx={{
          borderBottom: "1px solid #e5e7eb",
          "& .MuiTab-root": {
            color: "#6b7280",
            fontWeight: 500,
            textTransform: "none",
            minWidth: 120,
            padding: "12px 20px",
            transition: "all 0.3s ease",
            borderRadius: "10px 10px 0 0",
            position: "relative",
            "&:hover": {
              color: "#1d4ed8",
              backgroundColor: "#f3f4f6",
              transform: "translateY(-2px)", // subtle lift on hover
            },
          },
          "& .Mui-selected": {
            color: "#1d4ed8",
            fontWeight: 600,
            backgroundColor: "#ffffff",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.06)", // soft floating effect
            transform: "translateY(-2px)", // stay lifted when active
          },
          "& .MuiTabs-indicator": {
            background: "linear-gradient(90deg, #2563eb, #3b82f6)",
            height: "4px",
            borderRadius: "4px 4px 0 0",
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>
      <Divider />
      {/* Table Content */}
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: "800px" }}>
          <TableHead>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>
                {currentTab === "invoice" ? "Billing Date" : "Transition Date"}
              </TableCell>
              {/* {currentTab !== 'invoice' && <TableCell>Account Number</TableCell>} */}

              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Balance</TableCell>
              {/* {currentTab !== 'invoice' && <TableCell>Balance Due</TableCell>} */}
            </TableRow>
          </TableHead>
          {displayedData.map((item) => (
            <TableBody key={item.id}>
              <TableRow hover>
                <TableCell>
                  <Stack
                    sx={{ alignItems: "center" }}
                    direction="row"
                    spacing={2}
                  >
                    {currentTab === "invoice" && (
                      <IconButton onClick={() => handleInvoiceToggle(item.id)}>
                        {isInvoice?.includes(item.id) ? (
                          <Minus size={10} weight="bold" />
                        ) : (
                          <Plus size={10} weight="bold" />
                        )}
                      </IconButton>
                    )}
                    <Typography variant="subtitle2">
                      {currentTab === "invoice" ? "invoice" : item?.type}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {currentTab === "invoice"
                    ? dayjs(item?.billing_date).format("MMM D, YYYY")
                    : dayjs
                        .tz(item.transaction_date, "America/Chicago") // or whichever US timezone server uses
                        .tz(dayjs.tz.guess()) // convert to user's local time
                        .format("YYYY-MM-DD hh:mm A z")}
                  {/* // dayjs(item?.transaction_date).format('MMM D, YYYY')} */}
                </TableCell>
                {/* {currentTab !== 'invoice' && <TableCell>{item?.acctnum}</TableCell>} */}

                {/* <TableCell>
                  {item?.status == 1
                    ? "Success"
                    : item?.status == 0
                    ? "Declined"
                    : item?.status == 2
                    ? "Pending"
                    : item?.status == 3
                    ? "Authorization"
                    : ""}
                </TableCell> */}
                <TableCell>
                  {statusMap[item?.status] ? (
                    <Chip
                      label={statusMap[item?.status].label}
                      sx={{
                        backgroundColor: statusMap[item.status].color,
                        color: statusMap[item.status].textColor,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                      size="small"
                    />
                  ) : null}
                </TableCell>
                <TableCell>
                  {/* ${item?.amount} */}
                  {item?.amount < 0
                    ? `($${Math.abs(parseFloat(item.amount)).toFixed(2)})`
                    : `$${item?.amount}`}
                </TableCell>

                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* ${item?.balance_due} */}$
                    {item?.balance_due < 0
                      ? `(${Math.abs(parseFloat(item.balance_due)).toFixed(2)})`
                      : item?.balance_due}
                    {currentTab === "invoice" && (
                      <Box
                        // onClick={() => setPdfModal(true)}
                        onClick={() =>
                          navigate(paths.dashboard.invoiceDetails(item?.id))
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          color: colors.blue,
                        }}
                      >
                        <FileText size={18} weight="regular" />
                        <Typography sx={{ color: colors.blue }} variant="body2">
                          View Invoice
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                {/* {currentTab !== 'invoice' && <TableCell>$ {item?.balance_due}</TableCell>} */}
              </TableRow>
              {Array.isArray(rows) &&
                isInvoice.includes(item.id) &&
                item?.[item?.id].map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Stack
                        sx={{ alignItems: "center" }}
                        direction="row"
                        spacing={2}
                      >
                        <Typography variant="subtitle2">{row.type}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {dayjs(row.transaction_date).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      {row.status == 1
                        ? "Success"
                        : row.status == 0
                        ? "Declined"
                        : row.status == 2
                        ? "Pending"
                        : row.status == 3
                        ? "Authorization"
                        : ""}
                    </TableCell>
                    <TableCell>${row.amount}</TableCell>
                    <TableCell>${row.balance_due}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          ))}
        </Table>
      </Box>
      <Divider />
      {/* <TablePagination
        component="div"
        count={count}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Card>
  );
}
