import { jsPDF } from "jspdf";
import { type InvoiceItem } from "@/types/invoice";
import {
  NOTO_SANS_BLACK_BASE64,
  NOTO_SANS_BOLD_BASE64,
  NOTO_SANS_REGULAR_BASE64,
  SPACE_MONO_BOLD_BASE64,
  SPACE_MONO_REGULAR_BASE64,
} from "../pdf-fonts";
import { formatCurrencyAmount } from "../invoice-format";
import {
  type InvoiceTemplate,
  type CustomColors,
  INVOICE_TEMPLATES,
} from "../pdf-templates";

export type { InvoiceTemplate, CustomColors };
export { INVOICE_TEMPLATES };

export const FONT_FAMILY = "NotoSans";
export const FONT_FAMILY_MONO = "SpaceMono";
export const FONT_FAMILY_BLACK = "NotoSansBlack";

/**
 * Registers the bundled Noto Sans subset with this jsPDF instance so currency
 * symbols outside WinAnsi (₹, €, ¥) render correctly. jsPDF's built-in
 * "helvetica" is a Standard-14 PDF font limited to WinAnsi — it silently
 * substitutes a fallback glyph (often mis-sized) for anything outside that set,
 * which both looks wrong and throws off autoTable's column-width math, causing
 * text to overflow table cells. Registering a real Unicode font fixes both.
 */
export function registerFonts(doc: jsPDF) {
  doc.addFileToVFS("NotoSans-Regular.ttf", NOTO_SANS_REGULAR_BASE64);
  doc.addFont("NotoSans-Regular.ttf", FONT_FAMILY, "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", NOTO_SANS_BOLD_BASE64);
  doc.addFont("NotoSans-Bold.ttf", FONT_FAMILY, "bold");
  // "black" isn't a real jsPDF FontStyle — the Modern template selects this
  // weight by calling doc.setFont(FONT_FAMILY, "bold") after switching the
  // family to FONT_FAMILY_BLACK instead, so it's registered under its own family name.
  doc.addFileToVFS("NotoSans-Black.ttf", NOTO_SANS_BLACK_BASE64);
  doc.addFont("NotoSans-Black.ttf", FONT_FAMILY_BLACK, "bold");
  doc.addFont("NotoSans-Black.ttf", FONT_FAMILY_BLACK, "normal");
  // Space Mono — used by the Clean template for tabular/fixed-width numeric
  // columns (matches the reference design's monospaced digit alignment).
  doc.addFileToVFS("SpaceMono-Regular.ttf", SPACE_MONO_REGULAR_BASE64);
  doc.addFont("SpaceMono-Regular.ttf", FONT_FAMILY_MONO, "normal");
  doc.addFileToVFS("SpaceMono-Bold.ttf", SPACE_MONO_BOLD_BASE64);
  doc.addFont("SpaceMono-Bold.ttf", FONT_FAMILY_MONO, "bold");
}

export interface InvoicePdfData {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  category?: string;
  currencySymbol: string;
  currencyCode?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercentage: number;
  tax: number;
  discountLabel?: string;
  discount: number;
  grandTotal: number;
  notes?: string;
  template?: InvoiceTemplate;
  /** The invoice's own "Invoice Theme" setting from the "Customize Invoice"
   * section (independent of the app's own UI theme) — only consulted by the
   * Clean template, whose background flips black/white based on this.
   * Defaults to light (false) when unset. */
  isDarkMode?: boolean;
  /** Per-template color overrides from the "Customize Invoice" section.
   * Slots left unset fall back to that template's built-in default —
   * see TEMPLATE_COLOR_SLOTS in pdf-templates.ts. Not consulted by Clean. */
  customColors?: CustomColors;
}

