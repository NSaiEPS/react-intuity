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
          height: 28,
          fontSize: 13,
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
          borderBottom: {xs:"none", md:"1px solid #E5E7EB"},
          mb: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, tab) => setCurrentTab(tab)}
          sx={{
            // borderBottom: "1px solid #e5e7eb",
            // "& .MuiTab-root": {
            //   // fontWeight: 500,
            //   // textTransform: "none",
            //   // minWidth: 120,
            //   // padding: "12px 20px",
            //   // transition: "all 0.3s ease",
            //   // borderRadius: "10px 10px 0 0",
            //   // position: "relative",
            //   // backgroundColor: "white",
            //   color: colors.blue,
            //   fontWeight: 500,
            //   textTransform: "none",
            //   minWidth: 120,
            //   px: 3,
            //   py: 1.5,
            //   border: "1px solid #D9E2EC",
            //   borderBottom: "none",
            //   borderRadius: "10px 10px 0 0",
            //   background: "#fff",
            //   mr: 1,

            // },
            // "& .MuiTab-root.Mui-selected": {
            //   color: colors.white,
            //   background: colors.blue,
            //   borderColor: colors.blue,
            // },
            // "& .MuiTabs-indicator": {
            //   height: "4px",
            //   borderRadius: "4px 4px 0 0",
            //   background: "transparent",
            // },
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

        <FormControl size="small"  sx={{
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

      {/* Table Content */}
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
              <TableRow sx={{
                "& th": {
                  fontWeight: 700,
                  fontSize: 14,
                  color: "black",
                  py: 2,
                },
              }}>
                <TableCell sx={{ pl: 4.5 }}>Transaction Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Balance</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedData.map((item) => {
                const expanded = isInvoice?.includes(item.id);

                // TEMP: the real field name for an invoice's associated
                // transactions isn't confirmed yet. Try the likely
                // candidates in order and warn loudly if none match, so
                // this is easy to spot in devtools instead of silently
                // rendering an empty expansion.
                const associatedTransactions = Array.isArray(item?.transactions)
                  ? item.transactions
                  : Array.isArray(item?.[item?.id])
                    ? item[item.id]
                    : Array.isArray(rows)
                      ? rows.filter((r) => r.invoice_id === item.id)
                      : [];

                if (expanded && associatedTransactions.length === 0) {
                  // eslint-disable-next-line no-console
                  console.warn(
                    "[InvoiceTransactionTabs] No associated transactions found for invoice",
                    item.id,
                    "— check the shape of this invoice item:",
                    item
                  );
                }

                return (
                  <React.Fragment key={item.id}>
                    {/* Parent row: Invoice (or Transaction, on the Transactions tab) */}
                    <TableRow >
                      <TableCell sx={{ py: 1, pl: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          {currentTab === "invoice" && (
                            <IconButton
                              size="small"
                              onClick={() => handleInvoiceToggle(item.id)}
                              sx={{
                                p: 0,
                                mr: .5
                              }}
                            >
                              {expanded ? (
                                <CaretDown size={14} weight="bold" />
                              ) : (
                                <CaretRight size={14} weight="bold" />
                              )}
                            </IconButton>
                          )}
                          {/* <Typography variant="subtitle2">
                            {currentTab === "invoice" ? "Invoice" : item?.type}
                          </Typography> */}

                          <FileText
                            size={18}
                            color={colors.blue}
                          />

                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: 14
                            }}
                          >
                            {currentTab === "invoice" ? "Invoice" : item.type}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2
                        }}
                      >
                        {currentTab === "invoice"
                          ? dayjs(item?.billing_date).format("MMM D, YYYY")
                          : dayjs
                            .tz(item.transaction_date, "America/Chicago")
                            .tz(dayjs.tz.guess())
                            .format("YYYY-MM-DD hh:mm A")}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2
                        }}
                      >
                        {/* Invoices themselves have no status — leave blank */}
                        {currentTab === "invoice"
                          ? null
                          : renderStatusChip(item?.status)}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2
                        }}
                      >
                        {/* {formatCurrency(item?.amount)} */}
                        <Typography
                          fontWeight={600}
                          fontSize={14}
                        >
                          {formatCurrency(item.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            fontWeight={600}
                            fontSize={14}
                          >

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
                                marginLeft: "16px"
                              }}
                            >
                              <FileText size={18} weight="regular" />
                              {/* <Typography sx={{ color: colors.blue }} variant="body2">
                                View Invoice
                              </Typography> */}
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

                    {/* Associated transactions (Payment / Late Fee / Reversal).
                        These stay as rows in the SAME table as the parent
                        invoice rows, so columns line up automatically.
                        The "boxed" look is faked with borders/radius on
                        individual cells (first row = top corners + top
                        border, last row = bottom corners + bottom border,
                        outer cells = left/right border), plus thin spacer
                        rows above/below for breathing room. */}
                    {currentTab === "invoice" && expanded && associatedTransactions.length > 0 && (
                      <>
                        {/* top spacer */}
                        {/* <TableRow>
                          <TableCell colSpan={5} sx={{ p: 1, border: "none", height: 10 }} />
                        </TableRow> */}
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{
                              p: 2,
                              borderBottom: 0,
                              bgcolor: "#fff"
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
                                  <col style={{ width: "20%" }} />
                                  <col style={{ width: "18%" }} />
                                  <col style={{ width: "16%" }} />
                                  <col style={{ width: "16%" }} />
                                  <col style={{ width: "20%" }} />
                                </colgroup>
                                <TableBody>

                                  {associatedTransactions.map((row) => (

                                    <TableRow key={row.id}>

                                      <TableCell sx={{ pl: 4 }}>
                                        {row.type}
                                      </TableCell>

                                      <TableCell>
                                        {dayjs(row.transaction_date).format("MMM D, YYYY")}
                                      </TableCell>

                                      <TableCell>
                                        {renderStatusChip(row.status)}
                                      </TableCell>

                                      <TableCell>
                                        <Typography fontWeight={600}>
                                          {formatCurrency(row.amount)}
                                        </Typography>
                                      </TableCell>

                                      {/* <TableCell>
                                        <Typography fontWeight={600}>
                                          {formatCurrency(row.balance_due)}
                                        </Typography>
                                      </TableCell> */}

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

                                          {/* Reserve the same space as "View Invoice" */}
                                          <Box sx={{ width: 105 }} />
                                        </Box>
                                      </TableCell>

                                    </TableRow>

                                  ))}

                                </TableBody>

                              </Table>
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* {associatedTransactions.map((row, index) => {
                          const isFirst = index === 0;
                          const isLast = index === associatedTransactions.length - 1;
                          const boxBorderColor = "rgba(25, 118, 210, 0.15)";

                          const outerBorderSx = {
                            borderTop: isFirst ? `1px solid ${boxBorderColor}` : "none",
                            borderBottom: isLast
                              ? `1px solid ${boxBorderColor}`
                              : "1px solid rgba(0,0,0,0.04)",

                          };

                          return (

                            <TableRow key={row.id} sx={{ backgroundColor: ASSOCIATED_ROW_BG, pl: 2 }}>
                              <TableCell
                                sx={{
                                  ...outerBorderSx,
                                  borderLeft: `1px solid ${boxBorderColor}`,
                                  borderTopLeftRadius: isFirst ? 8 : 0,
                                  borderBottomLeftRadius: isLast ? 8 : 0,
                                  py: 1,
                                  pl: `${ROW_INDENT_PX}px`,
                                }}
                              >
                                <Typography variant="body2">{row.type}</Typography>
                              </TableCell>
                              <TableCell sx={{ ...outerBorderSx, py: 1 }}>
                                {dayjs(row.transaction_date).format("MMM D, YYYY")}
                              </TableCell>
                              <TableCell sx={{ ...outerBorderSx, py: 1 }}>
                                {renderStatusChip(row.status)}
                              </TableCell>
                              <TableCell sx={{ ...outerBorderSx, py: 1 }}>
                                {formatCurrency(row.amount)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  ...outerBorderSx,
                                  borderRight: `1px solid ${boxBorderColor}`,
                                  borderTopRightRadius: isFirst ? 8 : 0,
                                  borderBottomRightRadius: isLast ? 8 : 0,
                                  py: 1,
                                }}
                              >
                                {formatCurrency(row.balance_due)}
                              </TableCell>
                            </TableRow>
                          );
                        })} */}

                        {/* bottom spacer */}
                        {/* <TableRow>
                          <TableCell colSpan={5} sx={{ p: 0, border: "none", height: 10 }} />
                        </TableRow> */}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Card>
      <Divider />
    </Box>
  );
}