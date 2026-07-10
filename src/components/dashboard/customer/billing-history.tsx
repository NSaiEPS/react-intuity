import * as React from "react";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";

import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { Card, FormControl, Grid, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";

import InvoiceTransactionTabs from "./billing-history-tabs";
import { boarderRadius } from "@/utils";
import Header from '@/components/CommonComponents/header-common';


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
  rows?: Customer[];
}

export function BillingHistory({ rows = [] }: CustomersTableProps): React.JSX.Element {
  const [isInvoice, setIsInvoice] = React.useState<number[]>([]);

  const handleInvoiceToggle = (id: number): void => {
    setIsInvoice((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, index) => currentYear - index);
  const [selectedYear, setSelectedYear] = React.useState(years[0]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const year = Number(event.target.value);
    setSelectedYear(year);
    filterByYear(event.target.value);
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );

  const dispatch = useDispatch();
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const filterByYear = (year) => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("id", userId);
    formData.append("year", String(year));

    dispatch(getLastBillInfo(formData));
  };
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <Header title="Payment & billing history" />
      <Grid
        item
        sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        <FormControl>
          <Select
            value={selectedYear.toString()}
            onChange={handleChange}
            sx={{ height: 40, mb: 1, mr: 2 }}
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
      />
      <CustomBackdrop
        open={paymentLoader}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Card>
  );
}
