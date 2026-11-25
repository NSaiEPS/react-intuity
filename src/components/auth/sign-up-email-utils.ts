import { getLocalStorage } from "@/utils/auth";

export const isValidEmailFormat = (email: unknown): boolean => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export const isBasicEmailFormat = (email: unknown): boolean => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+$/.test(trimmed);
};

const isPreferredEmailFlag = (item: Record<string, unknown>): boolean =>
  Boolean(
    item.is_primary === 1 ||
      item.is_primary === "1" ||
      item.is_primary === true ||
      item.primary === 1 ||
      item.primary === "1" ||
      item.primary === true ||
      item.is_default === 1 ||
      item.is_default === "1" ||
      item.is_default === true ||
      item.default === 1 ||
      item.default === "1" ||
      item.default === true ||
      item.is_preferred === 1 ||
      item.is_preferred === "1" ||
      item.is_preferred === true ||
      item.preferred === 1 ||
      item.preferred === "1" ||
      item.preferred === true
  );

/**
 * Extracts individual valid, deduplicated email candidates from a string (single
 * or comma/semicolon/pipe/whitespace-delimited), array of strings, or array of
 * email objects. Never concatenates multiple email addresses into a single value.
 */
function extractEmailsWithValidator(
  source: unknown,
  validator: (email: unknown) => boolean
): string[] {
  if (!source) return [];

  const collected: string[] = [];
  const seen = new Set<string>();

  const addIfValid = (candidate: unknown) => {
    if (typeof candidate !== "string") return;
    const trimmed = candidate.trim();
    if (!validator(trimmed)) return;
    const normalized = trimmed.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      collected.push(trimmed);
    }
  };

  if (typeof source === "string") {
    const parts = source.split(/[,;|\s]+/);
    for (const part of parts) {
      addIfValid(part);
    }
    return collected;
  }

  if (Array.isArray(source)) {
    const preferredItems = source.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        isPreferredEmailFlag(item as Record<string, unknown>)
    );
    const remainingItems = source.filter(
      (item) =>
        !(
          item &&
          typeof item === "object" &&
          isPreferredEmailFlag(item as Record<string, unknown>)
        )
    );

    for (const item of [...preferredItems, ...remainingItems]) {
      if (typeof item === "string") {
        for (const email of extractEmailsWithValidator(item, validator)) {
          addIfValid(email);
        }
      } else if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const raw =
          obj.email ??
          obj.email_address ??
          obj.address ??
          obj.notification_email ??
          obj.value;
        for (const email of extractEmailsWithValidator(raw, validator)) {
          addIfValid(email);
        }
      }
    }
    return collected;
  }

  if (typeof source === "object") {
    const obj = source as Record<string, unknown>;
    const raw =
      obj.primary_email ??
      obj.default_email ??
      obj.preferred_email ??
      obj.email ??
      obj.email_address ??
      obj.notification_email ??
      obj.address;
    return extractEmailsWithValidator(raw, validator);
  }

  return [];
}

export function extractEmailsFromSource(source: unknown): string[] {
  const strictMatches = extractEmailsWithValidator(source, isValidEmailFormat);
  if (strictMatches.length > 0) {
    return strictMatches;
  }
  return extractEmailsWithValidator(source, isBasicEmailFormat);
}

export function selectPreferredEmail(sources: unknown[]): string {
  for (const src of sources) {
    const emails = extractEmailsFromSource(src);
    if (emails.length > 0) {
      return emails[0];
    }
  }
  return "";
}

export function mergeNonEmpty(
  prev: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...(prev || {}) };
  if (next && typeof next === "object") {
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        if (value.length > 0 || !Array.isArray(merged[key])) {
          merged[key] = value;
        }
      } else if (typeof value === "object") {
        if (Object.keys(value).length > 0) {
          merged[key] =
            merged[key] &&
            typeof merged[key] === "object" &&
            !Array.isArray(merged[key])
              ? mergeNonEmpty(
                  merged[key] as Record<string, unknown>,
                  value as Record<string, unknown>
                )
              : value;
        }
      } else {
        merged[key] = value;
      }
    }
  }
  return merged;
}

