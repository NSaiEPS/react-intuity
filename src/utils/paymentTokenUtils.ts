/**
 * Checks whether a payment method object holds a Forte single-use one-time token (`ott_`).
 * Forte recurring AutoPay transactions require a permanent Paymethod token (`mth_`),
 * which must be generated server-side by exchanging the one-time token through the
 * payment gateway REST API. Never converts or logs raw token values.
 */
export function hasOneTimePaymentToken(method: unknown): boolean {
  if (!method || typeof method !== "object") return false;
  const record = method as Record<string, unknown>;
  const candidates = [
    record.card_token,
    record.token,
    record.paymethod_token,
    record.payment_method_token,
    record.forte_token,
  ];

  return candidates.some(
    (val) => typeof val === "string" && val.trim().toLowerCase().startsWith("ott_")
  );
}

/**
 * Extracts the newly added payment method record returned by `settings/front/payment-method`.
 */
export function extractSavedPaymentMethod(resBody: unknown): Record<string, unknown> | null {
  if (!resBody || typeof resBody !== "object") return null;
  const body = resBody as Record<string, unknown>;

  if (body.selected_card && typeof body.selected_card === "object") {
    return body.selected_card as Record<string, unknown>;
  }
  if (Array.isArray(body.mycards) && body.mycards.length > 0) {
    const last = body.mycards[body.mycards.length - 1];
    if (last && typeof last === "object") {
      return last as Record<string, unknown>;
    }
  }
  if ("card_token" in body || "token" in body || "id" in body) {
    return body;
  }
  return null;
}

export const ONE_TIME_TOKEN_AUTOPAY_ERROR =
  "This payment method uses a single-use one-time token and cannot be enrolled in recurring AutoPay. Please re-add your payment method or contact support.";
