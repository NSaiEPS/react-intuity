// pages/invoice.js (or any component file)
import * as React from 'react';
import type { Metadata } from 'next';

import { companySlugs, config } from '@/config';
import InvoiceDetails from '@/components/dashboard/customer/invoice-details';

export const metadata = { title: `Invoice Details  - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}

export default async function InvoiceDetailsPage() {
  return <InvoiceDetails />;
}
