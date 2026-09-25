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

export function renderSidebarTemplate(ctx: TemplateContext) {
  const { doc, invoice, logo, pageWidth, pageHeight, margin, footerReserve, currency, currencyCode } = ctx;

  const SIDEBAR = ctx.color("sidebar", "sidebar"); // deep teal by default
  const SIDEBAR_TEXT = [255, 255, 255] as [number, number, number];
  const SIDEBAR_MUTED = [175, 200, 194] as [number, number, number];
  const POP = ctx.color("sidebar", "pop"); // warm amber accent by default
  const INK = ctx.color("sidebar", "ink");
  const MUTED = ctx.color("sidebar", "muted");
  const SURFACES = TEMPLATE_DARK_SURFACES.sidebar;
  const MAIN_BG = hexToRgb(SURFACES.pageBg);
  const TABLE_HEAD_FILL = ctx.isDark ? hexToRgb(SURFACES.surface) : ([244, 244, 242] as [number, number, number]);
  const ZEBRA = ctx.isDark ? hexToRgb(SURFACES.surfaceAlt) : ([250, 250, 249] as [number, number, number]);
  const LINE = ctx.isDark ? ([55, 55, 58] as [number, number, number]) : ([228, 228, 228] as [number, number, number]);

  const sidebarWidth = 58;
  const mainMargin = margin;
  const mainX = sidebarWidth + mainMargin;
  const mainWidth = pageWidth - mainX - margin;

  const paintSidebar = (targetPage?: number) => {
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...SIDEBAR);
    doc.rect(0, 0, sidebarWidth, pageHeight, "F");
  };
  // The main (right) column is plain white in light mode (the page's own
  // background, left unpainted), but needs an explicit dark fill of its own
  // in dark mode — separate from the sidebar strip, which is already always
  // colored regardless of theme.
  const paintMain = (targetPage?: number) => {
    if (!ctx.isDark) return;
    if (typeof targetPage === "number") doc.setPage(targetPage);
    doc.setFillColor(...MAIN_BG);
    doc.rect(sidebarWidth, 0, pageWidth - sidebarWidth, pageHeight, "F");
  };
  paintSidebar();
  paintMain();

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

  // autoTable's didDrawPage callback fires once for EVERY page the table
  // touches, including the page it started on — which, here, already has the
  // sidebar's logo/company name/metadata/Bill To manually drawn on it above.
  // Repainting that page's sidebar again would draw a solid fill rectangle
  // directly on top of that text, silently erasing it. Capture the starting
  // page number and only repaint pages *after* it — i.e. pages autoTable
  // actually added itself when the table overflowed — which is the only
  // case this repaint is meant to handle (addPage() otherwise leaves those
  // pages' sidebar area blank white).
  const tableStartPage = doc.getCurrentPageInfo().pageNumber;

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Qty", "Price", "Total"]],
    body: itemsData,
    margin: { left: mainX, right: margin, bottom: footerReserve },
    theme: "plain",
    tableWidth: mainWidth,
    headStyles: {
      fillColor: TABLE_HEAD_FILL,
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
      fillColor: ZEBRA,
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
    // Repaint the sidebar (and, in dark mode, the main column) only on pages
    // autoTable added internally (e.g. when a large items table spans
    // multiple pages), since addPage() would otherwise leave those pages'
    // sidebar/main area blank white. Never repaint the starting page — see
    // comment above.
    didDrawPage: () => {
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      if (currentPage !== tableStartPage) {
        paintSidebar(currentPage);
        paintMain(currentPage);
      }
    },
  });

  yPos = getLastAutoTableFinalY(doc) + 10;

  const summaryBlockHeight = 58;
  if (yPos + summaryBlockHeight > pageHeight - footerReserve) {
    doc.addPage();
    paintSidebar();
    paintMain();
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
      paintMain();
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
