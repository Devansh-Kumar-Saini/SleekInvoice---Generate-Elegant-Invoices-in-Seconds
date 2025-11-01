import jsPDF from "jspdf";
import { type Invoice, type InvoiceItem } from "@/types/invoice";

const currencies: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
};

export async function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const symbol = currencies[invoice.currency] || "$";
    return `${symbol}${num.toFixed(2)}`;
  };

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Company Logo (if URL provided)
  if (invoice.companyLogo) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = invoice.companyLogo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      doc.addImage(img, "PNG", margin, yPos, 30, 12);
      yPos += 18;
    } catch (error) {
      console.error("Failed to load logo image:", error);
      // Continue without logo
    }
  }

  // Company Name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.companyName, margin, yPos);
  yPos += 10;

  // Invoice Title and Details (right-aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });
  doc.setFontSize(9);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, 27, {
    align: "right",
  });
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, 32, {
    align: "right",
  });
  doc.text(`Category: ${invoice.category}`, pageWidth - margin, 37, {
    align: "right",
  });

  yPos += 10;

  // Customer Information
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoice.customerName, margin, yPos);
  yPos += 5;

  if (invoice.customerEmail) {
    doc.setFontSize(9);
    doc.text(invoice.customerEmail, margin, yPos);
    yPos += 5;
  }

  if (invoice.customerPhone) {
    doc.setFontSize(9);
    doc.text(invoice.customerPhone, margin, yPos);
    yPos += 5;
  }

  if (invoice.customerAddress) {
    doc.setFontSize(9);
    const addressLines = doc.splitTextToSize(
      invoice.customerAddress,
      pageWidth - margin * 2
    );
    doc.text(addressLines, margin, yPos);
    yPos += addressLines.length * 5;
  }

  yPos += 10;

  // Items Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Item", margin + 2, yPos + 5);
  doc.text("Qty", pageWidth - 110, yPos + 5, { align: "right" });
  doc.text("Price", pageWidth - 75, yPos + 5, { align: "right" });
  doc.text("Total", pageWidth - margin - 2, yPos + 5, { align: "right" });

  yPos += 10;

  // Items
  doc.setFont("helvetica", "normal");

  invoice.items.forEach((item: InvoiceItem) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const total = item.quantity * item.price;

    doc.text(item.name, margin + 2, yPos);
    if (item.details) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(item.details, margin + 2, yPos + 4);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      yPos += 4;
    }

    doc.text(String(item.quantity), pageWidth - 110, yPos, { align: "right" });
    doc.text(formatCurrency(item.price), pageWidth - 75, yPos, {
      align: "right",
    });
    doc.text(formatCurrency(total), pageWidth - margin - 2, yPos, {
      align: "right",
    });

    yPos += 8;
  });

  // Line before totals
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Calculations
  const calculations = [
    { label: "Subtotal", value: invoice.subtotal },
    {
      label: `Tax (${invoice.taxPercentage}%)`,
      value: invoice.tax,
    },
  ];

  if (invoice.discount && parseFloat(invoice.discount) > 0) {
    calculations.push({
      label: "Discount",
      value: `-${invoice.discount}`,
    });
  }

  doc.setFont("helvetica", "normal");
  calculations.forEach((calc) => {
    doc.text(calc.label, pageWidth - 80, yPos);
    doc.text(formatCurrency(calc.value), pageWidth - margin - 2, yPos, {
      align: "right",
    });
    yPos += 6;
  });

  // Grand Total
  yPos += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL", pageWidth - 80, yPos);
  doc.text(formatCurrency(invoice.grandTotal), pageWidth - margin - 2, yPos, {
    align: "right",
  });

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
