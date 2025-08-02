import * as React from 'react';
import type { Metadata } from 'next';

import { companySlugs, config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { SignInPage } from '@/components/auth/sign-in-page';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata = { title: `Sign up | Auth - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page({ params }: { params: { company: string } }) {
  const { company } = params;

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
