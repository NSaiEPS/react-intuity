// src/app/api/auth/login/route.ts

import { BASE_URL } from "@/api/axios";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const formData = new URLSearchParams();
  formData.append("email", email);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "",
  });

  const data = await res.json();

  if (!res.ok || !data?.body?.token) {
    return Response.json(
      { error: data?.body?.errors?.[0] || "Login failed" },
      { status: 401 }
    );
  }

  // Set token in secure cookie (valid for 7 days)

  return Response.json({ user: data.body });
}
