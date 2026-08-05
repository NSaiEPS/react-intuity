import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Chip,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { CaretDown, CaretRight, FileText } from "@phosphor-icons/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { paths } from "@/utils/paths";
import { colors } from "@/utils";
import { formatCurrency } from "@/utils/formatters";

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TABS = [
  { label: "Invoices", value: "invoice" },
  { label: "Transactions", value: "transaction" },
];

// Light blue tint used to visually group an invoice's associated
// transactions (Payment / Late Fee / Reversal) beneath it.
const ASSOCIATED_ROW_BG = "rgba(25, 118, 210, 0.06)";

// Keep the "expand/collapse" affix + text indent identical between the
// parent invoice row and its child rows so the Transaction Type values
// line up in the same column.
const ROW_INDENT_PX = 32;

export default function InvoiceTransactionTabs({
  dummyInvoice,
  rows,
  isInvoice,
  handleInvoiceToggle,
  years,
  selectedYear,
  handleYearChange,
}) {
  const [currentTab, setCurrentTab] = useState("invoice");
  const navigate = useNavigate();

  const displayedData =
    currentTab === "invoice"
      ? (dummyInvoice?.get_invoices ?? [])
      : (dummyInvoice?.get_transactions ?? []);

  // const statusMap = {
  //   1: { label: "Success", color: colors["blue.3"], textColor: colors.white },
  //   0: { label: "Declined", color: "#e74c3c", textColor: colors.white },
  //   2: { label: "Pending", color: "#f39c12", textColor: colors.white },
  //   3: { label: "Authorization", color: "#1abc9c", textColor: colors.white },
  //   4: { label: "Reversed", color: colors["gray.5"] ?? "#9e9e9e", textColor: colors.white },
  // };

  const statusMap = {
    1: {
      label: "Success",
      bg: "#DCFCE7",
      color: "#15803D",
    },
    0: {
      label: "Declined",
      bg: "#FEE2E2",
      color: "#B91C1C",
    },
    2: {
      label: "Pending",
      bg: "#FEF3C7",
      color: "#B45309",
    },
    3: {
      label: "Authorization",
      bg: "#DBEAFE",
      color: "#1D4ED8",
    },
    4: {
      label: "Reversed",
      bg: "#E5E7EB",
      color: "#475569",
    },
  };

  // const renderStatusChip = (status) => {
  //   const meta = statusMap[status];
  //   if (!meta) return null;
  //   return (
  //     <Chip
  //       label={meta.label}
  //       sx={{
  //         backgroundColor: meta.color,
  //         color: meta.textColor,
  //         fontWeight: 600,
  //         fontSize: "0.75rem",
  //         height: 22,
  //       }}
  //       size="small"
  //     />
  //   );
  // };

  const formatType = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderStatusChip = (status) => {
    const meta = statusMap[status];

    if (!meta) return null;

    return (
      <Chip
        label={meta.label}
        size="small"
        sx={{
          bgcolor: meta.bg,
          color: meta.color,
          fontWeight: 600,
          borderRadius: "999px",
          height: { xs: 22, sm: 26 },
          fontSize: { xs: 11, sm: 12.5 },
          lineHeight: 1,
          px: { xs: 0.25, sm: 0.5 },
          "& .MuiChip-label": {
            px: { xs: 0.75, sm: 1.25 },
          },
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        // boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
        px: { xs: 1.5, sm: 3 },
        py: 2,
        overflowX: "hidden",
      }}
    >
      {/* Tabs Top Bar */}
      <Box
        sx={{
          // display: "flex",
          // justifyContent: "space-between",
          // alignItems: "center",
          // borderBottom: "1px solid #E5E7EB",
          // mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          borderBottom: { xs: "none", md: "1px solid #E5E7EB" },
          mb: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, tab) => setCurrentTab(tab)}
          sx={{

            width: { xs: "100%", sm: "auto" },
            borderBottom: "1px solid #E5E7EB",

            "& .MuiTab-root": {
              color: colors.blue,
              fontWeight: 500,
              textTransform: "none",

              minWidth: { xs: 0, sm: 120 },
              flex: { xs: 1, sm: "unset" },

              px: { xs: 1, sm: 3 },
              py: 1.5,

              border: "1px solid #D9E2EC",
              borderBottom: "none",
              borderRadius: "10px 10px 0 0",
              background: "#fff",
              mr: { xs: 0.5, sm: 1 },

              fontSize: { xs: 13, sm: 14 },
            },

            "& .MuiTab-root.Mui-selected": {
              color: colors.white,
              background: colors.blue,
              borderColor: colors.blue,
            },

            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <FormControl size="small" sx={{
          width: { xs: "100%", sm: 120 },
          alignSelf: { xs: "stretch", sm: "flex-start" },
        }}>
          <Select
            value={selectedYear.toString()}
            onChange={handleYearChange}
            // sx={{
            //   minWidth: 110,
            //   mb: 1,
            // }}
            fullWidth
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Desktop Table View (Visible >= 1000px) */}
      <Box sx={{ display: { xs: "none", "@media (min-width: 1000px)": { display: "block" } } }}>
        <Card sx={{ borderRadius: 0 }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: "800px", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              {/* Single header row — shared across both tabs */}
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      fontSize: 14,
                      color: "black",
                      py: 2,
                    },
                  }}
                >
                  <TableCell sx={{ pl: 4.5 }}>Transaction Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Balance</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography sx={{ color: "text.secondary", fontWeight: 500, fontSize: 14 }}>
                        {currentTab === "invoice" ? "No Invoice found" : "No Transaction found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedData.map((item) => {
                    const expanded = isInvoice?.includes(item.id);

                    const associatedTransactions = Array.isArray(item?.transactions)
                      ? item.transactions
                      : Array.isArray(item?.[item?.id])
                        ? item[item.id]
                        : Array.isArray(rows)
                          ? rows.filter((r) => r.invoice_id === item.id)
                          : [];

                    return (
                      <React.Fragment key={item.id}>
                        {/* Parent row: Invoice (or Transaction, on the Transactions tab) */}
                        <TableRow>
                          <TableCell sx={{ py: 1, pl: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box
                                sx={{
                                  width: 16,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  mr: 0.5,
                                  flexShrink: 0,
                                }}
                              >
                                {currentTab === "invoice" && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleInvoiceToggle(item.id)}
                                  >
                                    {expanded ? (
                                      <CaretDown size={14} weight="bold" />
                                    ) : (
                                      <CaretRight size={14} weight="bold" />
                                    )}
                                  </IconButton>
                                )}
                              </Box>

                              {/* <FileText size={18} color={colors.blue} /> */}

                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  fontSize: 14,
                                  textTransform: "capitalize",
                                }}
                              >
                                {currentTab === "invoice" ? "Invoice" : formatType(item.type)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {currentTab === "invoice"
                              ? dayjs(item?.billing_date).format("MMM D, YYYY")
                              : dayjs(item.transaction_date).format("MMM D, YYYY")}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {currentTab === "invoice"
                              ? null
                              : renderStatusChip(item?.status)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography fontWeight={600} fontSize={14}>
                              {formatCurrency(item.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography fontWeight={600} fontSize={14}>
                                {formatCurrency(item?.balance_due)}
                              </Typography>
                              {currentTab === "invoice" && (
                                <Box
                                  onClick={() =>
                                    navigate(paths.dashboard.invoiceDetails(item?.id))
                                  }
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    cursor: "pointer",
                                    color: colors.blue,
                                    marginLeft: "16px",
                                  }}
                                >
                                  <FileText size={18} weight="regular" />
                                  <Typography
                                    onClick={() =>
                                      navigate(paths.dashboard.invoiceDetails(item.id))
                                    }
                                    sx={{
                                      color: colors.blue,
                                      cursor: "pointer",
                                      fontWeight: 500,
                                      fontSize: 14,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    View Invoice
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>

                        {currentTab === "invoice" && expanded && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              sx={{
                                p: 2,
                                borderBottom: 0,
                                bgcolor: "#fff",
                              }}
                            >
                              <Box
                                sx={{
                                  border: "1px solid #DDE5EF",
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  backgroundColor: "#FAFCFE",
                                }}
                              >
                                {associatedTransactions.length > 0 ? (
                                  <Table
                                    size="small"
                                    sx={{
                                      tableLayout: "fixed",
                                      width: "100%",
                                      border: "1px solid #E5E7EB",
                                      borderRadius: "12px",
                                      overflow: "hidden",
                                      background: "#FAFCFE",
                                      "& td": {
                                        borderBottom: "1px solid #E5E7EB",
                                        fontSize: 14,
                                        py: 2,
                                      },
                                      "& tr:last-child td": {
                                        borderBottom: "none",
                                      },
                                    }}
                                  >
                                    <colgroup>
                                      <col style={{ width: "18%" }} />
                                      <col style={{ width: "17%" }} />
                                      <col style={{ width: "16%" }} />
                                      <col style={{ width: "16%" }} />
                                      <col style={{ width: "19%" }} />
                                    </colgroup>
                                    <TableBody>
                                      {associatedTransactions.map((row) => (
                                        <TableRow key={row.id}>
                                          <TableCell sx={{ pl: 3, textTransform: "capitalize" }}>
                                            {formatType(row.type)}
                                          </TableCell>
                                          <TableCell>
                                            {dayjs(row.transaction_date).format(
                                              "MMM D, YYYY"
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {renderStatusChip(row.status)}
                                          </TableCell>
                                          <TableCell>
                                            <Typography fontWeight={600} sx={{ pl: 2 }}>
                                              {formatCurrency(row.amount)}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                              }}
                                            >
                                              <Typography fontWeight={600}>
                                                {formatCurrency(row.balance_due)}
                                              </Typography>
                                              <Box sx={{ width: 105 }} />
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <Typography
                                    sx={{
                                      textAlign: "center",
                                      py: 2.5,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                      fontSize: 14,
                                    }}
                                  >
                                    No Payments found
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Box>

      {/* Mobile Card View (Visible < 1000px) */}
      <Box
        sx={{
          display: {
            xs: "block",
            "@media (min-width: 1000px)": { display: "none" },
          },
        }}
      >
        {displayedData.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              p: 4,
              textAlign: "center",
              backgroundColor: "#ffffff",
            }}
          >
            <Typography sx={{ color: "text.secondary", fontWeight: 500, fontSize: 14 }}>
              {currentTab === "invoice" ? "No Invoice found" : "No Transaction found"}
            </Typography>
          </Card>
        ) : (
          displayedData.map((item) => {
            const expanded = isInvoice?.includes(item.id);
            const associatedTransactions = Array.isArray(item?.transactions)
              ? item.transactions
              : Array.isArray(item?.[item?.id])
                ? item[item.id]
                : Array.isArray(rows)
                  ? rows.filter((r) => r.invoice_id === item.id)
                  : [];

            if (currentTab === "invoice") {
              return (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    p: 2,
                    mb: 2,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Invoice Card Header */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleInvoiceToggle(item.id)}
                        sx={{
                          p: 0.5,
                          color: colors.blue,
                        }}
                      >
                        {expanded ? (
                          <CaretDown size={18} weight="bold" />
                        ) : (
                          <CaretRight size={18} weight="bold" />
                        )}
                      </IconButton>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#111827",
                        }}
                      >
                        Invoice
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography
                        sx={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}
                      >
                        {dayjs(item?.billing_date).format("MMM D, YYYY")}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(paths.dashboard.invoiceDetails(item?.id))
                        }
                        sx={{
                          p: 0.5,
                          color: colors.blue,
                        }}
                      >
                        <FileText size={22} weight="regular" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Amount & Balance Summary Row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      py: 1,
                      px: 1,
                    }}
                  >
                    {/* Amount Column */}
                    <Box sx={{ textAlign: "left", flex: 1, pl: { xs: 1, sm: 3 } }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#6B7280",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Amount
                      </Typography>
                      <Typography
                        sx={{ fontSize: { xs: 14.5, sm: 16 }, fontWeight: 700, color: "#111827" }}
                      >
                        {formatCurrency(item?.amount)}
                      </Typography>
                    </Box>

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ borderColor: "#E5E7EB", mx: 1 }}
                    />

                    {/* Balance Column */}
                    <Box sx={{ textAlign: "left", flex: 1, pl: { xs: 1, sm: 3 } }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#6B7280",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Balance
                      </Typography>
                      <Typography
                        sx={{ fontSize: { xs: 14.5, sm: 16 }, fontWeight: 700, color: "#111827" }}
                      >
                        {formatCurrency(item?.balance_due)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Expanded Payment UI (Nested Container) */}
                  {expanded && (
                    <Box
                      sx={{
                        mt: 2,
                        border: "1.5px solid #BFDBFE",
                        borderRadius: "12px",
                        p: { xs: 1.5, sm: 2 },
                        backgroundColor: "#FAFCFE",
                      }}
                    >
                      {associatedTransactions.length > 0 ? (
                        associatedTransactions.map((row, idx) => (
                          <React.Fragment key={row.id || idx}>
                            {idx > 0 && (
                              <Divider sx={{ my: 1.5, borderColor: "#E5E7EB" }} />
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: { xs: 1, sm: 2 },
                              }}
                            >
                              {/* Left Col: Payment + Status & Date */}
                              <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                  sx={{ flexWrap: "wrap" }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: { xs: 13, sm: 14 },
                                      color: "#111827",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {formatType(row.type) || "Payment"}
                                  </Typography>
                                  {renderStatusChip(row.status)}
                                </Stack>
                                <Typography
                                  sx={{ fontSize: 11.5, color: "#6B7280", mt: 0.5 }}
                                >
                                  {dayjs(row.transaction_date).format(
                                    "MMM D, YYYY"
                                  )}
                                </Typography>
                              </Box>

                              {/* Middle Col: Amount */}
                              <Box sx={{ textAlign: "left", minWidth: { xs: 60, sm: 80 }, flexShrink: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "#6B7280",
                                    fontWeight: 500,
                                  }}
                                >
                                  Amount
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: { xs: 12.5, sm: 13.5 },
                                    fontWeight: 700,
                                    color: "#111827",
                                  }}
                                >
                                  {formatCurrency(row.amount)}
                                </Typography>
                              </Box>

                              {/* Right Col: Balance */}
                              <Box sx={{ textAlign: "left", minWidth: { xs: 75, sm: 100 }, flexShrink: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "#6B7280",
                                    fontWeight: 500,
                                  }}
                                >
                                  Balance
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: { xs: 12.5, sm: 13.5 },
                                    fontWeight: 700,
                                    color: "#111827",
                                  }}
                                >
                                  {formatCurrency(row.balance_due)}
                                </Typography>
                              </Box>
                            </Box>
                          </React.Fragment>
                        ))
                      ) : (
                        <Typography
                          sx={{
                            textAlign: "center",
                            py: 1.5,
                            color: "text.secondary",
                            fontWeight: 500,
                            fontSize: 13,
                          }}
                        >
                          No Payments found
                        </Typography>
                      )}
                    </Box>
                  )}
                </Card>
              );
            } else {
              // Transactions Tab Card
              return (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    p: 2,
                    mb: 2,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#111827",
                          textTransform: "capitalize",
                        }}
                      >
                        {formatType(item.type) || "Transaction"}
                      </Typography>
                      {renderStatusChip(item.status)}
                    </Stack>
                    <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                      {dayjs
                        .tz(item.transaction_date, "America/Chicago")
                        .tz(dayjs.tz.guess())
                        .format("MMM D, YYYY")}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      py: 1,
                    }}
                  >
                    <Box sx={{ textAlign: "left", flex: 1, pl: { xs: 1, sm: 3 } }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#6B7280",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Amount
                      </Typography>
                      <Typography
                        sx={{ fontSize: { xs: 13.5, sm: 15 }, fontWeight: 700, color: "#111827" }}
                      >
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ borderColor: "#E5E7EB", mx: 1 }}
                    />
                    <Box sx={{ textAlign: "left", flex: 1, pl: { xs: 1, sm: 3 } }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#6B7280",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Balance
                      </Typography>
                      <Typography
                        sx={{ fontSize: { xs: 13.5, sm: 15 }, fontWeight: 700, color: "#111827" }}
                      >
                        {formatCurrency(item.balance_due)}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              );
            }
          })
        )}
      </Box>
      {/* <Divider /> */}
    </Box>
  );
}