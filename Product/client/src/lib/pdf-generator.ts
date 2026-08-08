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

  if (invoice.companyAddress) {
    const lines = doc.splitTextToSize(invoice.companyAddress, billColWidth - 6);
    doc.text(lines, billByX, billByY);
    billByY += lines.length * 4.6;
  }

  if (invoice.customerEmail) {
    doc.text(invoice.customerEmail, billToX, billToY);
    billToY += 5;
  }
  if (invoice.customerPhone) {
    doc.text(invoice.customerPhone, billToX, billToY);
    billToY += 5;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, billColWidth - 6);
    doc.text(addressLines, billToX, billToY);
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
  const byAddressLines = invoice.companyAddress
    ? doc.splitTextToSize(invoice.companyAddress, chipWidth - 10)
    : [];
  const toAddressLines = invoice.customerAddress
    ? doc.splitTextToSize(invoice.customerAddress, chipWidth - 10)
    : [];
  const toContactParts = [invoice.customerEmail, invoice.customerPhone].filter(Boolean);
  const chipHeight = Math.max(
    22,
    14 + (byAddressLines.length + (toContactParts.length ? 1 : 0) + toAddressLines.length) * 4.2
  );

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
    doc.text(byAddressLines, chipByX + 5, byDetailY);
    byDetailY += byAddressLines.length * 4.2;
  }

  let toDetailY = chipY + 19;
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  if (toContactParts.length) {
    doc.text(toContactParts.join(" • "), chipToX + 5, toDetailY);
    toDetailY += 4.2;
  }
  if (toAddressLines.length) {
    doc.text(toAddressLines, chipToX + 5, toDetailY);
    toDetailY += toAddressLines.length * 4.2;
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
    case "classic":
    default:
      renderClassicTemplate(ctx);
      break;
  }

  const safeInvoiceNumber = (invoice.invoiceNumber || "invoice").replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`${safeInvoiceNumber}.pdf`);
}
