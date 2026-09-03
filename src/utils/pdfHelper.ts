import { getInvoicePdfAPI, InvoicePdfPayload } from "@/api/dashboard";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { toast } from "@/lib/custom-toast";

export interface ResolveInvoicePdfParamsOptions {
  customerId?: number | string | null;
  invoiceNumber?: string | null;
  companyId?: number | string | null;
  isGuestPage?: number | string | boolean | null;
  lastBillInfo?: any;
  invoiceDetails?: any;
  dashBoardInfo?: any;
  userInfo?: any;
  oneTimeData?: any;
}

/**
 * Dynamically resolves customer_id, invoice_number, and company_id
 * from arguments, Redux state, and secure storage.
 */
export function resolveInvoicePdfParams(
  options: ResolveInvoicePdfParamsOptions = {}
): InvoicePdfPayload {
  const {
    customerId,
    invoiceNumber,
    companyId,
    isGuestPage,
    lastBillInfo,
    invoiceDetails,
    dashBoardInfo,
    userInfo,
    oneTimeData,
  } = options;

  // 1. Resolve customer_id
  let resolvedCustomerId: number | string = 0;
  if (customerId !== undefined && customerId !== null && customerId !== "") {
    resolvedCustomerId = customerId;
  } else {
    const rawUser = userInfo?.body ? userInfo : (getLocalStorage("intuity-user") as IntuityUser | null);
    const userFromStorage = rawUser?.body?.customer_id;
    const userFromDashboard = dashBoardInfo?.customer?.id || dashBoardInfo?.body?.customer?.id;
    const userFromLastBill = lastBillInfo?.customer?.id || lastBillInfo?.customer_id;
    const userFromInvoice = invoiceDetails?.customer?.id || invoiceDetails?.customer_id;
    const userFromOneTime =
      oneTimeData?.customer?.id ||
      oneTimeData?.customer?.customer_id ||
      oneTimeData?.customer_id ||
      oneTimeData?.id;

    resolvedCustomerId =
      userFromStorage ||
      userFromDashboard ||
      userFromLastBill ||
      userFromInvoice ||
      userFromOneTime ||
      0;
  }

  // 2. Resolve invoice_number (body.get_invoices[0].invoice_number is preferred)
  let resolvedInvoiceNumber = "";
  if (invoiceNumber && typeof invoiceNumber === "string" && invoiceNumber.trim() !== "") {
    resolvedInvoiceNumber = invoiceNumber.trim();
  } else {
    const firstInvoiceInList =
      lastBillInfo?.get_invoices?.[0]?.invoice_number ||
      lastBillInfo?.get_invoices?.[0]?.invoice_no ||
      lastBillInfo?.get_invoices?.[0]?.invoicenumber ||
      oneTimeData?.get_invoices?.[0]?.invoice_number ||
      oneTimeData?.get_invoices?.[0]?.invoice_no ||
      oneTimeData?.get_invoices?.[0]?.invoicenumber;

    const lastBillNumber =
      lastBillInfo?.last_bill?.[0]?.invoice_number ||
      lastBillInfo?.last_bill?.invoice_number ||
      invoiceDetails?.last_bill?.[0]?.invoice_number ||
      invoiceDetails?.last_bill?.invoice_number ||
      oneTimeData?.last_bill?.[0]?.invoice_number ||
      oneTimeData?.last_bill?.[0]?.invoice_no ||
      oneTimeData?.last_bill?.invoice_number ||
      oneTimeData?.last_bill?.invoice_no ||
      oneTimeData?.invoice?.invoice_number ||
      oneTimeData?.invoice?.[0]?.invoice_number ||
      oneTimeData?.invoice_number ||
      oneTimeData?.customer?.last_bill?.[0]?.invoice_number ||
      oneTimeData?.customer?.last_bill?.invoice_number ||
      oneTimeData?.customer?.invoice_number;

    resolvedInvoiceNumber = String(firstInvoiceInList || lastBillNumber || "").trim();
  }

  // 3. Resolve company_id
  let resolvedCompanyId: number | string = 2;
  if (companyId !== undefined && companyId !== null && companyId !== "") {
    resolvedCompanyId = companyId;
  } else {
    const companyFromLastBill =
      lastBillInfo?.company?.id || lastBillInfo?.company?.company_id;
    const companyFromDashboard =
      dashBoardInfo?.company?.id ||
      dashBoardInfo?.body?.company?.id ||
      dashBoardInfo?.company_id;
    const companyFromLocal =
      (getLocalStorage("intuity-company") as any)?.id ||
      (getLocalStorage("intuity-company") as any)?.company_id;
    const companyFromUser =
      (getLocalStorage("intuity-user") as any)?.body?.company_id ||
      (getLocalStorage("intuity-user") as any)?.company_id;
    const companyFromOneTime =
      oneTimeData?.company?.id ||
      oneTimeData?.company?.company_id ||
      oneTimeData?.company_id;

    resolvedCompanyId =
      companyFromLastBill ||
      companyFromDashboard ||
      companyFromLocal ||
      companyFromUser ||
      companyFromOneTime ||
      2;
  }

  // 4. Resolve is_guest_page
  let resolvedIsGuestPage: number | string | undefined = undefined;
  if (isGuestPage !== undefined && isGuestPage !== null && isGuestPage !== "") {
    resolvedIsGuestPage = isGuestPage === true ? 1 : isGuestPage === false ? 0 : isGuestPage;
  } else if (oneTimeData) {
    resolvedIsGuestPage = 1;
  }

  const payload: InvoicePdfPayload = {
    customer_id: isNaN(Number(resolvedCustomerId)) ? resolvedCustomerId : Number(resolvedCustomerId),
    invoice_number: resolvedInvoiceNumber,
    company_id: isNaN(Number(resolvedCompanyId)) ? resolvedCompanyId : Number(resolvedCompanyId),
  };

  if (resolvedIsGuestPage !== undefined) {
    payload.is_guest_page = resolvedIsGuestPage;
  }

  return payload;
}

