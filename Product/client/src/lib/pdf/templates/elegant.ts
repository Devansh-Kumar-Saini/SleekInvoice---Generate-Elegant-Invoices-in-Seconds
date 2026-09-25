import autoTable from "jspdf-autotable";
import { amountToWords } from "@/lib/invoice-format";
import { TEMPLATE_DARK_SURFACES, hexToRgb } from "@/lib/pdf-templates";
import {
  TemplateContext,
  FONT_FAMILY,
  formatCurrency,
  formatDate,
  drawMailIcon,
  drawPhoneIcon,
  drawHomeIcon,
  getLastAutoTableFinalY,
} from "@/lib/pdf/core";

export function renderElegantTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const INK = ctx.color("elegant", "ink");
  const MUTED = ctx.color("elegant", "muted");
  const GOLD = ctx.color("elegant", "gold");
  const RULE = ctx.color("elegant", "rule");
  const SURFACES = TEMPLATE_DARK_SURFACES.elegant;
  const PAGE_BG = hexToRgb(SURFACES.pageBg);
  const FAINT_FILL = ctx.isDark ? hexToRgb(SURFACES.surface) : ([250, 248, 244] as [number, number, number]);

  const paintBackground = (targetPage?: number) => {
    if (!ctx.isDark) return;
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };
  paintBackground();

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

  // See the identical comment in renderSidebarTemplate: didDrawPage fires for
  // every page the table touches, including the page the letterhead/billing
  // section above was already drawn on — only repaint pages autoTable adds.
  const tableStartPage = doc.getCurrentPageInfo().pageNumber;

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
    didDrawPage: () => {
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      if (currentPage !== tableStartPage) {
        paintBackground(currentPage);
      }
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 62;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    paintBackground();
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
      paintBackground();
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
