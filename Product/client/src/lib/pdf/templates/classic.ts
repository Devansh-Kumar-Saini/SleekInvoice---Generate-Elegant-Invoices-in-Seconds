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
  calculateItemColumnWidths,
} from "@/lib/pdf/core";

export function renderClassicTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const BRAND = {
    primary: ctx.color("classic", "primary"),
    dark: ctx.color("classic", "dark"),
    muted: ctx.color("classic", "muted"),
    border: ctx.color("classic", "border"),
    headerFill: ctx.color("classic", "headerFill"),
  };
  const SURFACES = TEMPLATE_DARK_SURFACES.classic;
  const PAGE_BG = hexToRgb(SURFACES.pageBg);
  const ZEBRA = ctx.isDark ? hexToRgb(SURFACES.surface) : ([248, 248, 248] as [number, number, number]);

  const paintBackground = (targetPage?: number) => {
    if (!ctx.isDark) return;
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };
  paintBackground();

  let yPos = margin + 4;
  const headerTop = yPos;
  const logoSize = invoice.logoSize || "medium";
  const LOGO_MAX_W = logoSize === "small" ? 22 : logoSize === "large" ? 48 : 32;
  const LOGO_MAX_H = logoSize === "small" ? 14 : logoSize === "large" ? 30 : 20;

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
    formatCurrency(Number(item.price) || 0, currency, currencyCode),
    formatCurrency((Number(item.quantity) || 0) * (Number(item.price) || 0), currency, currencyCode),
  ]);

  const colWidths = calculateItemColumnWidths(
    doc,
    ctx.validItems,
    currency,
    currencyCode,
    { qty: 18, price: 38, total: 38 },
    8,
    9.5,
    FONT_FAMILY
  );

  // See the identical comment in renderSidebarTemplate: didDrawPage fires for
  // every page the table touches, including the page the header/billing
  // section above was already drawn on — repainting that page's background
  // there would draw over that content. Only repaint pages autoTable adds.
  const tableStartPage = doc.getCurrentPageInfo().pageNumber;

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
      fillColor: ZEBRA,
    },
    styles: {
      font: FONT_FAMILY,
      valign: "middle",
      lineColor: BRAND.border,
      lineWidth: 0.3,
      overflow: "linebreak",
      textColor: BRAND.dark,
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: colWidths.qtyWidth, halign: "center" },
      2: { cellWidth: colWidths.priceWidth, halign: "right" },
      3: { cellWidth: colWidths.totalWidth, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const raw = String(data.cell.raw ?? "");
        if (raw.includes("\n")) {
          data.cell.styles.fontStyle = "normal";
        }
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

  const summaryBlockHeight = 55;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    paintBackground();
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
      paintBackground();
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
