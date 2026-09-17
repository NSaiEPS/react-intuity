import {
  getInvoicePdfAPI,
  InvoicePdfPayload,
  sendInvoiceEmailAPI,
  SendInvoiceEmailPayload,
} from "@/api/dashboard";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { toast } from "@/lib/custom-toast";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker for PDF.js
if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.js",
      import.meta.url
    ).toString();
  } catch (e) {
    // Fallback if URL resolution fails
  }
}

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
  id?: number | string | null;
  invoiceId?: number | string | null;
  aclRoleId?: number | string | null;
}

export interface ResolveInvoiceEmailParamsOptions extends ResolveInvoicePdfParamsOptions {
  id?: number | string | null;
  invoiceId?: number | string | null;
  aclRoleId?: number | string | null;
}

export interface ResolvedInvoiceEmailPayload {
  acl_role_id: number | string;
  customer_id: number | string;
  invoice_id: number | string;
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

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1);

  if (isIOS) {
    window.open(url, "_blank");
    if (!isString) {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    }
    return;
  }

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
    }, 5000);
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
 * Handles iOS popup blocker avoidance and Android direct file download.
 */
export async function downloadInvoicePdf(
  options: ResolveInvoicePdfParamsOptions = {}
): Promise<void> {
  const payload = resolveInvoicePdfParams(options);

  if (!payload.invoice_number) {
    toast.error("Invoice number is missing.");
    return;
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1);

  // On iOS Safari, window.open must be triggered synchronously during the user gesture
  // to avoid being blocked by the popup blocker after the async API fetch.
  let iosWindow: Window | null = null;
  if (isIOS) {
    iosWindow = window.open("about:blank", "_blank");
  }

  try {
    const { url, isBlobUrl } = await fetchInvoicePdfBlobUrl(options);
    const fileName = `invoice-${payload.invoice_number || "file"}.pdf`;

    if (isIOS && iosWindow) {
      iosWindow.location.href = url;
    } else {
      if (iosWindow) {
        iosWindow.close();
      }
      downloadFile(url, fileName);
    }

    if (isBlobUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);
    }
  } catch (error: any) {
    if (iosWindow) {
      iosWindow.close();
    }
    const msg = error?.message || "Failed to download invoice PDF.";
    toast.error(msg);
    throw error;
  }
}

/**
 * Prints the invoice PDF document directly using PDF.js.
 * Renders the PDF pages to high-resolution images in a hidden print frame,
 * ensuring only the PDF document (and not any webpage UI) is sent to the native print dialog.
 */
