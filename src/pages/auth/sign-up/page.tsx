import * as React from "react";

//import { companySlugs, config } from "@/config";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Layout } from "@/components/auth/layout";
import { SignInPage } from "@/components/auth/sign-in-page";
import { SignUpForm } from "@/components/auth/sign-up-form";

//export const metadata = {
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }  title: `Sign up | Auth - ${config.site.name}`,
// } satisfies Metadata;

export default function Page({ params }: { params: { company: string } }) {
  return (
    // <Layout>
    //   <GuestGuard>
    //     <SignUpForm />
    //   </GuestGuard>
    // </Layout>

    <GuestGuard>
      {/* <SignUpForm /> */}
      <SignInPage />
    </GuestGuard>
  );
}
