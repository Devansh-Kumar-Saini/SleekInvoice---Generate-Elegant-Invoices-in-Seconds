import { type TemplateContext, type LoadedPaymentImageItem, FONT_FAMILY, FONT_FAMILY_MONO } from "./core";

export interface RenderPaymentOptions {
  startX: number;
  width: number;
  currentY: number;
  primaryColor: [number, number, number];
  textColor: [number, number, number];
  mutedColor: [number, number, number];
  borderColor: [number, number, number];
  fillColor?: [number, number, number];
  boxStyle?: "card" | "minimal" | "letterhead";
  onPageBreak: () => number;
}

export function renderPaymentPdfSection(
  ctx: TemplateContext,
  options: RenderPaymentOptions
): number {
  const { doc, invoice, paymentImage, pageHeight, footerReserve } = ctx;
  const {
    startX,
    width,
    primaryColor,
    textColor,
    mutedColor,
    borderColor,
    fillColor,
    boxStyle = "card",
    onPageBreak,
  } = options;

  let yPos = options.currentY;

  const imagesToRender: LoadedPaymentImageItem[] =
    ctx.paymentImages && ctx.paymentImages.length > 0
      ? ctx.paymentImages
      : paymentImage
      ? [
          {
            logo: paymentImage,
            type: invoice.paymentImageType || "qr",
            label:
              invoice.paymentImageLabel ||
              (invoice.paymentImageType === "cheque" ? "Cancelled Cheque" : "Scan to Pay"),
          },
        ]
      : [];

  const hasBankDetails = Boolean(
    invoice.bankName ||
    invoice.accountName ||
    invoice.accountNumber ||
    invoice.routingCode ||
    invoice.upiId ||
    invoice.paymentNotes
  );
  const hasTerms = Boolean(invoice.paymentTerms && invoice.paymentTerms.trim());
  const hasImage = imagesToRender.length > 0;

  if (!hasBankDetails && !hasTerms && !hasImage) {
    return yPos;
  }

  const isSingleSideLayout = imagesToRender.length === 1 && (hasBankDetails || hasTerms);

  // Determine image dimensions if present
  let imageAreaWidth = 0;
  let singleImgDrawW = 0;
  let singleImgDrawH = 0;
  let imgTotalH = 0;

  if (isSingleSideLayout) {
    const single = imagesToRender[0];
    const isCheque = single.type === "cheque";
    const maxImgW = isCheque ? 46 : 25;
    const maxImgH = isCheque ? 24 : 25;
    const aspect = single.logo.width / (single.logo.height || 1);

    singleImgDrawW = maxImgW;
    singleImgDrawH = singleImgDrawW / aspect;
    if (singleImgDrawH > maxImgH) {
      singleImgDrawH = maxImgH;
      singleImgDrawW = singleImgDrawH * aspect;
    }

    imageAreaWidth = Math.max(singleImgDrawW + 6, isCheque ? 50 : 30);
    imgTotalH = singleImgDrawH + 7; // image + caption + padding
  }

  const textWidth = isSingleSideLayout ? width - imageAreaWidth - 8 : width - 8;
  const leftPad = 4;
  const topPad = 4;
  const bottomPad = 5;

  // Measure text block height
  let textH = 0;
  if (hasBankDetails) {
    textH += 5; // Section title

    // Calculate grid rows
    const detailsCount = [
      invoice.bankName,
      invoice.accountName,
      invoice.accountNumber,
      invoice.routingCode,
    ].filter(Boolean).length;

    const useTwoCols = textWidth >= 80 && detailsCount > 1;
    const rowCount = useTwoCols ? Math.ceil(detailsCount / 2) : detailsCount;
    textH += rowCount * 7.5;

    if (invoice.upiId) {
      textH += 7;
    }

    if (invoice.paymentNotes) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(8);
      const noteLines = doc.splitTextToSize(invoice.paymentNotes, textWidth);
      textH += noteLines.length * 3.8 + 2;
    }
  }

  let termsLines: string[] = [];
  if (hasTerms && invoice.paymentTerms) {
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8);
    termsLines = doc.splitTextToSize(invoice.paymentTerms, textWidth);
    textH += (hasBankDetails ? 4 : 0) + 4 + termsLines.length * 3.8;
  }

  let contentH = textH;
  if (isSingleSideLayout) {
    contentH = Math.max(textH, imgTotalH);
  } else if (hasImage) {
    const imagesRowH = (hasBankDetails || hasTerms) ? 36 : 28;
    contentH = (hasBankDetails || hasTerms) ? textH + imagesRowH : imagesRowH;
  }
  const totalBoxH = contentH + topPad + bottomPad;

  // Check if we need a page break
  if (yPos + totalBoxH > pageHeight - footerReserve) {
    yPos = onPageBreak();
  }

  const boxStartY = yPos;

  // Background and border
  if (boxStyle === "card" && fillColor) {
    doc.setFillColor(...fillColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(startX, boxStartY, width, totalBoxH, 2, 2, "FD");
  } else if (boxStyle === "letterhead") {
    if (fillColor) {
      doc.setFillColor(...fillColor);
      doc.rect(startX, boxStartY, width, totalBoxH, "F");
    }
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(startX, boxStartY, width, totalBoxH, "S");
  } else {
    // Minimal
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.25);
    doc.line(startX, boxStartY, startX + width, boxStartY);
  }

  let curY = boxStartY + topPad + 3.5;
  const contentX = startX + leftPad;

  // Draw Bank Details
  if (hasBankDetails) {
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text("PAYMENT DETAILS", contentX, curY);
    curY += 4.5;

    const fields: Array<{ label: string; value: string; isMono?: boolean }> = [];
    if (invoice.bankName) fields.push({ label: "Bank", value: invoice.bankName });
    if (invoice.accountName) fields.push({ label: "Account Name", value: invoice.accountName });
    if (invoice.accountNumber) fields.push({ label: "Account No.", value: invoice.accountNumber, isMono: true });
    if (invoice.routingCode) fields.push({ label: "IFSC/SWIFT/Routing", value: invoice.routingCode, isMono: true });

    const useTwoCols = textWidth >= 80 && fields.length > 1;
    const colW = useTwoCols ? textWidth / 2 : textWidth;

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const col = useTwoCols ? i % 2 : 0;
      const x = contentX + col * colW;

      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(7);
      doc.setTextColor(...mutedColor);
      doc.text(field.label.toUpperCase(), x, curY);

      doc.setFont(field.isMono ? FONT_FAMILY_MONO : FONT_FAMILY, "bold");
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text(field.value, x, curY + 3.5);

      if (!useTwoCols || col === 1 || i === fields.length - 1) {
        curY += 7.5;
      }
    }

    if (invoice.upiId) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(7);
      doc.setTextColor(...mutedColor);
      doc.text("UPI ID / PAYMENT LINK", contentX, curY);

      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text(invoice.upiId, contentX, curY + 3.5);
      curY += 7;
    }

    if (invoice.paymentNotes) {
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedColor);
      const noteLines = doc.splitTextToSize(invoice.paymentNotes, textWidth);
      doc.text(noteLines, contentX, curY);
      curY += noteLines.length * 3.6 + 1.5;
    }
  }

  // Draw Payment Terms
  if (hasTerms && termsLines.length > 0) {
    if (hasBankDetails) {
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.2);
      doc.line(contentX, curY - 0.5, contentX + textWidth, curY - 0.5);
      curY += 3;
    }

    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);
    doc.text("PAYMENT TERMS", contentX, curY);
    curY += 3.5;

    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    doc.text(termsLines, contentX, curY);
    curY += termsLines.length * 3.8 + 2;
  }

  // Draw Payment Images
  if (isSingleSideLayout && imagesToRender[0]) {
    const single = imagesToRender[0];
    const imgX = startX + width - imageAreaWidth + (imageAreaWidth - singleImgDrawW) / 2;
    const imgY = boxStartY + topPad + 1;

    try {
      doc.addImage(single.logo.dataUrl, "PNG", imgX, imgY, singleImgDrawW, singleImgDrawH);

      // Subtle framing line around image
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.2);
      doc.rect(imgX - 0.5, imgY - 0.5, singleImgDrawW + 1, singleImgDrawH + 1, "S");

      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(7);
      doc.setTextColor(...mutedColor);
      doc.text(single.label, imgX + singleImgDrawW / 2, imgY + singleImgDrawH + 3.8, { align: "center" });
    } catch {
      // Skip image gracefully if corrupted
    }
  } else if (!isSingleSideLayout && hasImage) {
    if (hasBankDetails || hasTerms) {
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.2);
      doc.line(startX + leftPad, curY + 1, startX + width - leftPad, curY + 1);
      curY += 4.5;

      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedColor);
      doc.text("PAYMENT METHODS & VERIFICATION", startX + leftPad, curY);
      curY += 3.5;
    }

    const numImages = imagesToRender.length;
    const totalRowW = width - leftPad * 2;
    const slotW = totalRowW / numImages;
    const imgRowY = curY;

    for (let i = 0; i < numImages; i++) {
      const item = imagesToRender[i];
      const isCheque = item.type === "cheque";
      const maxW = Math.min(slotW - 8, isCheque ? 44 : 24);
      const maxH = 22;
      const aspect = item.logo.width / (item.logo.height || 1);

      let drawW = maxW;
      let drawH = drawW / aspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * aspect;
      }

      const slotCenterX = startX + leftPad + i * slotW + slotW / 2;
      const imgX = slotCenterX - drawW / 2;
      const imgY = imgRowY;

      try {
        doc.addImage(item.logo.dataUrl, "PNG", imgX, imgY, drawW, drawH);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.rect(imgX - 0.5, imgY - 0.5, drawW + 1, drawH + 1, "S");

        doc.setFont(FONT_FAMILY, "normal");
        doc.setFontSize(7);
        doc.setTextColor(...mutedColor);
        doc.text(item.label, slotCenterX, imgY + drawH + 3.8, { align: "center" });
      } catch {
        // Skip image gracefully if corrupted
      }
    }
  }

  return boxStartY + totalBoxH + 4;
}
