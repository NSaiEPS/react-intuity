// 'use server';

// import { cookies } from 'next/headers';

// import { SignInWithPasswordParams } from '@/lib/auth/client';

// export async function loginAction(params: SignInWithPasswordParams) {
//   const { email, password } = params;
//   const formData = new FormData();

//   formData.append('email', email);
//   formData.append('password', password);
//   //   const body = new URLSearchParams({ email, password }).toString();

//   const res = await fetch('https://test-intuity-backend.pay.waterbill.com/login', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//     },
//     body: formData,
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     return { error: data?.body?.errors?.[0] || 'Login failed' };
//   }

//   // Example: store token in a cookie (optional)
//   cookies().set('auth-token', data.body.token, { path: '/', maxAge: 60 * 60 * 24 * 7 });

//   return { user: data };
// }

// app/api/login/route.ts or pages/api/login.ts

import { NextResponse } from 'next/server';

export async function loginAction(req: Request) {
  const body = await req.formData();
  const email = body.get('email') as string;
  const password = body.get('password') as string;

  const res = await fetch('https://test-intuity-backend.pay.waterbill.com/login', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: body,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data?.body?.errors?.[0] || 'Login failed' }, { status: 401 });
  }

  // Set secure cookie here if needed
  const response = NextResponse.json({ user: data.body });

  response.cookies.set('auth-token', data.body.token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });

  return response;
}
