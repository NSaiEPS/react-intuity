import * as React from "react";

//import { companySlugs, config } from "@/config";
import AutoPayDetails from "@/components/dashboard/customer/auto-pay-details";

//export const metadata = {
//   title: `Auto Pay  - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function AutoPayPage(): React.JSX.Element {
  return <AutoPayDetails />;
}
