import { z } from "zod";

// ─── Validation schema ─────────────────────────────────────────────────────────
export const schema = z
  .object({
    name: z.string().min(3, "Enter a valid Name (minimum 3 characters)"),
    accountNumber: z.string().min(1, "Enter a valid Account Number"),
    email: z.string().min(6, "Enter a valid User Name (minimum 6 characters)"),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(
        /^(?=.*[0-9]).{6,}$/,
        "Must be at least 6 characters and include 1 number"
      ),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    authType: z.string().min(1, "Authentication is required"),
    authAnswer: z.string().min(1, "Answer is required"),
    notificationEmail: z.string().email("Enter a valid Email"),
    confirmNotificationEmail: z.string().email("Emails must match"),
    phone: z
      .string()
      .min(14, "Phone number must be at least 10 digits.")
      .or(z.literal("")),
    countryCode: z.string().min(1, "Select a country code"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.notificationEmail === data.confirmNotificationEmail,
    {
      message: "Emails do not match",
      path: ["confirmNotificationEmail"],
    }
  );

export type RegisterFormData = z.infer<typeof schema>;

// ─── Password strength helper ──────────────────────────────────────────────────
export type PasswordStrength = { label: string; color: string; pct: number };

export function getPasswordStrength(password = ""): PasswordStrength | null {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  const levels: Record<number, PasswordStrength> = {
    1: { label: "Weak", color: "#f44336", pct: 20 },
    2: { label: "Fair", color: "#ff9800", pct: 40 },
    3: { label: "Good", color: "#ffc107", pct: 60 },
    4: { label: "Strong", color: "#4caf50", pct: 80 },
    5: { label: "Very Strong", color: "#2e7d32", pct: 100 },
  };
  return levels[score] ?? levels[1];
}
