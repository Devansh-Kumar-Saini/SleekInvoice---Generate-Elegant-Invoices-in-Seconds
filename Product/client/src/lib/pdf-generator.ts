import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { type InvoiceItem } from "@/types/invoice";
import {
  NOTO_SANS_BLACK_BASE64,
  NOTO_SANS_BOLD_BASE64,
  NOTO_SANS_REGULAR_BASE64,
  SPACE_MONO_BOLD_BASE64,
  SPACE_MONO_REGULAR_BASE64,
} from "./pdf-fonts";
import { amountToWords, formatCurrencyAmount } from "./invoice-format";
// Template metadata lives in its own dependency-free module so callers that
// only need the template list/type (e.g. the template <Select>, the live
// preview) don't have to pull in jsPDF + the embedded fonts below. Re-exported
// here so existing imports from "./pdf-generator" keep working unchanged.
import { type InvoiceTemplate, INVOICE_TEMPLATES } from "./pdf-templates";

export type { InvoiceTemplate };
export { INVOICE_TEMPLATES };

const FONT_FAMILY = "NotoSans";
const FONT_FAMILY_MONO = "SpaceMono";

/**
 * Registers the bundled Noto Sans subset with this jsPDF instance so currency
 * symbols outside WinAnsi (₹, €, ¥) render correctly. jsPDF's built-in
 * "helvetica" is a Standard-14 PDF font limited to WinAnsi — it silently
 * substitutes a fallback glyph (often mis-sized) for anything outside that set,
 * which both looks wrong and throws off autoTable's column-width math, causing
 * text to overflow table cells. Registering a real Unicode font fixes both.
 */
function registerFonts(doc: jsPDF) {
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

const FONT_FAMILY_BLACK = "NotoSansBlack";

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
  /** Current app theme — only consulted by the Clean template, whose
   * background flips black/white to match the app's own dark/light toggle. */
  isDarkMode?: boolean;
}

function formatCurrency(amount: number, symbol: string, currencyCode?: string): string {
  return formatCurrencyAmount(amount, symbol, currencyCode);
}

function formatDate(dateStr: string): string {
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
function formatDateSlash(dateStr: string): string {
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
// same at-a-glance icons as the on-screen preview. jsPDF can't embed a
// React icon component (lucide-react), so these are hand-drawn glyphs sized
// to sit inline with small body text; `size` is the glyph's bounding box in
// mm and (x, y) is its top-left corner.
// ---------------------------------------------------------------------------
function drawMailIcon(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.09);
  doc.rect(x, y, size, size * 0.72);
  doc.line(x, y, x + size / 2, y + size * 0.44);
  doc.line(x + size / 2, y + size * 0.44, x + size, y);
}

function drawPhoneIcon(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.11);
  // A simple mobile-phone silhouette (rounded rectangle body + a small
  // "speaker" notch near the top) — reads unambiguously as a phone even at
  // very small sizes, unlike a stylized handset-receiver curve.
  const w = size * 0.62;
  const h = size;
  const bx = x + (size - w) / 2;
  doc.roundedRect(bx, y, w, h, size * 0.14, size * 0.14, "S");
  doc.setLineWidth(size * 0.09);
  doc.line(bx + w * 0.32, y + size * 0.16, bx + w * 0.68, y + size * 0.16);
}

function drawHomeIcon(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.09);
  const roofTipY = y;
  const eaveY = y + size * 0.42;
  const baseY = y + size;
  // Roof (triangle).
  doc.line(x + size / 2, roofTipY, x, eaveY);
  doc.line(x + size / 2, roofTipY, x + size, eaveY);
  doc.line(x, eaveY, x, baseY);
  doc.line(x + size, eaveY, x + size, baseY);
  doc.line(x, baseY, x + size, baseY);
}

interface LoadedLogo {
  /** PNG data URL, re-rasterized via canvas so any source format (SVG, WebP, GIF, PNG, JPEG) embeds reliably. */
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a logo from any URL/data-URL and rasterizes it to a PNG data URL via canvas.
 * This sidesteps jsPDF's limited native image support (no SVG, finicky format sniffing)
 * by always handing jsPDF a plain PNG it can embed without guessing. Resolves with null
 * (rather than rejecting) on failure/timeout so a bad logo URL never breaks PDF generation.
 */
function loadLogo(src: string, timeoutMs = 6000): Promise<LoadedLogo | null> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const finish = (result: LoadedLogo | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timer);
      if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
        finish(null);
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        finish({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
      } catch {
        // Cross-origin images without CORS headers taint the canvas and throw on toDataURL.
        finish(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(null);
    };
    img.src = src;
  });
}

interface TemplateContext {
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
}

function getLastAutoTableFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

