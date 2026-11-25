export interface TransactionStatusMeta {
  key: "success" | "declined" | "pending" | "authorization" | "reversed" | "deleted";
  label: string;
  bg: string;
  color: string;
}

export const TRANSACTION_STATUS_MAP: Record<TransactionStatusMeta["key"], TransactionStatusMeta> = {
  success: {
    key: "success",
    label: "Success",
    bg: "#DCFCE7",
    color: "#15803D",
  },
  declined: {
    key: "declined",
    label: "Declined",
    bg: "#FEE2E2",
    color: "#B91C1C",
  },
  pending: {
    key: "pending",
    label: "Pending",
    bg: "#FEF3C7",
    color: "#B45309",
  },
  authorization: {
    key: "authorization",
    label: "Authorization",
    bg: "#DBEAFE",
    color: "#1D4ED8",
  },
  reversed: {
    key: "reversed",
    label: "Reversed",
    bg: "#E5E7EB",
    color: "#475569",
  },
  deleted: {
    key: "deleted",
    label: "Deleted",
    bg: "#FEE2E2",
    color: "#B91C1C",
  },
};

const isFlagEnabled = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  return false;
};

const hasDeletedTimestamp = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed !== "" && trimmed !== "0000-00-00" && trimmed !== "0000-00-00 00:00:00";
};

const mapStringStatus = (raw: unknown): TransactionStatusMeta | null => {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;

  if (["deleted", "delete", "removed"].includes(normalized)) {
    return TRANSACTION_STATUS_MAP.deleted;
  }
  if (["reversed", "reverse"].includes(normalized)) {
    return TRANSACTION_STATUS_MAP.reversed;
  }
  if (["authorization", "authorized", "auth"].includes(normalized)) {
    return TRANSACTION_STATUS_MAP.authorization;
  }
  if (["pending", "in_progress", "processing"].includes(normalized)) {
    return TRANSACTION_STATUS_MAP.pending;
  }
  if (["declined", "decline", "failed", "fail", "rejected"].includes(normalized)) {
    return TRANSACTION_STATUS_MAP.declined;
  }
  if (["success", "succeeded", "completed", "approved", "paid"].includes(normalized)) {
    return TRANSACTION_STATUS_MAP.success;
  }
  return null;
};

/**
 * Resolves the display metadata for a billing/payment/late-fee transaction.
 * Supports soft-delete flags (`is_deleted`, `deleted`, `is_delete`, `deleted_at`),
 * explicit status labels (`status_text`, `status_label`, `transaction_status`),
 * and numeric/string status codes (`0`..`5`, `-1`, `"Deleted"`, etc.).
 */
export function resolveTransactionStatusMeta(
  status: unknown,
  row?: Record<string, unknown> | null
): TransactionStatusMeta | null {
  if (row && typeof row === "object") {
    if (
      isFlagEnabled(row.is_deleted) ||
      isFlagEnabled(row.deleted) ||
      isFlagEnabled(row.is_delete) ||
      isFlagEnabled(row.late_fee_deleted) ||
      isFlagEnabled(row.is_void) ||
      isFlagEnabled(row.voided) ||
      hasDeletedTimestamp(row.deleted_at)
    ) {
      return TRANSACTION_STATUS_MAP.deleted;
    }

    const explicitTextStatus =
      mapStringStatus(row.status_text) ??
      mapStringStatus(row.status_label) ??
      mapStringStatus(row.transaction_status) ??
      mapStringStatus(row.status_name);
    if (explicitTextStatus) {
      return explicitTextStatus;
    }
  }

  const textStatus = mapStringStatus(status);
  if (textStatus) {
    return textStatus;
  }

  if (status === null || status === undefined || status === "") {
    return null;
  }

  const numeric = Number(status);
  if (!Number.isNaN(numeric)) {
    switch (numeric) {
      case 1:
        return TRANSACTION_STATUS_MAP.success;
      case 0:
        return TRANSACTION_STATUS_MAP.declined;
      case 2:
        return TRANSACTION_STATUS_MAP.pending;
      case 3:
        return TRANSACTION_STATUS_MAP.authorization;
      case 4:
        return TRANSACTION_STATUS_MAP.reversed;
      case 5:
      case -1:
        return TRANSACTION_STATUS_MAP.deleted;
      default:
        return null;
    }
  }

  return null;
}
