import { BASE_URL } from "./axios";

export async function loginAction(req: Request) {
  const body = await req.formData();

  const res = await fetch(`${BASE_URL}login`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: body,
    credentials: "include",
  });

  const data = await res.json();
  return data;
}
