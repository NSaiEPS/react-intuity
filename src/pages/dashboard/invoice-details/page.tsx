// pages/invoice.js (or any component file)
import * as React from "react";

//import { companySlugs, config } from "@/config";
import InvoiceDetails from "@/components/dashboard/customer/invoice-details";

//export const metadata = {
//   title: `Invoice Details  - ${config.site.name}`,
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }} satisfies Metadata;

export default function InvoiceDetailsPage() {
  return <InvoiceDetails />;
}