interface NestedEmailRecord {
  primary_email?: unknown;
  default_email?: unknown;
  preferred_email?: unknown;
  email?: unknown;
  notification_email?: unknown;
  customer_email?: unknown;
  user_email?: unknown;
  emails?: unknown;
  email_list?: unknown;
  email_addresses?: unknown;
  customer_emails?: unknown;
  email1?: unknown;
  email_1?: unknown;
  secondary_email?: unknown;
  alt_email?: unknown;
  email2?: unknown;
  email_2?: unknown;
  customer?: NestedEmailRecord;
  customer_details?: NestedEmailRecord;
  details?: NestedEmailRecord;
  data?: NestedEmailRecord;
  body?: NestedEmailRecord;
  formData?: NestedEmailRecord;
  customerDetails?: NestedEmailRecord;
  oneTimeData?: NestedEmailRecord;
  [key: string]: unknown;
}

export function getAvailableEmail(
  compResp?: NestedEmailRecord,
  oneTimeInfo?: NestedEmailRecord,
  portalUsername?: string
): string {
  // 1. Direct sessionStorage / localStorage key for guest confirmation email
  try {
    const directEmail = selectPreferredEmail([
      sessionStorage.getItem("guest-confirmation-email"),
      sessionStorage.getItem("guest-payment-email"),
      localStorage.getItem("guest-confirmation-email"),
    ]);
    if (directEmail) {
      return directEmail;
    }
  } catch {
    // Ignore storage parse errors
  }

  // 2. Company response from registration step 1 / step 2 API
  const compEmail = selectPreferredEmail([
    compResp?.primary_email,
    compResp?.default_email,
    compResp?.preferred_email,
    compResp?.customer?.primary_email,
    compResp?.customer?.default_email,
    compResp?.customer?.preferred_email,
    compResp?.email,
    compResp?.customer?.email,
    compResp?.notification_email,
    compResp?.customer?.notification_email,
    compResp?.customer_email,
    compResp?.user_email,
    compResp?.customer_details?.primary_email,
    compResp?.customer_details?.email,
    compResp?.details?.primary_email,
    compResp?.details?.email,
    compResp?.data?.primary_email,
    compResp?.data?.email,
    compResp?.emails,
    compResp?.email_list,
    compResp?.email_addresses,
    compResp?.customer_emails,
    compResp?.customer?.emails,
    compResp?.customer?.email_list,
    compResp?.customer?.email_addresses,
    compResp?.customer_details?.emails,
    compResp?.details?.emails,
    compResp?.data?.emails,
    compResp?.email1,
    compResp?.email_1,
    compResp?.customer?.email1,
    compResp?.customer?.email_1,
    compResp?.secondary_email,
    compResp?.alt_email,
    compResp?.email2,
    compResp?.email_2,
    compResp?.customer?.secondary_email,
    compResp?.customer?.email2,
    compResp?.customer?.email_2,
  ]);
  if (compEmail) {
    return compEmail;
  }

  // 3. Redux oneTimePaymentInfo from Pay as Guest
  const reduxEmail = selectPreferredEmail([
    oneTimeInfo?.customer?.primary_email,
    oneTimeInfo?.customer?.email,
    oneTimeInfo?.primary_email,
    oneTimeInfo?.email,
    oneTimeInfo?.customer_email,
    oneTimeInfo?.customer?.emails,
    oneTimeInfo?.emails,
  ]);
  if (reduxEmail) {
    return reduxEmail;
  }

  // 4. Session storage guest-payment-state snapshot
  try {
    const raw = sessionStorage.getItem("guest-payment-state");
    if (raw) {
      const parsed = JSON.parse(raw) as NestedEmailRecord;
      const sessionEmail = selectPreferredEmail([
        parsed?.formData?.email,
        parsed?.customerDetails?.email,
        parsed?.customerDetails?.customer?.email,
        parsed?.oneTimeData?.customer?.email,
        parsed?.oneTimeData?.email,
      ]);
      if (sessionEmail) {
        return sessionEmail;
      }
    }
  } catch {
    // Ignore storage parse errors
  }

  // 5. Existing local/secure storage user/customer information
  try {
    const custInfo = getLocalStorage("intuity-customerInfo") as NestedEmailRecord | null;
    const custEmail = selectPreferredEmail([custInfo?.email, custInfo?.emails]);
    if (custEmail) {
      return custEmail;
    }
    const intuityUser = getLocalStorage("intuity-user") as NestedEmailRecord | null;
    const userEmail = selectPreferredEmail([
      intuityUser?.email,
      intuityUser?.body?.email,
    ]);
    if (userEmail) {
      return userEmail;
    }
  } catch {
    // Ignore storage parse errors
  }

  // 6. Portal Username (if the user entered an email in Step 2)
  const portalEmail = selectPreferredEmail([portalUsername]);
  if (portalEmail) {
    return portalEmail;
  }

  return "";
}
