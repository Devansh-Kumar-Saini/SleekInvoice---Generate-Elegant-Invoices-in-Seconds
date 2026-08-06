import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { type InvoiceItem } from "@/types/invoice";
import {
  NOTO_SANS_BLACK_BASE64,
  NOTO_SANS_BOLD_BASE64,
  NOTO_SANS_REGULAR_BASE64,
} from "./pdf-fonts";

const FONT_FAMILY = "NotoSans";

export type InvoiceTemplate = "classic" | "clean" | "modern";

export const INVOICE_TEMPLATES: Array<{ id: InvoiceTemplate; label: string; description: string }> = [
  { id: "classic", label: "Classic", description: "The original InvoiceForge design" },
  { id: "clean", label: "Clean", description: "Monochrome, hairline dividers — Vercel-inspired" },
  { id: "modern", label: "Modern", description: "Bold type, color banner, dramatic total" },
];

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
}

const FONT_FAMILY_BLACK = "NotoSansBlack";

export interface InvoicePdfData {
  companyName: string;
  companyLogo?: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  category?: string;
  currencySymbol: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercentage: number;
  tax: number;
  discountLabel?: string;
  discount: number;
  grandTotal: number;
  notes?: string;
  template?: InvoiceTemplate;
}

function formatCurrency(amount: number, symbol: string): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${symbol}${safe.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency } = ctx;

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

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);
  doc.text("BILL TO", margin, yPos);
  yPos += 6;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.dark);
  doc.text(invoice.customerName || "Customer Name", margin, yPos);
  yPos += 6;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);

  if (invoice.customerEmail) {
    doc.text(invoice.customerEmail, margin, yPos);
    yPos += 5;
  }
  if (invoice.customerPhone) {
    doc.text(invoice.customerPhone, margin, yPos);
    yPos += 5;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, contentWidth * 0.6);
    doc.text(addressLines, margin, yPos);
    yPos += addressLines.length * 4.6;
  }

  yPos += 8;

  const itemsData = ctx.validItems.map((item) => [
    item.details ? `${item.name}\n${item.details}` : item.name,
    String(item.quantity),
    formatCurrency(item.price, currency),
    formatCurrency(item.quantity * item.price, currency),
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
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency)}`,
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
  doc.text(formatCurrency(invoice.grandTotal, currency), summaryValueX, yPos + 2.5, {
    align: "right",
  });

  yPos += 14;

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
// Clean template — Vercel-inspired. Pure monochrome, no fills, hairline rules
// instead of boxes, uppercase micro-labels, generous whitespace.
// ---------------------------------------------------------------------------
function renderCleanTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency } = ctx;

  const INK = [15, 15, 15] as [number, number, number];
  const GRAY = [130, 130, 130] as [number, number, number];
  const LINE = [225, 225, 225] as [number, number, number];

  let yPos = margin + 2;
  const headerTop = yPos;
  const LOGO_MAX_W = 22;
  const LOGO_MAX_H = 14;

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
      // Skip logo on failure.
    }
  }

  const nameY = logo ? headerTop + LOGO_MAX_H + 8 : headerTop + 5;
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(invoice.companyName || "Company Name", margin, nameY);

  // Right-aligned, understated meta block — no color, just weight/size contrast.
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("INVOICE", pageWidth - margin, headerTop + 4, { align: "right" });

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.invoiceNumber, pageWidth - margin, headerTop + 10, { align: "right" });

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  let metaY = headerTop + 16;
  doc.text(formatDate(invoice.date), pageWidth - margin, metaY, { align: "right" });
  if (invoice.category) {
    metaY += 4.5;
    doc.text(invoice.category, pageWidth - margin, metaY, { align: "right" });
  }

  yPos = Math.max(nameY + 10, metaY + 8);

  // Single hairline — the only divider in the whole header, Vercel-style.
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Bill To / meta laid out as two plain columns, no card, no fill.
  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("BILLED TO", margin, yPos);

  const metaColX = margin + contentWidth * 0.55;
  doc.text("INVOICE DATE", metaColX, yPos);

  yPos += 5.5;
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(invoice.customerName || "Customer Name", margin, yPos);
  doc.setFont(FONT_FAMILY, "normal");
  doc.text(formatDate(invoice.date), metaColX, yPos);

  let leftY = yPos + 5;
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  if (invoice.customerEmail) {
    doc.text(invoice.customerEmail, margin, leftY);
    leftY += 4.5;
  }
  if (invoice.customerPhone) {
    doc.text(invoice.customerPhone, margin, leftY);
    leftY += 4.5;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, contentWidth * 0.45);
    doc.text(addressLines, margin, leftY);
    leftY += addressLines.length * 4.2;
  }

  yPos = leftY + 8;

  // --- Items — no table borders/fills at all, just a header rule and row rules. ---
  const colName = margin;
  const colQty = margin + contentWidth * 0.58;
  const colPrice = margin + contentWidth * 0.74;
  const colTotal = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("DESCRIPTION", colName, yPos);
  doc.text("QTY", colQty, yPos, { align: "right" });
  doc.text("PRICE", colPrice, yPos, { align: "right" });
  doc.text("TOTAL", colTotal, yPos, { align: "right" });
  yPos += 3;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;

  const footerLimit = pageHeight - footerReserve;
  ctx.validItems.forEach((item) => {
    const detailLines = item.details ? doc.splitTextToSize(item.details, contentWidth * 0.5) : [];
    // Base clearance (11mm) keeps the divider comfortably below the name/price
    // baseline — and below the *next* row's text — even with no details line;
    // each wrapped detail line adds 4mm.
    const rowHeight = 11 + detailLines.length * 4;

    if (yPos + rowHeight > footerLimit) {
      doc.addPage();
      yPos = margin + 8;
    }

    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(item.name, colName, yPos);

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(9.5);
    doc.text(String(item.quantity), colQty, yPos, { align: "right" });
    doc.text(formatCurrency(item.price, currency), colPrice, yPos, { align: "right" });
    doc.setFont(FONT_FAMILY, "bold");
    doc.text(formatCurrency(item.quantity * item.price, currency), colTotal, yPos, {
      align: "right",
    });

    if (detailLines.length) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAY);
      doc.text(detailLines, colName, yPos + 4.2);
    }

    yPos += rowHeight;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos - 4.5, pageWidth - margin, yPos - 4.5);
  });

  yPos += 6;

  const summaryBlockHeight = 50;
  if (yPos + summaryBlockHeight > footerLimit) {
    doc.addPage();
    yPos = margin + 8;
  }

  const summaryLabelX = pageWidth - margin - 50;
  const summaryValueX = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9.5);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency)}`,
    });
  }

  rows.forEach((row) => {
    doc.setTextColor(...GRAY);
    doc.text(row.label, summaryLabelX, yPos);
    doc.setTextColor(...INK);
    doc.text(row.value, summaryValueX, yPos, { align: "right" });
    yPos += 6;
  });

  yPos += 2;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(summaryLabelX - 4, yPos - 4, summaryValueX, yPos - 4);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Total", summaryLabelX, yPos + 3);
  doc.setFontSize(14);
  doc.text(formatCurrency(invoice.grandTotal, currency), summaryValueX, yPos + 3.2, {
    align: "right",
  });

  yPos += 15;

  if (invoice.notes && invoice.notes.trim()) {
    if (yPos + 18 > footerLimit) {
      doc.addPage();
      yPos = margin + 8;
    }
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("NOTES", margin, yPos);
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
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency } = ctx;

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

  // --- Bill To / category, laid out as two soft rounded chips. ---
  const chipY = yPos;
  const chipHeight = 22;
  const chipGap = 6;
  const chipWidth = (contentWidth - chipGap) / 2;

  doc.setFillColor(...SOFT_FILL);
  doc.roundedRect(margin, chipY, chipWidth, chipHeight, 2.5, 2.5, "F");
  doc.roundedRect(margin + chipWidth + chipGap, chipY, chipWidth, chipHeight, 2.5, 2.5, "F");

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("BILLED TO", margin + 5, chipY + 6.5);
  doc.text("CATEGORY", margin + chipWidth + chipGap + 5, chipY + 6.5);

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.customerName || "Customer Name", margin + 5, chipY + 14);
  doc.text(invoice.category || "General", margin + chipWidth + chipGap + 5, chipY + 14);

  yPos = chipY + chipHeight + 10;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let contactY = yPos;
  const contactParts = [invoice.customerEmail, invoice.customerPhone].filter(Boolean);
  if (contactParts.length) {
    doc.text(contactParts.join("   •   "), margin, contactY);
    contactY += 5;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, contentWidth * 0.7);
    doc.text(addressLines, margin, contactY);
    contactY += addressLines.length * 4.4;
  }

  yPos = contactY + 6;

  // --- Items table: rounded header pill, bold totals, soft row banding. ---
  const itemsData = ctx.validItems.map((item) => [
    item.details ? `${item.name}\n${item.details}` : item.name,
    String(item.quantity),
    formatCurrency(item.price, currency),
    formatCurrency(item.quantity * item.price, currency),
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
    { label: "Subtotal", value: formatCurrency(invoice.subtotal, currency) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax, currency) },
  ];
  if (invoice.discount > 0) {
    rows.push({
      label: invoice.discountLabel || "Discount",
      value: `-${formatCurrency(invoice.discount, currency)}`,
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

  const totalCardHeight = 18;
  doc.setFillColor(...POP);
  doc.roundedRect(summaryLabelX - 6, yPos, summaryValueX - (summaryLabelX - 6), totalCardHeight, 2.5, 2.5, "F");

  doc.setFont(FONT_FAMILY_BLACK, "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT_TEXT);
  doc.text("TOTAL DUE", summaryLabelX, yPos + 11.5);
  doc.setFontSize(15);
  doc.text(formatCurrency(invoice.grandTotal, currency), summaryValueX - 6, yPos + 12, {
    align: "right",
  });

  yPos += totalCardHeight + 12;

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
