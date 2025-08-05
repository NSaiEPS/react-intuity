import * as React from "react";

//import { companySlugs, config } from "@/config";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Layout } from "@/components/auth/layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SignInPage } from "@/components/auth/sign-in-page";

//export const metadata = {
//   title: `Reset password - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function Page({ params }: { params: { company: string } }) {
  return (
    <GuestGuard>
      {/* <ResetPasswordForm /> */}
      <SignInPage />
    </GuestGuard>
  );
}
