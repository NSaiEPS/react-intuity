import * as React from "react";

//import { companySlugs, config } from "@/config";
import { GuestGuard } from "@/components/auth/guest-guard";

// import OneTimePaymentCard from '@/components/auth/register-slag';
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInPage } from "@/components/auth/sign-in-page";

//export const metadata = {
//   title: ` Login - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function Page() {
  return (
    <SignInPage />

    // <Layout company={true}>
    //   <SignInForm user={true} />
    // </Layout>
  );
}
