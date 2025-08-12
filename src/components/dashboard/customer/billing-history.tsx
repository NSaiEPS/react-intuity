import * as React from "react";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";

import { getLocalStorage } from "@/utils/auth";
import { CardHeader, FormControl, Grid, MenuItem, Select } from "@mui/material";
import Typography from "@mui/material/Typography";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";

import PdfViewer from "../layout/invoice-pdf-view";
import InvoiceTransactionTabs from "./billing-history-tabs";

function noop(): void {
  // do nothing
}

export interface Customer {
  id: string;
  avatar: string;
  name: string;
  email: string;
  address: { city: string; state: string; country: string; street: string };
  phone: string;
  createdAt: Date;
  type: string;
  status: string;
  price: string;
  balance: string;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
}

export function BillingHistory({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: CustomersTableProps): React.JSX.Element {
  const [isInvoice, setIsInvoice] = React.useState<number[]>([]);
  const [pdfModal, setPdfModal] = React.useState<boolean>(false);

  const handleInvoiceToggle = (id: number): void => {
    setIsInvoice((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, index) => currentYear - index);
  const [selectedYear, setSelectedYear] = React.useState(years[2]);

  const handleChange = (event: any) => {
    setSelectedYear(event.target.value);
    filterByYear(event.target.value);
  };
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  const dispatch = useDispatch();
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const filterByYear = (year) => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("year", String(year));

    dispatch(getLastBillInfo(formData, token));
  };
  return (
    <Grid>
      <Grid container spacing={2} justifyContent="space-between">
        <CardHeader
          title={
            <Typography variant="h5">Payment & billing history</Typography>
          }
        />

        <CardHeader
          subheader={
            <Typography variant="h6">
              Name :{CustomerInfo?.customer_name}
            </Typography>
          }
          title={
            <Typography variant="h5">
              Account No :{CustomerInfo?.acctnum}
            </Typography>
          }
        />
      </Grid>
      <Grid
        item
        sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        <FormControl>
          <Select
            value={selectedYear}
            onChange={handleChange}
            sx={{ height: 40, mb: 1 }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <InvoiceTransactionTabs
        handleInvoiceToggle={handleInvoiceToggle}
        dummyInvoice={lastBillInfo}
        rows={rows}
        isInvoice={isInvoice}
        setPdfModal={setPdfModal}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
      />
      {/* <Card
        sx={{
          borderRadius: boarderRadius.card,
        }}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Transaction Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Balance</TableCell>
              </TableRow>
            </TableHead>
            {dummyInvoice.map((item) => {
              return (
                <TableBody key={item.id}>
                  <TableRow hover key={1}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <IconButton
                          onClick={() => {
                            handleInvoiceToggle(item.id);
                          }}
                        >
                          {isInvoice?.includes(item.id) ? (
                            <Minus size={10} weight="bold" />
                          ) : (
                            <Plus size={10} weight="bold" />
                          )}
                        </IconButton>
                        <Typography variant="subtitle2">invoice</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{dayjs().format('MMM D, YYYY')}</TableCell>

                    <TableCell>Success</TableCell>
                    <TableCell>$ 130 </TableCell>
                    <TableCell sx={{}}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        $ 130.86
                        <Box
                          onClick={() => setPdfModal(true)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            color: colors.blue,
                          }}
                        >
                          <FileText size={18} weight="regular" />
                          <Typography
                            sx={{
                              color: colors.blue,
                            }}
                            variant="body2"
                          >
                            View Invoice
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {Array.isArray(rows) &&
                    isInvoice.includes(item.id) &&
                    rows.map((row) => {
                      return (
                        <TableRow hover key={row.id}>
                          <TableCell>
                            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                              <Typography variant="subtitle2">{row.type}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>

                          <TableCell>{row.status}</TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell>{row.balance}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              );
            })}
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card> */}

      <CustomBackdrop
        open={paymentLoader}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
      <PdfViewer
        open={pdfModal}
        onClose={() => {
          setPdfModal(false);
        }}
        fileUrl=""
      />
    </Grid>
  );
}