// ---------------------------------------------------------------------------
// Classic template — the original InvoiceForge design. Dark header-fill table,
// pink/red accent, generous card-like spacing.
// ---------------------------------------------------------------------------
function renderClassicTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const BRAND = {
    primary: [220, 38, 74] as [number, number, number],
    dark: [30, 30, 30] as [number, number, number],
    muted: [110, 110, 110] as [number, number, number],
    border: [225, 225, 225] as [number, number, number],
    headerFill: [40, 40, 40] as [number, number, number],
  };

  let yPos = margin + 4;
  const headerTop = yPos;
  const LOGO_MAX_W = 32;
  const LOGO_MAX_H = 20;

  if (logo) {
    const aspect = logo.width / logo.height;
    let drawW = LOGO_MAX_W;
    let drawH = drawW / aspect;
    if (drawH > LOGO_MAX_H) {
      drawH = LOGO_MAX_H;
      drawW = drawH * aspect;
    }
    try {
      doc.addImage(logo.dataUrl, "PNG", margin, headerTop, drawW, drawH);
    } catch {
      // Corrupt/unsupported image data — skip the logo rather than fail the whole PDF.
    }
  }

  const nameY = logo ? headerTop + LOGO_MAX_H + 7 : headerTop + 6;
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(19);
  doc.setTextColor(...BRAND.dark);
  doc.text(invoice.companyName || "Company Name", margin, nameY);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.primary);
  doc.text("INVOICE", pageWidth - margin, headerTop + 7, { align: "right" });

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  let metaY = headerTop + 15;
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, metaY, { align: "right" });
  metaY += 5.5;
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, metaY, { align: "right" });
  if (invoice.category) {
    metaY += 5.5;
    doc.text(`Category: ${invoice.category}`, pageWidth - margin, metaY, { align: "right" });
  }

  yPos = Math.max(nameY + 8, metaY + 8);

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  const billColWidth = contentWidth * 0.48;
  const billByX = margin;
  const billToX = margin + contentWidth - billColWidth;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);
  doc.text("BILLED BY", billByX, yPos);
  doc.text("BILL TO", billToX, yPos);
  yPos += 6;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.dark);
  doc.text(invoice.companyName || "Company Name", billByX, yPos);
  doc.text(invoice.customerName || "Customer Name", billToX, yPos);
  let billByY = yPos + 6;
  let billToY = yPos + 6;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);

  // Contact lines get a small leading icon (mail/phone/home) matching the
  // on-screen preview; text is indented past the icon and wrapped to the
  // remaining column width so long values (long emails, multi-line
  // addresses) wrap onto additional lines instead of overlapping whatever
  // comes next.
  const ICON_SIZE = 3;
  const ICON_GAP = 4.5;

  if (invoice.companyAddress) {
    const lines = doc.splitTextToSize(invoice.companyAddress, billColWidth - 6 - ICON_GAP);
    drawHomeIcon(doc, billByX, billByY - ICON_SIZE + 0.5, ICON_SIZE, BRAND.muted);
    doc.text(lines, billByX + ICON_GAP, billByY);
    billByY += lines.length * 4.6;
  }

  if (invoice.customerEmail) {
    const lines = doc.splitTextToSize(invoice.customerEmail, billColWidth - 6 - ICON_GAP);
    drawMailIcon(doc, billToX, billToY - ICON_SIZE + 0.5, ICON_SIZE, BRAND.muted);
    doc.text(lines, billToX + ICON_GAP, billToY);
    billToY += lines.length * 4.6;
  }
  if (invoice.customerPhone) {
    const lines = doc.splitTextToSize(invoice.customerPhone, billColWidth - 6 - ICON_GAP);
    drawPhoneIcon(doc, billToX, billToY - ICON_SIZE + 0.5, ICON_SIZE, BRAND.muted);
    doc.text(lines, billToX + ICON_GAP, billToY);
    billToY += lines.length * 4.6;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, billColWidth - 6 - ICON_GAP);
    drawHomeIcon(doc, billToX, billToY - ICON_SIZE + 0.5, ICON_SIZE, BRAND.muted);
    doc.text(addressLines, billToX + ICON_GAP, billToY);
    billToY += addressLines.length * 4.6;
  }

  yPos = Math.max(billByY, billToY) + 8;

  const itemsData = ctx.validItems.map((item) => [
    item.details ? `${item.name}\n${item.details}` : item.name,
    String(item.quantity),
    formatCurrency(item.price, currency, currencyCode),
    formatCurrency(item.quantity * item.price, currency, currencyCode),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Item Description", "Qty", "Unit Price", "Total"]],
    body: itemsData,
    margin: { left: margin, right: margin, bottom: footerReserve },
    theme: "plain",
    tableWidth: contentWidth,
    headStyles: {
      fillColor: BRAND.headerFill,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: BRAND.dark,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    styles: {
      font: FONT_FAMILY,
      valign: "middle",
      lineColor: BRAND.border,
      lineWidth: 0.3,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 38, halign: "right" },
      3: { cellWidth: 38, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const raw = String(data.cell.raw ?? "");
        if (raw.includes("\n")) {
          data.cell.styles.fontStyle = "normal";
        }
      }
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 55;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    yPos = margin + 8;
  }

  const summaryLabelX = pageWidth - margin - 55;
  const summaryValueX = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency, currencyCode) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency, currencyCode) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency, currencyCode)}`,
    });
  }

  rows.forEach((row) => {
    doc.setTextColor(...BRAND.muted);
    doc.text(row.label, summaryLabelX, yPos);
    doc.setTextColor(...BRAND.dark);
    doc.text(row.value, summaryValueX, yPos, { align: "right" });
    yPos += 6.5;
  });

  yPos += 2;
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.4);
  doc.line(summaryLabelX - 4, yPos - 4.5, summaryValueX, yPos - 4.5);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...BRAND.dark);
  doc.text("Total Due", summaryLabelX, yPos + 2);
  doc.setFontSize(15);
  doc.setTextColor(...BRAND.primary);
  doc.text(formatCurrency(invoice.grandTotal, currency, currencyCode), summaryValueX, yPos + 2.5, {
    align: "right",
  });

  yPos += 12;

  const wordsLabelWidth = pageWidth - margin - (summaryLabelX - 4);
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND.muted);
  doc.text("INVOICE TOTAL (IN WORDS)", summaryLabelX - 4, yPos);
  yPos += 4.5;
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.dark);
  const wordsText = amountToWords(invoice.grandTotal, currencyCode);
  const wordsLines = doc.splitTextToSize(wordsText, wordsLabelWidth);
  doc.text(wordsLines, summaryLabelX - 4, yPos);
  yPos += wordsLines.length * 4;

  yPos += 8;

  if (invoice.notes && invoice.notes.trim()) {
    if (yPos + 20 > pageHeight - footerReserve) {
      doc.addPage();
      yPos = margin + 8;
    }
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.muted);
    doc.text("NOTES", margin, yPos);
    yPos += 5.5;
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.dark);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(noteLines, margin, yPos);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    doc.text("Thank you for your business!", margin, pageHeight - 10);
    doc.text("Generated with InvoiceForge", pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
    if (pageCount > 1) {
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }
  }
}

// ---------------------------------------------------------------------------
// Clean template — matches the user-supplied reference invoice exactly: a
// giant thin page title, a label/value metadata grid, a two-column Billed
// By/To split with a vertical divider, a borderless items table with plain
// text headers, monospaced numeric columns, and an "Invoice Total (in
// words)" line. Background flips black/white with the app's own theme
// toggle (invoice.isDarkMode), rather than always being black.
// ---------------------------------------------------------------------------
function renderCleanTemplate(ctx: TemplateContext) {
  const { doc, invoice, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const isDark = !!invoice.isDarkMode;
  const BG = (isDark ? [10, 10, 10] : [255, 255, 255]) as [number, number, number];
  const INK = (isDark ? [245, 245, 245] : [15, 15, 15]) as [number, number, number];
  const GRAY = (isDark ? [150, 150, 150] : [120, 120, 120]) as [number, number, number];
  const LINE = (isDark ? [45, 45, 45] : [225, 225, 225]) as [number, number, number];

  const paintBackground = (targetPage?: number) => {
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...BG);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };
  paintBackground();

  let yPos = margin + 6;

  // Giant, thin-weight page title — "Invoice INV-0069" style.
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(30);
  doc.setTextColor(...INK);
  doc.text(`Invoice ${invoice.invoiceNumber || ""}`.trim(), margin, yPos);
  yPos += 12;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // --- Metadata label/value grid: Serial Number, Date, Payment Terms, Currency. ---
  const metaLabelX = margin;
  const metaValueX = margin + contentWidth * 0.22;
  const metaRows: Array<{ label: string; value: string }> = [
    { label: "Serial Number", value: (invoice.invoiceNumber || "").replace(/^INV-?/i, "") || invoice.invoiceNumber || "" },
    { label: "Date", value: formatDateSlash(invoice.date) },
  ];
  if (invoice.notes && invoice.notes.trim()) {
    metaRows.push({ label: "Payment Terms", value: invoice.notes.trim() });
  }
  metaRows.push({ label: "Currency", value: currencyCode || currency });

  doc.setFontSize(9);
  metaRows.forEach((row) => {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setTextColor(...GRAY);
    doc.text(row.label, metaLabelX, yPos);
    doc.setFont(FONT_FAMILY, "normal");
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(row.value, contentWidth * 0.5);
    doc.text(lines, metaValueX, yPos);
    yPos += 5.5 * Math.max(1, lines.length);
  });
  yPos += 4;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  // --- Billed By / Billed To — two columns with a vertical divider. ---
  const colGap = 10;
  const colWidth = (contentWidth - colGap) / 2;
  const billByX = margin;
  const billToX = margin + colWidth + colGap;
  const dividerX = margin + colWidth + colGap / 2;
  const billTopY = yPos;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Billed By", billByX, yPos);
  doc.text("Billed To", billToX, yPos);
  let byY = yPos + 6.5;
  let toY = yPos + 6.5;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...INK);
  doc.text(invoice.companyName || "Company Name", billByX, byY);
  doc.text(invoice.customerName || "Customer Name", billToX, toY);
  byY += 5.5;
  toY += 5.5;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  if (invoice.companyAddress) {
    const lines = doc.splitTextToSize(invoice.companyAddress, colWidth - 4);
    doc.text(lines, billByX, byY);
    byY += lines.length * 4.4;
  }
  const toContactParts = [invoice.customerEmail, invoice.customerPhone].filter(Boolean);
  if (toContactParts.length) {
    doc.text(toContactParts.join("  •  "), billToX, toY);
    toY += 4.4;
  }
  if (invoice.customerAddress) {
    const lines = doc.splitTextToSize(invoice.customerAddress, colWidth - 4);
    doc.text(lines, billToX, toY);
    toY += lines.length * 4.4;
  }

  yPos = Math.max(byY, toY) + 7;

  // Vertical divider between the two columns, spanning the Billed By/To block.
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(dividerX, billTopY - 4, dividerX, yPos - 3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  // --- Items — plain text column headers, no header fill, monospaced numbers. ---
  const colName = margin;
  const colQty = margin + contentWidth * 0.62;
  const colPrice = margin + contentWidth * 0.8;
  const colTotal = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  doc.text("Item", colName, yPos);
  doc.text("Qty", colQty, yPos, { align: "right" });
  doc.text("Price", colPrice, yPos, { align: "right" });
  doc.text("Total", colTotal, yPos, { align: "right" });
  yPos += 4;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  const footerLimit = pageHeight - footerReserve;
  const itemsTopOfBlock = yPos;
  ctx.validItems.forEach((item) => {
    const detailLines = item.details ? doc.splitTextToSize(item.details, contentWidth * 0.5) : [];
    const rowHeight = 11 + detailLines.length * 4;

    if (yPos + rowHeight > footerLimit) {
      doc.addPage();
      paintBackground();
      yPos = margin + 10;
    }

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(item.name, colName, yPos);

    doc.setFont(FONT_FAMILY_MONO, "normal");
    doc.setFontSize(9);
    doc.text(String(item.quantity), colQty, yPos, { align: "right" });
    doc.text(formatCurrency(item.price, currency, currencyCode), colPrice, yPos, { align: "right" });
    doc.text(formatCurrency(item.quantity * item.price, currency, currencyCode), colTotal, yPos, {
      align: "right",
    });

    if (detailLines.length) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAY);
      doc.text(detailLines, colName, yPos + 4.4);
    }

    yPos += rowHeight;
  });
  // A single rule under the last item row, matching the reference's sparse table.
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos - 4.5, pageWidth - margin, yPos - 4.5);

  const summaryLabelX = pageWidth - margin - 58;
  const summaryValueX = pageWidth - margin;

  // Mirrors the reference invoice's per-item subtotal breakdown, but that
  // only reads cleanly with a single line item — with several items it
  // would just duplicate the items table, so it's limited to that case.
  const showPerItemBreakdown = ctx.validItems.length <= 1;
  const rowCount =
    1 + // subtotal
    (showPerItemBreakdown ? ctx.validItems.length : 0) +
    (invoice.tax > 0 ? 1 : 0) +
    (invoice.discount > 0 ? 1 : 0);
  const wordsText = amountToWords(invoice.grandTotal, currencyCode);
  const wordsLineEstimate = Math.ceil(wordsText.length / 42);
  const summaryBlockHeight = rowCount * 5.5 + 14 + 14 + 5 + wordsLineEstimate * 4.5 + 8;

  // The reference leaves a large empty gap between the items table and the
  // totals block, which sit near the bottom of the page — reproduce that by
  // pushing the summary down toward the footer rather than flowing tightly,
  // as long as everything still fits above the footer.
  const desiredSummaryTop = footerLimit - summaryBlockHeight;
  yPos = Math.max(yPos + 10, Math.min(desiredSummaryTop, footerLimit - summaryBlockHeight));
  if (yPos < itemsTopOfBlock) yPos = itemsTopOfBlock + 20;
  if (yPos + summaryBlockHeight > footerLimit) {
    doc.addPage();
    paintBackground();
    yPos = margin + 10;
  }

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency, currencyCode) },
  ];
  if (showPerItemBreakdown) {
    ctx.validItems.forEach((item) => {
      rows.push({
        label: item.name,
        value: formatCurrency(item.quantity * item.price, currency, currencyCode),
      });
    });
  }
  if (invoice.tax > 0) {
    rows.push({
      label: `Tax (${invoice.taxPercentage}%)`,
      value: formatCurrency(invoice.tax, currency, currencyCode),
    });
  }
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency, currencyCode)}`,
    });
  }

  rows.forEach((row) => {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setTextColor(...GRAY);
    const labelLines = doc.splitTextToSize(row.label, summaryValueX - summaryLabelX - 24);
    doc.text(labelLines, summaryLabelX, yPos);
    doc.setFont(FONT_FAMILY_MONO, "normal");
    doc.setTextColor(...INK);
    doc.text(row.value, summaryValueX, yPos, { align: "right" });
    yPos += 5.5 * Math.max(1, labelLines.length);
  });

  yPos += 3;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(summaryLabelX - 4, yPos - 3.5, summaryValueX, yPos - 3.5);
  yPos += 5;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...GRAY);
  doc.text("Total", summaryLabelX, yPos + 3);
  doc.setFont(FONT_FAMILY_MONO, "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(formatCurrency(invoice.grandTotal, currency, currencyCode), summaryValueX, yPos + 3.2, {
    align: "right",
  });

  yPos += 14;

  // --- Invoice Total (in words). ---
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("Invoice Total (in words)", summaryLabelX - 4, yPos);
  yPos += 5;
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const wordsLines = doc.splitTextToSize(wordsText, pageWidth - margin - (summaryLabelX - 4));
  doc.text(wordsLines, summaryLabelX - 4, yPos);
  yPos += wordsLines.length * 4.5;

  if (invoice.notes && invoice.notes.trim() && metaRows.every((r) => r.label !== "Payment Terms")) {
    yPos += 6;
    if (yPos + 18 > footerLimit) {
      doc.addPage();
      paintBackground();
      yPos = margin + 10;
    }
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("Notes", margin, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(noteLines, margin, yPos);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("Thank you for your business", margin, pageHeight - 9);
    doc.text("InvoiceForge", pageWidth - margin, pageHeight - 9, { align: "right" });
    if (pageCount > 1) {
      doc.text(`${i} / ${pageCount}`, pageWidth / 2, pageHeight - 9, { align: "center" });
    }
  }
}

