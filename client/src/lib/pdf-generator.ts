import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { type InvoiceItem } from "@/types/invoice";
import { NOTO_SANS_BOLD_BASE64, NOTO_SANS_REGULAR_BASE64 } from "./pdf-fonts";

const FONT_FAMILY = "NotoSans";

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
}

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
}

const BRAND = {
  primary: [220, 38, 74] as [number, number, number], // matches --primary in light mode
  dark: [30, 30, 30] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
  border: [225, 225, 225] as [number, number, number],
  headerFill: [40, 40, 40] as [number, number, number],
};

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

/**
 * Loads an image and resolves with its element plus natural dimensions.
 * Resolves with null (rather than rejecting) on failure/timeout so a bad
 * logo URL never breaks PDF generation — the invoice still generates without a logo.
 */
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

export async function generateInvoicePDF(invoice: InvoicePdfData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFonts(doc);
  doc.setFont(FONT_FAMILY, "normal");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const footerReserve = 20;
  const currency = invoice.currencySymbol;

  let logo: LoadedLogo | null = null;
  if (invoice.companyLogo) {
    logo = await loadLogo(invoice.companyLogo);
  }

  let yPos = margin + 4;
  const headerTop = yPos;
  const LOGO_MAX_W = 32;
  const LOGO_MAX_H = 20;

  // --- Logo (left) ---
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
      logo = null;
    }
  }

  // --- Company name (below logo, left) ---
  const nameY = logo ? headerTop + LOGO_MAX_H + 7 : headerTop + 6;
  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(19);
  doc.setTextColor(...BRAND.dark);
  doc.text(invoice.companyName || "Company Name", margin, nameY);

  // --- INVOICE label + meta (right) ---
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

  // --- Divider ---
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  // --- Bill To ---
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

  // --- Items table ---
  const validItems = invoice.items.filter((item) => item.name && item.name.trim() !== "");
  const itemsData = validItems.map((item) => [
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
      // Item description gets the leftover space; Qty/Price/Total are generous
      // fixed widths so large totals (e.g. INR amounts in the thousands) never clip.
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 38, halign: "right" },
      3: { cellWidth: 38, halign: "right" },
    },
    didParseCell: (data) => {
      // Render the item name bold and the details line (if present) muted, on separate lines.
      if (data.section === "body" && data.column.index === 0) {
        const raw = String(data.cell.raw ?? "");
        if (raw.includes("\n")) {
          data.cell.styles.fontStyle = "normal";
        }
      }
    },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Page-break guard: reserve space for the summary block (~55mm) and footer.
  const summaryBlockHeight = 55;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    yPos = margin + 8;
  }

  // --- Summary (right-aligned) ---
  const summaryLabelX = pageWidth - margin - 55;
  const summaryValueX = pageWidth - margin;

  doc.setFont(FONT_FAMILY, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);

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

  // --- Notes ---
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

  // --- Footer on every page ---
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
    doc.text(`Generated with InvoiceForge`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
    if (pageCount > 1) {
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
    }
  }

  const safeInvoiceNumber = (invoice.invoiceNumber || "invoice").replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`${safeInvoiceNumber}.pdf`);
}