export async function printPdfFromUrl(pdfUrl: string): Promise<void> {
  if (!pdfUrl) return;

  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const pageImages: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      // Use 2.0 scale for crisp high-DPI print output
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        pageImages.push(canvas.toDataURL("image/png"));
      }
    }

    if (pageImages.length === 0) {
      throw new Error("Failed to render PDF pages for printing");
    }

    // Clean up any previous print iframe
    const oldIframe = document.getElementById("pdf-direct-print-iframe");
    if (oldIframe) {
      oldIframe.remove();
    }

    const printIframe = document.createElement("iframe");
    printIframe.id = "pdf-direct-print-iframe";
    printIframe.style.position = "fixed";
    printIframe.style.top = "0";
    printIframe.style.left = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "none";
    printIframe.style.visibility = "hidden";

    document.body.appendChild(printIframe);

    const printDoc = printIframe.contentWindow?.document;
    if (!printDoc) {
      throw new Error("Unable to open print frame document");
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            .page-wrapper {
              width: 100%;
              page-break-after: always;
              page-break-inside: avoid;
              display: block;
              margin: 0;
              padding: 0;
            }
            .page-wrapper:last-child {
              page-break-after: auto;
            }
            img {
              width: 100%;
              height: auto;
              display: block;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          ${pageImages.map((src) => `<div class="page-wrapper"><img src="${src}" /></div>`).join("")}
        </body>
      </html>
    `;

    printDoc.open();
    printDoc.write(html);
    printDoc.close();

    // Give browser a short tick to parse images into DOM, then trigger native print
    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        console.error("Print dialog invocation failed:", err);
      }
    }, 200);
  } catch (error) {
    console.error("printPdfFromUrl error:", error);
    // Fallback: try iframe contentWindow print
    try {
      const fallbackIframe = document.createElement("iframe");
      fallbackIframe.style.position = "fixed";
      fallbackIframe.style.width = "0";
      fallbackIframe.style.height = "0";
      fallbackIframe.style.border = "none";
      fallbackIframe.src = pdfUrl;
      document.body.appendChild(fallbackIframe);
      setTimeout(() => {
        fallbackIframe.contentWindow?.focus();
        fallbackIframe.contentWindow?.print();
      }, 500);
    } catch (e) {
      console.error("Fallback print error:", e);
    }
  }
}

/**
 * Dynamically resolves acl_role_id, customer_id, and invoice_id
 * for sending invoice emails.
 */
export function resolveInvoiceEmailParams(
  options: ResolveInvoiceEmailParamsOptions = {}
): ResolvedInvoiceEmailPayload {
  const {
    id,
    invoiceId,
    aclRoleId,
    customerId,
    invoiceNumber,
    lastBillInfo,
    invoiceDetails,
    dashBoardInfo,
    userInfo,
    oneTimeData,
  } = options;

  // 1. Resolve ACL role ID
  let resolvedAclRoleId: number | string = 0;
  if (aclRoleId !== undefined && aclRoleId !== null && aclRoleId !== "") {
    resolvedAclRoleId = aclRoleId;
  } else {
    const rawUser = userInfo?.body ? userInfo : (getLocalStorage("intuity-user") as IntuityUser | null);
    const roleFromStorage = rawUser?.body?.acl_role_id || (rawUser as any)?.acl_role_id;
    const roleFromUser = userInfo?.body?.acl_role_id || userInfo?.acl_role_id;
    const roleFromDashboard =
      dashBoardInfo?.customer?.acl_role_id ||
      dashBoardInfo?.body?.customer?.acl_role_id;

    resolvedAclRoleId = roleFromStorage || roleFromUser || roleFromDashboard || 4;
  }

  // 2. Resolve Customer ID using standard PDF parameter resolution
  const pdfParams = resolveInvoicePdfParams(options);
  const resolvedCustomerId = pdfParams.customer_id;

  // 3. Resolve Invoice ID
  let resolvedInvoiceId: number | string = 0;
  if (invoiceId !== undefined && invoiceId !== null && invoiceId !== "") {
    resolvedInvoiceId = invoiceId;
  } else if (id !== undefined && id !== null && id !== "") {
    resolvedInvoiceId = id;
  } else {
    const invoiceIdFromInvoiceDetails =
      invoiceDetails?.id ||
      invoiceDetails?.invoice_id ||
      invoiceDetails?.last_bill?.[0]?.id ||
      invoiceDetails?.last_bill?.id ||
      invoiceDetails?.get_invoices?.[0]?.id ||
      invoiceDetails?.get_invoices?.[0]?.invoice_id;

    const invoiceIdFromLastBill =
      lastBillInfo?.last_bill?.id ||
      lastBillInfo?.last_bill?.[0]?.id ||
      lastBillInfo?.get_invoices?.[0]?.id ||
      lastBillInfo?.get_invoices?.[0]?.invoice_id ||
      lastBillInfo?.id;

    const invoiceIdFromOneTime =
      oneTimeData?.last_bill?.[0]?.id ||
      oneTimeData?.last_bill?.id ||
      oneTimeData?.get_invoices?.[0]?.id ||
      oneTimeData?.invoice?.[0]?.id ||
      oneTimeData?.invoice?.id ||
      oneTimeData?.id;

    const invoiceIdFromDashboard =
      dashBoardInfo?.last_bill?.id ||
      dashBoardInfo?.last_bill?.[0]?.id ||
      dashBoardInfo?.get_invoices?.[0]?.id;

    let invoiceIdFromListMatch: number | string = 0;
    const targetInvoiceNumber = pdfParams.invoice_number;
    if (targetInvoiceNumber) {
      const allInvoices = [
        ...(Array.isArray(lastBillInfo?.get_invoices) ? lastBillInfo.get_invoices : []),
        ...(Array.isArray(invoiceDetails?.get_invoices) ? invoiceDetails.get_invoices : []),
        ...(Array.isArray(oneTimeData?.get_invoices) ? oneTimeData.get_invoices : []),
        ...(Array.isArray(dashBoardInfo?.get_invoices) ? dashBoardInfo.get_invoices : []),
      ];
      const match = allInvoices.find(
        (inv) =>
          String(inv?.invoice_number || inv?.invoice_no || "").trim() ===
          String(targetInvoiceNumber).trim()
      );
      if (match?.id) {
        invoiceIdFromListMatch = match.id;
      }
    }

    resolvedInvoiceId =
      invoiceIdFromListMatch ||
      invoiceIdFromInvoiceDetails ||
      invoiceIdFromLastBill ||
      invoiceIdFromOneTime ||
      invoiceIdFromDashboard ||
      0;
  }

  return {
    acl_role_id: !isNaN(Number(resolvedAclRoleId)) && resolvedAclRoleId !== "" && resolvedAclRoleId !== null ? Number(resolvedAclRoleId) : resolvedAclRoleId,
    customer_id: !isNaN(Number(resolvedCustomerId)) && resolvedCustomerId !== "" && resolvedCustomerId !== null ? Number(resolvedCustomerId) : resolvedCustomerId,
    invoice_id: !isNaN(Number(resolvedInvoiceId)) && resolvedInvoiceId !== "" && resolvedInvoiceId !== null ? Number(resolvedInvoiceId) : resolvedInvoiceId,
  };
}

/**
 * Triggers the POST /send-invoice-email API with dynamically resolved parameters.
 */
export async function sendInvoiceEmail(
  options: ResolveInvoiceEmailParamsOptions = {}
): Promise<{ success: boolean; message: string; data?: any }> {
  const payload = resolveInvoiceEmailParams(options);

  if (!payload.invoice_id) {
    const errorMsg = "Invoice ID is missing. Cannot send invoice email.";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!payload.customer_id) {
    const errorMsg = "Customer ID is missing. Cannot send invoice email.";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!payload.acl_role_id) {
    const errorMsg = "User role ID is missing. Cannot send invoice email.";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await sendInvoiceEmailAPI(payload);

    if (response?.status === false) {
      const errorMsg =
        response?.message ||
        (Array.isArray(response?.body?.errors)
          ? response.body.errors.join(", ")
          : typeof response?.body?.errors === "string"
          ? response.body.errors
          : "") ||
        "Failed to send invoice email.";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const successMsg = response?.message || "Invoice email sent successfully.";
    toast.success(successMsg);
    return { success: true, message: successMsg, data: response };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      (Array.isArray(error?.response?.data?.body?.errors)
        ? error.response.data.body.errors.join(", ")
        : typeof error?.response?.data?.body?.errors === "string"
        ? error.response.data.body.errors
        : null) ||
      error?.message ||
      "Failed to send invoice email. Please try again.";

    if (!error?.message?.includes("is missing")) {
      toast.error(errorMessage);
    }
    throw error;
  }
}



