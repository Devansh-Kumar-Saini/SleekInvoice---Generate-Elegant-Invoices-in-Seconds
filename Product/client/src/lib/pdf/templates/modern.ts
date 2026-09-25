import autoTable from "jspdf-autotable";
import { amountToWords } from "@/lib/invoice-format";
import { TEMPLATE_DARK_SURFACES, hexToRgb } from "@/lib/pdf-templates";
import {
  TemplateContext,
  FONT_FAMILY,
  FONT_FAMILY_BLACK,
  formatCurrency,
  formatDate,
  drawMailIcon,
  drawPhoneIcon,
  drawHomeIcon,
  getLastAutoTableFinalY,
} from "@/lib/pdf/core";

export function renderModernTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, contentWidth, footerReserve, currency, currencyCode } = ctx;

  const ACCENT = ctx.color("modern", "accent"); // banner background
  const ACCENT_TEXT = [255, 255, 255] as [number, number, number];
  const POP = ctx.color("modern", "pop"); // vivid accent for total/highlights
  const INK = ctx.color("modern", "ink");
  const MUTED = ctx.color("modern", "muted");
  const SURFACES = TEMPLATE_DARK_SURFACES.modern;
  const PAGE_BG = hexToRgb(SURFACES.pageBg);
  const SOFT_FILL = ctx.isDark ? hexToRgb(SURFACES.surface) : ([244, 244, 246] as [number, number, number]);

  const paintBackground = (targetPage?: number) => {
    if (!ctx.isDark) return;
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };
  paintBackground();

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

  // See the identical comment in renderSidebarTemplate: didDrawPage fires for
  // every page the table touches, including the page the banner/chips above
  // were already drawn on — only repaint pages autoTable itself adds.
  const tableStartPage = doc.getCurrentPageInfo().pageNumber;

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
    didDrawPage: () => {
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      if (currentPage !== tableStartPage) {
        paintBackground(currentPage);
      }
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 60;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    paintBackground();
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
      paintBackground();
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

  const FOOTER_LINE = ctx.isDark ? ([50, 50, 54] as [number, number, number]) : ([230, 230, 235] as [number, number, number]);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...FOOTER_LINE);
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