export function formatCurrency(amount: number, symbol: string, currencyCode?: string): string {
  return formatCurrencyAmount(amount, symbol, currencyCode);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** DD/MM/YYYY, matching the reference invoice's metadata grid date format. */
export function formatDateSlash(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// ---------------------------------------------------------------------------
// Small vector icons drawn with jsPDF's own line/shape primitives (mail,
// phone, home) so the PDF's Billed To / Billed By contact lines carry the
// same at-a-glance icons as the on-screen preview.
// ---------------------------------------------------------------------------
export function drawMailIcon(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.09);
  doc.rect(x, y, size, size * 0.72);
  doc.line(x, y, x + size / 2, y + size * 0.44);
  doc.line(x + size / 2, y + size * 0.44, x + size, y);
}

export function drawPhoneIcon(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.11);
  const w = size * 0.62;
  const h = size;
  const bx = x + (size - w) / 2;
  doc.roundedRect(bx, y, w, h, size * 0.14, size * 0.14, "S");
  doc.setLineWidth(size * 0.09);
  doc.line(bx + w * 0.32, y + size * 0.16, bx + w * 0.68, y + size * 0.16);
}

export function drawHomeIcon(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.09);
  const roofTipY = y;
  const eaveY = y + size * 0.42;
  const baseY = y + size;
  doc.line(x + size / 2, roofTipY, x, eaveY);
  doc.line(x + size / 2, roofTipY, x + size, eaveY);
  doc.line(x, eaveY, x, baseY);
  doc.line(x + size, eaveY, x + size, baseY);
  doc.line(x, baseY, x + size, baseY);
}

export interface LoadedLogo {
  /** PNG data URL, re-rasterized via canvas so any source format (SVG, WebP, GIF, PNG, JPEG) embeds reliably. */
  dataUrl: string;
  width: number;
  height: number;
}

export type LogoAttemptResult =
  | { status: "ok"; logo: LoadedLogo }
  | { status: "failed-to-load" }
  | { status: "tainted" };

export function attemptLoadLogo(src: string, useCrossOrigin: boolean, timeoutMs: number): Promise<LogoAttemptResult> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const finish = (result: LogoAttemptResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timer = setTimeout(() => finish({ status: "failed-to-load" }), timeoutMs);

    if (useCrossOrigin) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      clearTimeout(timer);
      if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
        finish({ status: "failed-to-load" });
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish({ status: "failed-to-load" });
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        finish({ status: "ok", logo: { dataUrl, width: img.naturalWidth, height: img.naturalHeight } });
      } catch {
        finish({ status: "tainted" });
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish({ status: "failed-to-load" });
    };
    img.src = src;
  });
}

export async function loadLogo(
  src: string,
  timeoutMs = 6000
): Promise<{ logo: LoadedLogo | null; warning: string | null }> {
  if (src.startsWith("data:")) {
    const result = await attemptLoadLogo(src, false, timeoutMs);
    return result.status === "ok"
      ? { logo: result.logo, warning: null }
      : { logo: null, warning: "The logo image couldn't be read — it may be corrupted. It was left out of the PDF." };
  }

  const viaCors = await attemptLoadLogo(src, true, timeoutMs);
  if (viaCors.status === "ok") return { logo: viaCors.logo, warning: null };

  const viaPlain = await attemptLoadLogo(src, false, timeoutMs);
  if (viaPlain.status === "ok") return { logo: viaPlain.logo, warning: null };

  if (viaPlain.status === "tainted" || viaCors.status === "tainted") {
    return {
      logo: null,
      warning:
        "The logo couldn't be embedded because that image's host doesn't allow cross-origin access. It was left out of the PDF — try uploading the logo file directly instead of pasting a URL.",
    };
  }
  return {
    logo: null,
    warning: "The logo URL couldn't be loaded (it may be unreachable or invalid). It was left out of the PDF.",
  };
}

export type ColorizableTemplateArg = "classic" | "modern" | "elegant" | "sidebar";

export interface TemplateContext {
  doc: jsPDF;
  invoice: InvoicePdfData;
  logo: LoadedLogo | null;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  footerReserve: number;
  currency: string;
  currencyCode?: string;
  validItems: InvoiceItem[];
  color: (template: ColorizableTemplateArg, slotKey: string) => [number, number, number];
  isDark: boolean;
}

export function getLastAutoTableFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}
