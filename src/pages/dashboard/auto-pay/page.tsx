import * as React from 'react';
import type { Metadata } from 'next';

import { companySlugs, config } from '@/config';
import AutoPayDetails from '@/components/dashboard/customer/auto-pay-details';

export const metadata = { title: `Auto Pay  - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  return <AutoPayDetails />;
}