// ---------------------------------------------------------------------------
// Modern template — bold geometric type, solid color banner behind the
// header, dramatic total treatment.
// ---------------------------------------------------------------------------
function renderModernTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const ACCENT = [23, 23, 27] as [number, number, number]; // near-black banner
  const ACCENT_TEXT = [255, 255, 255] as [number, number, number];
  const POP = [236, 72, 100] as [number, number, number]; // vivid accent for total/highlights
  const INK = [24, 24, 27] as [number, number, number];
  const MUTED = [113, 113, 122] as [number, number, number];
  const SOFT_FILL = [244, 244, 246] as [number, number, number];

  const bannerHeight = 46;
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageWidth, bannerHeight, "F");

  let yPos = margin;
  const LOGO_MAX_W = 26;
  const LOGO_MAX_H = 16;

  if (logo) {
    const aspect = logo.width / logo.height;
    let drawW = LOGO_MAX_W;
    let drawH = drawW / aspect;
    if (drawH > LOGO_MAX_H) {
      drawH = LOGO_MAX_H;
      drawW = drawH * aspect;
    }
    try {
      // White plate behind the logo so transparent/dark logos stay legible on the dark banner.
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 2, yPos - 2, drawW + 4, drawH + 4, 1.5, 1.5, "F");
      doc.addImage(logo.dataUrl, "PNG", margin, yPos, drawW, drawH);
    } catch {
      // Skip logo on failure.
    }
  }

  const nameY = logo ? yPos + LOGO_MAX_H + 9 : yPos + 8;
  doc.setFont(FONT_FAMILY_BLACK, "normal");
  doc.setFontSize(17);
  doc.setTextColor(...ACCENT_TEXT);
  doc.text(invoice.companyName || "Company Name", margin, nameY);

  doc.setFont(FONT_FAMILY_BLACK, "normal");
  doc.setFontSize(26);
  doc.setTextColor(...POP);
  doc.text("INVOICE", pageWidth - margin, margin + 8, { align: "right" });

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 220, 225);
  doc.text(invoice.invoiceNumber, pageWidth - margin, margin + 16, { align: "right" });
  doc.text(formatDate(invoice.date), pageWidth - margin, margin + 21.5, { align: "right" });

  yPos = bannerHeight + 14;

  // --- Billed By / Billed To / Category, laid out as soft rounded chips. ---
  const chipY = yPos;
  const chipGap = 6;
  const chipWidth = (contentWidth - chipGap * 2) / 3;
  const chipByX = margin;
  const chipToX = margin + chipWidth + chipGap;
  const chipCatX = margin + (chipWidth + chipGap) * 2;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9);
  const CHIP_ICON_SIZE = 2.6;
  const CHIP_ICON_GAP = 4;
  const byAddressLines = invoice.companyAddress
    ? doc.splitTextToSize(invoice.companyAddress, chipWidth - 10 - CHIP_ICON_GAP)
    : [];
  const toEmailLines = invoice.customerEmail
    ? doc.splitTextToSize(invoice.customerEmail, chipWidth - 10 - CHIP_ICON_GAP)
    : [];
  const toPhoneLines = invoice.customerPhone
    ? doc.splitTextToSize(invoice.customerPhone, chipWidth - 10 - CHIP_ICON_GAP)
    : [];
  const toAddressLines = invoice.customerAddress
    ? doc.splitTextToSize(invoice.customerAddress, chipWidth - 10 - CHIP_ICON_GAP)
    : [];
  // "Billed To" now stacks email/phone/address as separate icon-led lines
  // (rather than joining email+phone with "•" on one line) so each value
  // wraps independently and long values never overlap the next one.
  const byLineCount = byAddressLines.length;
  const toLineCount = toEmailLines.length + toPhoneLines.length + toAddressLines.length;
  const chipHeight = Math.max(22, 14 + Math.max(byLineCount, toLineCount) * 4.4);

  doc.setFillColor(...SOFT_FILL);
  doc.roundedRect(chipByX, chipY, chipWidth, chipHeight, 2.5, 2.5, "F");
  doc.roundedRect(chipToX, chipY, chipWidth, chipHeight, 2.5, 2.5, "F");
  doc.roundedRect(chipCatX, chipY, chipWidth, chipHeight, 2.5, 2.5, "F");

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("BILLED BY", chipByX + 5, chipY + 6.5);
  doc.text("BILLED TO", chipToX + 5, chipY + 6.5);
  doc.text("CATEGORY", chipCatX + 5, chipY + 6.5);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.companyName || "Company Name", chipByX + 5, chipY + 14);
  doc.text(invoice.customerName || "Customer Name", chipToX + 5, chipY + 14);
  doc.text(invoice.category || "General", chipCatX + 5, chipY + 14);

  let byDetailY = chipY + 19;
  if (byAddressLines.length) {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    drawHomeIcon(doc, chipByX + 5, byDetailY - CHIP_ICON_SIZE + 0.4, CHIP_ICON_SIZE, MUTED);
    doc.text(byAddressLines, chipByX + 5 + CHIP_ICON_GAP, byDetailY);
    byDetailY += byAddressLines.length * 4.4;
  }

  let toDetailY = chipY + 19;
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  if (toEmailLines.length) {
    drawMailIcon(doc, chipToX + 5, toDetailY - CHIP_ICON_SIZE + 0.4, CHIP_ICON_SIZE, MUTED);
    doc.text(toEmailLines, chipToX + 5 + CHIP_ICON_GAP, toDetailY);
    toDetailY += toEmailLines.length * 4.4;
  }
  if (toPhoneLines.length) {
    drawPhoneIcon(doc, chipToX + 5, toDetailY - CHIP_ICON_SIZE + 0.4, CHIP_ICON_SIZE, MUTED);
    doc.text(toPhoneLines, chipToX + 5 + CHIP_ICON_GAP, toDetailY);
    toDetailY += toPhoneLines.length * 4.4;
  }
  if (toAddressLines.length) {
    drawHomeIcon(doc, chipToX + 5, toDetailY - CHIP_ICON_SIZE + 0.4, CHIP_ICON_SIZE, MUTED);
    doc.text(toAddressLines, chipToX + 5 + CHIP_ICON_GAP, toDetailY);
    toDetailY += toAddressLines.length * 4.4;
  }

  yPos = chipY + chipHeight + 10;

  // --- Items table: rounded header pill, bold totals, soft row banding. ---
  const itemsData = ctx.validItems.map((item) => [
    item.details ? `${item.name}\n${item.details}` : item.name,
    String(item.quantity),
    formatCurrency(item.price, currency, currencyCode),
    formatCurrency(item.quantity * item.price, currency, currencyCode),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["ITEM", "QTY", "PRICE", "TOTAL"]],
    body: itemsData,
    margin: { left: margin, right: margin, bottom: footerReserve },
    theme: "plain",
    tableWidth: contentWidth,
    headStyles: {
      fillColor: ACCENT,
      textColor: ACCENT_TEXT,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: { top: 4.5, bottom: 4.5, left: 5, right: 5 },
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: INK,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
    },
    alternateRowStyles: {
      fillColor: SOFT_FILL,
    },
    styles: {
      font: FONT_FAMILY,
      valign: "middle",
      lineWidth: 0,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 36, halign: "right" },
      3: { cellWidth: 36, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const raw = String(data.cell.raw ?? "");
        if (raw.includes("\n")) {
          data.cell.styles.fontStyle = "normal";
        } else {
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 60;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    yPos = margin + 8;
  }

  // --- Summary: subtotal/tax/discount plain, total in a bold color card. ---
  const summaryLabelX = pageWidth - margin - 58;
  const summaryValueX = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency, currencyCode) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency, currencyCode) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency, currencyCode)}`,
    });
  }

  rows.forEach((row) => {
    doc.setTextColor(...MUTED);
    doc.text(row.label, summaryLabelX, yPos);
    doc.setTextColor(...INK);
    doc.text(row.value, summaryValueX, yPos, { align: "right" });
    yPos += 6.5;
  });

  yPos += 4;

  const totalCardHeight = 22;
  doc.setFillColor(...POP);
  doc.roundedRect(summaryLabelX - 6, yPos, summaryValueX - (summaryLabelX - 6), totalCardHeight, 2.5, 2.5, "F");

  doc.setFont(FONT_FAMILY_BLACK, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT_TEXT);
  doc.text("TOTAL DUE", summaryLabelX, yPos + 8);
  doc.setFontSize(14);
  doc.text(formatCurrency(invoice.grandTotal, currency, currencyCode), summaryValueX - 6, yPos + 17, {
    align: "right",
  });

  yPos += totalCardHeight + 10;

  const wordsWidth = pageWidth - margin - (summaryLabelX - 6);
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("INVOICE TOTAL (IN WORDS)", summaryLabelX - 6, yPos);
  yPos += 4.5;
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  const wordsText = amountToWords(invoice.grandTotal, currencyCode);
  const wordsLines = doc.splitTextToSize(wordsText, wordsWidth);
  doc.text(wordsLines, summaryLabelX - 6, yPos);
  yPos += wordsLines.length * 4 + 6;

  if (invoice.notes && invoice.notes.trim()) {
    if (yPos + 20 > pageHeight - footerReserve) {
      doc.addPage();
      yPos = margin + 8;
    }
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("NOTES", margin, yPos);
    yPos += 5.5;
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(noteLines, margin, yPos);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("Thank you for your business!", margin, pageHeight - 10);
    doc.setFont(FONT_FAMILY, "bold");
    doc.setTextColor(...POP);
    doc.text("InvoiceForge", pageWidth - margin, pageHeight - 10, { align: "right" });
    if (pageCount > 1) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setTextColor(...MUTED);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }
  }
}

// ---------------------------------------------------------------------------
// Elegant template — a formal serif letterhead style: centered company name,
// a thin double-rule under the header, a muted ink/gold palette, and a
// bordered (not filled) total box. Modeled on traditional accounting-firm
// and consultancy letterhead invoices — restrained where Modern is loud.
// ---------------------------------------------------------------------------
function renderElegantTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const INK = [35, 32, 28] as [number, number, number];
  const MUTED = [120, 113, 103] as [number, number, number];
  const GOLD = [150, 116, 56] as [number, number, number];
  const RULE = [210, 202, 188] as [number, number, number];
  const FAINT_FILL = [250, 248, 244] as [number, number, number];

  let yPos = margin + 2;

  if (logo) {
    const LOGO_MAX_W = 24;
    const LOGO_MAX_H = 16;
    const aspect = logo.width / logo.height;
    let drawW = LOGO_MAX_W;
    let drawH = drawW / aspect;
    if (drawH > LOGO_MAX_H) {
      drawH = LOGO_MAX_H;
      drawW = drawH * aspect;
    }
    try {
      doc.addImage(logo.dataUrl, "PNG", pageWidth / 2 - drawW / 2, yPos, drawW, drawH);
      yPos += drawH + 6;
    } catch {
      // Corrupt/unsupported image data — skip the logo rather than fail the whole PDF.
    }
  } else {
    yPos += 4;
  }

  // Centered company name in a serif-weight display face (bold Noto Sans
  // stands in for a true serif — jsPDF's registered fonts are sans-only —
  // but wide letter-spacing plus small-caps-style sizing below reads as a
  // formal letterhead rather than a UI heading).
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(invoice.companyName || "Company Name", pageWidth / 2, yPos + 6, { align: "center" });
  yPos += 11;

  if (invoice.companyAddress) {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(invoice.companyAddress, contentWidth * 0.7);
    doc.text(lines, pageWidth / 2, yPos, { align: "center" });
    yPos += lines.length * 4;
  }

  yPos += 5;

  // Thin double-rule under the header — the letterhead's signature motif.
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 14, yPos, pageWidth / 2 + 14, yPos);
  yPos += 1.6;
  doc.setLineWidth(0.25);
  doc.setDrawColor(...RULE);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // --- INVOICE title + metadata, centered-left balance. ---
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(...GOLD);
  doc.text("INVOICE", margin, yPos);

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`No. ${invoice.invoiceNumber}`, pageWidth - margin, yPos - 1, { align: "right" });
  doc.text(formatDate(invoice.date), pageWidth - margin, yPos + 4.5, { align: "right" });
  yPos += 11;

  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.25);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  // --- Billed By / Bill To — quiet, label-above-value, no icons. ---
  const billColWidth = contentWidth * 0.46;
  const billByX = margin;
  const billToX = pageWidth - margin - billColWidth;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("BILLED BY", billByX, yPos);
  doc.text("BILL TO", billToX, yPos);
  let byY = yPos + 6;
  let toY = yPos + 6;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.companyName || "Company Name", billByX, byY);
  doc.text(invoice.customerName || "Customer Name", billToX, toY);
  byY += 5.5;
  toY += 5.5;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  if (invoice.companyAddress) {
    const lines = doc.splitTextToSize(invoice.companyAddress, billColWidth);
    doc.text(lines, billByX, byY);
    byY += lines.length * 4.2;
  }
  const toContact = [invoice.customerEmail, invoice.customerPhone].filter(Boolean).join("   ");
  if (toContact) {
    const lines = doc.splitTextToSize(toContact, billColWidth);
    doc.text(lines, billToX, toY);
    toY += lines.length * 4.2;
  }
  if (invoice.customerAddress) {
    const lines = doc.splitTextToSize(invoice.customerAddress, billColWidth);
    doc.text(lines, billToX, toY);
    toY += lines.length * 4.2;
  }

  yPos = Math.max(byY, toY) + 9;

  // --- Items — bordered table, serif-style small caps header, gold rule under head. ---
  const itemsData = ctx.validItems.map((item) => [
    item.details ? `${item.name}\n${item.details}` : item.name,
    String(item.quantity),
    formatCurrency(item.price, currency, currencyCode),
    formatCurrency(item.quantity * item.price, currency, currencyCode),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: itemsData,
    margin: { left: margin, right: margin, bottom: footerReserve },
    theme: "plain",
    tableWidth: contentWidth,
    headStyles: {
      textColor: GOLD,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: INK,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    styles: {
      font: FONT_FAMILY,
      valign: "middle",
      lineColor: RULE,
      lineWidth: 0.25,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 36, halign: "right" },
      3: { cellWidth: 36, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "head") {
        data.cell.styles.lineWidth = { top: 0, right: 0, bottom: 0.6, left: 0 };
      }
      if (data.section === "body") {
        data.cell.styles.lineWidth = { top: 0, right: 0, bottom: 0.25, left: 0 };
        if (data.column.index === 0) {
          const raw = String(data.cell.raw ?? "");
          if (raw.includes("\n")) data.cell.styles.fontStyle = "normal";
        }
      }
    },
    didDrawCell: (data) => {
      // Redraw the gold head-rule per column since didParseCell's per-side
      // lineWidth on head cells only affects that cell's own border.
      if (data.section === "head") {
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.6);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 62;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    yPos = margin + 8;
  }

  const summaryLabelX = pageWidth - margin - 58;
  const summaryValueX = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency, currencyCode) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency, currencyCode) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency, currencyCode)}`,
    });
  }

  rows.forEach((row) => {
    doc.setTextColor(...MUTED);
    doc.text(row.label, summaryLabelX, yPos);
    doc.setTextColor(...INK);
    doc.text(row.value, summaryValueX, yPos, { align: "right" });
    yPos += 6.5;
  });

  yPos += 3;

  // Bordered (not filled) total box — the letterhead's restraint carries
  // through even to the grand total, unlike Classic/Modern's bold fills.
  const boxHeight = 18;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.rect(summaryLabelX - 6, yPos, summaryValueX - (summaryLabelX - 6), boxHeight, "S");

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...GOLD);
  doc.text("TOTAL DUE", summaryLabelX, yPos + 7.5);
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text(formatCurrency(invoice.grandTotal, currency, currencyCode), summaryValueX - 4, yPos + 13.5, {
    align: "right",
  });

  yPos += boxHeight + 10;

  const wordsWidth = pageWidth - margin - (summaryLabelX - 6);
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Invoice total in words", summaryLabelX - 6, yPos);
  yPos += 4.5;
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  const wordsText = amountToWords(invoice.grandTotal, currencyCode);
  const wordsLines = doc.splitTextToSize(wordsText, wordsWidth);
  doc.text(wordsLines, summaryLabelX - 6, yPos);
  yPos += wordsLines.length * 4 + 8;

  if (invoice.notes && invoice.notes.trim()) {
    if (yPos + 20 > pageHeight - footerReserve) {
      doc.addPage();
      yPos = margin + 8;
    }
    doc.setFillColor(...FAINT_FILL);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 8);
    const noteBoxHeight = 10 + noteLines.length * 4.2;
    doc.rect(margin, yPos - 5, contentWidth, noteBoxHeight, "F");
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text("NOTES", margin + 4, yPos);
    yPos += 5;
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(noteLines, margin + 4, yPos);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Thank you for your business", pageWidth / 2, pageHeight - 10, { align: "center" });
    if (pageCount > 1) {
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }
  }
}

