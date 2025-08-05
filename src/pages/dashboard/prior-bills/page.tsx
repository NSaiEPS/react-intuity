import * as React from "react";

import { CardHeader, Grid, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";

//import { companySlugs, config } from "@/config";
import { BillingHistory } from "@/components/dashboard/customer/billing-history";
import type { Customer } from "@/components/dashboard/customer/customers-table";

//export const metadata = {
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }  title: `Billing - ${config.site.name}`,
// } satisfies Metadata;

const customers = [
  {
    id: "USR-010",
    name: "Alcides Antonio",
    avatar: "/assets/avatar-10.png",
    email: "alcides.antonio@devias.io",
    phone: "908-691-3242",
    address: {
      city: "Madrid",
      country: "Spain",
      state: "Comunidad de Madrid",
      street: "4158 Hedge Street",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-009",
    name: "Marcus Finn",
    avatar: "/assets/avatar-9.png",
    email: "marcus.finn@devias.io",
    phone: "415-907-2647",
    address: {
      city: "Carson City",
      country: "USA",
      state: "Nevada",
      street: "2188 Armbrester Drive",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-008",
    name: "Jie Yan",
    avatar: "/assets/avatar-8.png",
    email: "jie.yan.song@devias.io",
    phone: "770-635-2682",
    address: {
      city: "North Canton",
      country: "USA",
      state: "Ohio",
      street: "4894 Lakeland Park Drive",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-007",
    name: "Nasimiyu Danai",
    avatar: "/assets/avatar-7.png",
    email: "nasimiyu.danai@devias.io",
    phone: "801-301-7894",
    address: {
      city: "Salt Lake City",
      country: "USA",
      state: "Utah",
      street: "368 Lamberts Branch Road",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-006",
    name: "Iulia Albu",
    avatar: "/assets/avatar-6.png",
    email: "iulia.albu@devias.io",
    phone: "313-812-8947",
    address: {
      city: "Murray",
      country: "USA",
      state: "Utah",
      street: "3934 Wildrose Lane",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-005",
    name: "Fran Perez",
    avatar: "/assets/avatar-5.png",
    email: "fran.perez@devias.io",
    phone: "712-351-5711",
    address: {
      city: "Atlanta",
      country: "USA",
      state: "Georgia",
      street: "1865 Pleasant Hill Road",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },

  {
    id: "USR-004",
    name: "Penjani Inyene",
    avatar: "/assets/avatar-4.png",
    email: "penjani.inyene@devias.io",
    phone: "858-602-3409",
    address: {
      city: "Berkeley",
      country: "USA",
      state: "California",
      street: "317 Angus Road",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-003",
    name: "Carson Darrin",
    avatar: "/assets/avatar-3.png",
    email: "carson.darrin@devias.io",
    phone: "304-428-3097",
    address: {
      city: "Cleveland",
      country: "USA",
      state: "Ohio",
      street: "2849 Fulton Street",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-002",
    name: "Siegbert Gottfried",
    avatar: "/assets/avatar-2.png",
    email: "siegbert.gottfried@devias.io",
    phone: "702-661-1654",
    address: {
      city: "Los Angeles",
      country: "USA",
      state: "California",
      street: "1798 Hickory Ridge Drive",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
  {
    id: "USR-001",
    name: "Miron Vitold",
    avatar: "/assets/avatar-1.png",
    email: "miron.vitold@devias.io",
    phone: "972-333-4106",
    address: {
      city: "San Diego",
      country: "USA",
      state: "California",
      street: "75247",
    },
    createdAt: dayjs().subtract(2, "hours").toDate(),
    type: "payment",
    status: "Success",
    price: "$ 130",
    balance: "$ 130",
  },
] satisfies Customer[];

export default function PriorBillsPage(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 10;

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <BillingHistory
        count={10}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(
  rows: Customer[],
  page: number,
  rowsPerPage: number
): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
