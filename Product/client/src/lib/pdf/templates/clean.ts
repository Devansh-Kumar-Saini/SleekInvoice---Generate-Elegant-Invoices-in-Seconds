import autoTable from "jspdf-autotable";
import { amountToWords } from "@/lib/invoice-format";
import {
  TemplateContext,
  FONT_FAMILY,
  FONT_FAMILY_MONO,
  formatCurrency,
  formatDateSlash,
  getLastAutoTableFinalY,
  calculateItemColumnWidths,
} from "@/lib/pdf/core";

export function renderCleanTemplate(ctx: TemplateContext) {
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
  const colWidths = calculateItemColumnWidths(
    doc,
    ctx.validItems,
    currency,
    currencyCode,
    { qty: 18, price: 34, total: 36 },
    6,
    9,
    FONT_FAMILY_MONO
  );

  const colTotal = pageWidth - margin;
  const colPrice = colTotal - colWidths.totalWidth;
  const colQty = colPrice - colWidths.priceWidth;
  const colName = margin;
  const colNameMaxW = Math.max(30, colQty - colWidths.qtyWidth - margin - 4);

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
    const itemNameLines = doc.splitTextToSize(item.name, colNameMaxW);
    const detailLines = item.details ? doc.splitTextToSize(item.details, colNameMaxW) : [];
    const rowHeight = Math.max(11, itemNameLines.length * 4.5 + 4) + detailLines.length * 4;

    if (yPos + rowHeight > footerLimit) {
      doc.addPage();
      paintBackground();
      yPos = margin + 10;
    }

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(itemNameLines, colName, yPos);

    doc.setFont(FONT_FAMILY_MONO, "normal");
    doc.setFontSize(9);
    doc.text(String(item.quantity), colQty, yPos, { align: "right" });
    doc.text(formatCurrency(Number(item.price) || 0, currency, currencyCode), colPrice, yPos, { align: "right" });
    doc.text(formatCurrency((Number(item.quantity) || 0) * (Number(item.price) || 0), currency, currencyCode), colTotal, yPos, {
      align: "right",
    });

    if (detailLines.length) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAY);
      doc.text(detailLines, colName, yPos + itemNameLines.length * 4.4);
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
        value: formatCurrency((Number(item.quantity) || 0) * (Number(item.price) || 0), currency, currencyCode),
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

