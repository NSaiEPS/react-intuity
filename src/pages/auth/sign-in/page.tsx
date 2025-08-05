import * as React from "react";

//import { companySlugs, config } from "@/config";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Layout } from "@/components/auth/layout";
import { SignInForm } from "@/components/auth/sign-in-form";

//export const metadata = {
//   title: `Login - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function Page({ params }: { params: { company: string } }) {
  // const { company } = params;

  return (
    <Layout>
      <GuestGuard>
        <SignInForm />
      </GuestGuard>
    </Layout>
  );
}