/**
 * Converts a base64 string or base64 data URI to a PDF Blob.
 */
export function base64ToBlob(base64Data: string, contentType = "application/pdf"): Blob {
  const base64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const cleanBase64 = base64.replace(/[\r\n\s]+/g, "");
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteNumbers.buffer as ArrayBuffer], { type: contentType });
}

/**
 * Checks whether a given string is a valid base64 encoded string.
 */
function isBase64String(str: string): boolean {
  if (!str || str.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str.replace(/[\r\n\s]+/g, ""));
}

export interface PdfResponseResult {
  url?: string;
  blob?: Blob;
  isBlobUrl?: boolean;
}

/**
 * Parses and handles backend response formats (Blob, base64 data URI, raw base64, direct URL, JSON wrapper).
 */
export async function handlePdfResponse(data: any): Promise<PdfResponseResult> {
  if (!data) return {};

  // 1. Direct Blob
  if (data instanceof Blob) {
    if (data.type === "application/json" || data.type === "text/json") {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        return handlePdfResponse(json);
      } catch {
        // fallback to blob
      }
    } else {
      try {
        const slice = data.slice(0, 50);
        const text = await slice.text();
        const trimmed = text.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          const fullText = await data.text();
          const json = JSON.parse(fullText);
          return handlePdfResponse(json);
        }
      } catch {
        // fallback to PDF blob
      }
    }

    const blob = data.type ? data : new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return { url, blob, isBlobUrl: true };
  }

  // 2. Direct ArrayBuffer
  if (data instanceof ArrayBuffer) {
    const blob = new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return { url, blob, isBlobUrl: true };
  }

  // 3. Extract candidate string/object from possible wrapper keys
  const candidate =
    data?.body?.invoice_url ||
    data?.body?.file_url ||
    data?.invoice_url ||
    data?.file_url ||
    data?.body?.pdf ||
    data?.body?.base64 ||
    data?.body?.pdf_url ||
    data?.body?.url ||
    data?.body?.file ||
    data?.body?.data ||
    data?.body?.pdf_base64 ||
    (typeof data?.body === "string" ? data.body : null) ||
    data?.data?.invoice_url ||
    data?.data?.file_url ||
    data?.data?.pdf ||
    data?.data?.url ||
    data?.data?.base64 ||
    data?.data ||
    data?.pdf ||
    data?.pdf_url ||
    data?.file_url ||
    data?.url ||
    data?.base64 ||
    data?.file ||
    (typeof data === "string" ? data : null);


  if (typeof candidate === "string") {
    const trimmed = candidate.trim();

    // Check if it's a URL
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("blob:")
    ) {
      return { url: trimmed, isBlobUrl: trimmed.startsWith("blob:") };
    }

    // Check if it's a data URI (PDF or image)
    if (trimmed.startsWith("data:application/pdf") || trimmed.startsWith("data:")) {
      try {
        const blob = base64ToBlob(trimmed);
        const url = URL.createObjectURL(blob);
        return { url, blob, isBlobUrl: true };
      } catch (err) {
        console.error("Failed to parse base64 data URI:", err);
      }
    }

    // Check if it's raw base64
    if (isBase64String(trimmed) || trimmed.startsWith("JVBERi0")) {
      try {
        const blob = base64ToBlob(trimmed, "application/pdf");
        const url = URL.createObjectURL(blob);
        return { url, blob, isBlobUrl: true };
      } catch (err) {
        console.error("Failed to parse raw base64 string:", err);
      }
    }
  }

  return {};
}