// ---------------------------------------------------------------------------
// Sidebar template — a full-height color block running down the left edge
// carries the company identity and invoice metadata; the items table and
// totals sit in the white main column to the right. Structurally distinct
// from Modern's top banner — an asymmetrical two-column silhouette rather
// than a header treatment.
// ---------------------------------------------------------------------------
function renderSidebarTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, footerReserve, currency, currencyCode } = ctx;

  const SIDEBAR = [24, 58, 51] as [number, number, number]; // deep teal
  const SIDEBAR_TEXT = [255, 255, 255] as [number, number, number];
  const SIDEBAR_MUTED = [175, 200, 194] as [number, number, number];
  const POP = [235, 178, 74] as [number, number, number]; // warm amber accent
  const INK = [28, 28, 28] as [number, number, number];
  const MUTED = [115, 115, 115] as [number, number, number];
  const LINE = [228, 228, 228] as [number, number, number];

  const sidebarWidth = 58;
  const mainMargin = margin;
  const mainX = sidebarWidth + mainMargin;
  const mainWidth = pageWidth - mainX - margin;

  const paintSidebar = (targetPage?: number) => {
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...SIDEBAR);
    doc.rect(0, 0, sidebarWidth, pageHeight, "F");
  };
  paintSidebar();

  let sy = margin + 2;
  const sPad = 10;

  if (logo) {
    const LOGO_MAX_W = sidebarWidth - sPad * 2;
    const LOGO_MAX_H = 16;
    const aspect = logo.width / logo.height;
    let drawW = LOGO_MAX_W;
    let drawH = drawW / aspect;
    if (drawH > LOGO_MAX_H) {
      drawH = LOGO_MAX_H;
      drawW = drawH * aspect;
    }
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(sPad - 1.5, sy - 1.5, drawW + 3, drawH + 3, 1.5, 1.5, "F");
      doc.addImage(logo.dataUrl, "PNG", sPad, sy, drawW, drawH);
      sy += drawH + 8;
    } catch {
      // Skip logo on failure.
    }
  } else {
    sy += 2;
  }

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(13);
  doc.setTextColor(...SIDEBAR_TEXT);
  const nameLines = doc.splitTextToSize(invoice.companyName || "Company Name", sidebarWidth - sPad * 2);
  doc.text(nameLines, sPad, sy);
  sy += nameLines.length * 5.5 + 3;

  if (invoice.companyAddress) {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SIDEBAR_MUTED);
    const lines = doc.splitTextToSize(invoice.companyAddress, sidebarWidth - sPad * 2);
    doc.text(lines, sPad, sy);
    sy += lines.length * 4;
  }

  sy += 10;
  doc.setDrawColor(...POP);
  doc.setLineWidth(0.6);
  doc.line(sPad, sy, sidebarWidth - sPad, sy);
  sy += 9;

  // --- Invoice metadata stacked in the sidebar. ---
  const metaRows: Array<{ label: string; value: string }> = [
    { label: "INVOICE NO.", value: invoice.invoiceNumber || "" },
    { label: "DATE", value: formatDate(invoice.date) },
  ];
  if (invoice.category) metaRows.push({ label: "CATEGORY", value: invoice.category });
  metaRows.push({ label: "CURRENCY", value: currencyCode || currency });

  metaRows.forEach((row) => {
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...POP);
    doc.text(row.label, sPad, sy);
    sy += 4.2;
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SIDEBAR_TEXT);
    const lines = doc.splitTextToSize(row.value, sidebarWidth - sPad * 2);
    doc.text(lines, sPad, sy);
    sy += lines.length * 4.6 + 4.5;
  });

  sy += 4;
  doc.setDrawColor(...POP);
  doc.setLineWidth(0.6);
  doc.line(sPad, sy, sidebarWidth - sPad, sy);
  sy += 9;

  // --- Bill To, also in the sidebar. ---
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(7);
  doc.setTextColor(...POP);
  doc.text("BILL TO", sPad, sy);
  sy += 5;
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...SIDEBAR_TEXT);
  const customerLines = doc.splitTextToSize(invoice.customerName || "Customer Name", sidebarWidth - sPad * 2);
  doc.text(customerLines, sPad, sy);
  sy += customerLines.length * 4.8 + 2;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SIDEBAR_MUTED);
  if (invoice.customerEmail) {
    const lines = doc.splitTextToSize(invoice.customerEmail, sidebarWidth - sPad * 2);
    doc.text(lines, sPad, sy);
    sy += lines.length * 4;
  }
  if (invoice.customerPhone) {
    const lines = doc.splitTextToSize(invoice.customerPhone, sidebarWidth - sPad * 2);
    doc.text(lines, sPad, sy);
    sy += lines.length * 4;
  }
  if (invoice.customerAddress) {
    const lines = doc.splitTextToSize(invoice.customerAddress, sidebarWidth - sPad * 2);
    doc.text(lines, sPad, sy);
    sy += lines.length * 4;
  }

  // --- Main column: big "Invoice" title, items table, totals. ---
  let yPos = margin + 4;

  doc.setFont(FONT_FAMILY_BLACK, "normal");
  doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text("Invoice", mainX, yPos + 6);
  yPos += 18;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(mainX, yPos, pageWidth - margin, yPos);
  yPos += 9;

  const itemsData = ctx.validItems.map((item) => [
    item.details ? `${item.name}\n${item.details}` : item.name,
    String(item.quantity),
    formatCurrency(item.price, currency, currencyCode),
    formatCurrency(item.quantity * item.price, currency, currencyCode),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Qty", "Price", "Total"]],
    body: itemsData,
    margin: { left: mainX, right: margin, bottom: footerReserve },
    theme: "plain",
    tableWidth: mainWidth,
    headStyles: {
      fillColor: [244, 244, 242],
      textColor: INK,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: INK,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 249],
    },
    styles: {
      font: FONT_FAMILY,
      valign: "middle",
      lineColor: LINE,
      lineWidth: 0.25,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 16, halign: "center" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 32, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const raw = String(data.cell.raw ?? "");
        if (raw.includes("\n")) {
          data.cell.styles.fontStyle = "normal";
        }
      }
    },
    // Repaint the sidebar on any page autoTable adds internally (e.g. when a
    // large items table spans multiple pages), since addPage() would
    // otherwise leave subsequent pages blank-white.
    didDrawPage: () => {
      paintSidebar(doc.getCurrentPageInfo().pageNumber);
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 58;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    paintSidebar();
    yPos = margin + 8;
  }

  const summaryLabelX = pageWidth - margin - 56;
  const summaryValueX = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency, currencyCode) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency, currencyCode) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency, currencyCode)}`,
    });
  }

  rows.forEach((row) => {
    doc.setTextColor(...MUTED);
    doc.text(row.label, summaryLabelX, yPos);
    doc.setTextColor(...INK);
    doc.text(row.value, summaryValueX, yPos, { align: "right" });
    yPos += 6.5;
  });

  yPos += 3;
  doc.setFillColor(...SIDEBAR);
  const totalBoxHeight = 20;
  doc.roundedRect(summaryLabelX - 6, yPos, summaryValueX - (summaryLabelX - 6), totalBoxHeight, 2, 2, "F");
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...POP);
  doc.text("TOTAL DUE", summaryLabelX, yPos + 8);
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(formatCurrency(invoice.grandTotal, currency, currencyCode), summaryValueX - 4, yPos + 15.5, {
    align: "right",
  });

  yPos += totalBoxHeight + 9;

  const wordsWidth = pageWidth - margin - (summaryLabelX - 6);
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Invoice total in words", summaryLabelX - 6, yPos);
  yPos += 4.5;
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  const wordsText = amountToWords(invoice.grandTotal, currencyCode);
  const wordsLines = doc.splitTextToSize(wordsText, wordsWidth);
  doc.text(wordsLines, summaryLabelX - 6, yPos);
  yPos += wordsLines.length * 4 + 6;

  if (invoice.notes && invoice.notes.trim()) {
    if (yPos + 20 > pageHeight - footerReserve) {
      doc.addPage();
      paintSidebar();
      yPos = margin + 8;
    }
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("NOTES", mainX, yPos);
    yPos += 5.5;
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const noteLines = doc.splitTextToSize(invoice.notes, mainWidth);
    doc.text(noteLines, mainX, yPos);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(mainX, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("Thank you for your business!", mainX, pageHeight - 10);
    if (pageCount > 1) {
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }
  }
}

export async function generateInvoicePDF(invoice: InvoicePdfData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFonts(doc);
  doc.setFont(FONT_FAMILY, "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const footerReserve = 20;

  let logo: LoadedLogo | null = null;
  if (invoice.companyLogo) {
    logo = await loadLogo(invoice.companyLogo);
  }

  const validItems = invoice.items.filter((item) => item.name && item.name.trim() !== "");

  const ctx: TemplateContext = {
    doc,
    invoice,
    logo,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    footerReserve,
    currency: invoice.currencySymbol,
    currencyCode: invoice.currencyCode,
    validItems,
  };

  switch (invoice.template) {
    case "clean":
      renderCleanTemplate(ctx);
      break;
    case "modern":
      renderModernTemplate(ctx);
      break;
    case "elegant":
      renderElegantTemplate(ctx);
      break;
    case "sidebar":
      renderSidebarTemplate(ctx);
      break;
    case "classic":
    default:
      renderClassicTemplate(ctx);
      break;
  }

  const safeInvoiceNumber = (invoice.invoiceNumber || "invoice").replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`${safeInvoiceNumber}.pdf`);
}
