// src/app/api/auth/login/route.ts
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);
  console.log('rendered');
  const res = await fetch('https://test-intuity-backend.pay.waterbill.com/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: '',
  });

  const data = await res.json();

  if (!res.ok || !data?.body?.token) {
    return Response.json({ error: data?.body?.errors?.[0] || 'Login failed' }, { status: 401 });
  }

  // Set token in secure cookie (valid for 7 days)
  cookies().set('auth-token', data.body.token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
    path: '/',
  });

  return Response.json({ user: data.body });
}