/**
 * Triggers a browser file download using a given Blob or URL.
 */
export function downloadFile(urlOrBlob: string | Blob, fileName: string): void {
  const isString = typeof urlOrBlob === "string";
  const url = isString ? urlOrBlob : URL.createObjectURL(urlOrBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (!isString) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

/**
 * Fetches the invoice PDF via the new API (`POST /get-invoice-pdf`) and returns a displayable URL.
 */
export async function fetchInvoicePdfBlobUrl(
  options: ResolveInvoicePdfParamsOptions = {}
): Promise<{ url: string; isBlobUrl?: boolean; revoke: () => void }> {
  const payload = resolveInvoicePdfParams(options);

  if (!payload.invoice_number) {
    throw new Error("Invoice number is missing. Cannot fetch invoice PDF.");
  }

  try {
    const response = await getInvoicePdfAPI(payload);

    if (response?.status === false) {
      const errorMsg =
        response?.message ||
        (Array.isArray(response?.body?.errors) ? response.body.errors.join(", ") : "") ||
        "Failed to fetch invoice PDF from server";
      throw new Error(errorMsg);
    }

    const result = await handlePdfResponse(response);

    if (!result.url) {
      throw new Error(
        response?.message || "Invalid or empty PDF response received from server."
      );
    }

    return {
      url: result.url,
      isBlobUrl: result.isBlobUrl,
      revoke: () => {
        if (result.isBlobUrl && result.url) {
          URL.revokeObjectURL(result.url);
        }
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    let responseData = error?.response?.data;

    if (responseData instanceof Blob) {
      try {
        const text = await responseData.text();
        responseData = JSON.parse(text);
      } catch {
        // Ignore non-json blobs
      }
    }

    const errorMessage =
      responseData?.message ||
      (Array.isArray(responseData?.body?.errors)
        ? responseData.body.errors.join(", ")
        : typeof responseData?.body?.errors === "string"
        ? responseData.body.errors
        : null) ||
      error?.message ||
      "Request failed with status code " + (status || 500);

    console.group("❌ [Invoice PDF API Debug Info]");
    console.error("Endpoint:", "POST https://test-intuity.waterbill.com/get-invoice-pdf");
    console.error("Payload:", payload);
    console.error("HTTP Status:", status || "Network / Redirect Error");
    console.error("Response Data:", responseData || error?.response || error);
    console.error("Error Message:", errorMessage);
    console.groupEnd();

    const err = new Error(errorMessage);
    (err as any).status = status;
    (err as any).responseData = responseData;
    throw err;
  }
}


/**
 * Fetches the invoice PDF via the new API and automatically triggers a file download.
 */
export async function downloadInvoicePdf(
  options: ResolveInvoicePdfParamsOptions = {}
): Promise<void> {
  const payload = resolveInvoicePdfParams(options);

  if (!payload.invoice_number) {
    toast.error("Invoice number is missing.");
    return;
  }

  try {
    const { url, isBlobUrl } = await fetchInvoicePdfBlobUrl(options);
    const fileName = `invoice-${payload.invoice_number || "file"}.pdf`;
    downloadFile(url, fileName);

    if (isBlobUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
    }
  } catch (error: any) {
    const msg = error?.message || "Failed to download invoice PDF.";
    toast.error(msg);
    throw error;
  }
}

