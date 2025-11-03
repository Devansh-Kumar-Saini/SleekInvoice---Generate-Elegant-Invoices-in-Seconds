import jsPDF from "jspdf";
import { type Invoice, type InvoiceItem } from "@/types/invoice";
import autoTable, { type UserOptions } from 'jspdf-autotable';

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
  let yPos = 30;

  // Helper function to format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const symbol = currencies[invoice.currency] || "$";
    return `${symbol}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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

  // Header section with logo
  if (invoice.companyLogo) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = invoice.companyLogo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      doc.addImage(img, "PNG", margin, yPos, 40, 40);
      yPos += 45;
    } catch (error) {
      console.error("Failed to load logo image:", error);
    }
  }

  // Company Name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.companyName, margin, yPos);
  yPos += 12;

  // Invoice details (right-aligned)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 255);
  doc.text("INVOICE", pageWidth - margin, 30, { align: "right" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, 45, {
    align: "right",
  });
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, 55, {
    align: "right",
  });
  doc.text(`Category: ${invoice.category}`, pageWidth - margin, 65, {
    align: "right",
  });

  yPos += 30;

  // Customer Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("BILL TO", margin, yPos);
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customerName, margin, yPos);
  yPos += 7;
  
  if (invoice.customerEmail || invoice.customerPhone || invoice.customerAddress) {
    doc.setFontSize(10);
    
    if (invoice.customerEmail) {
      doc.text(`Email: ${invoice.customerEmail}`, margin, yPos);
      yPos += 6;
    }
    
    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, margin, yPos);
      yPos += 6;
    }
    
    if (invoice.customerAddress) {
      const addressLines = doc.splitTextToSize(
        `Address: ${invoice.customerAddress}`,
        pageWidth - margin * 2
      );
      doc.text(addressLines, margin, yPos);
      yPos += addressLines.length * 5;
    }
    
    yPos += 10;
  } else {
    yPos += 15;
  }

  // Items Table
  const itemsData = invoice.items.map(item => [
    item.name + (item.details ? `\n${item.details}` : ''),
    item.quantity,
    formatCurrency(item.price),
    formatCurrency(item.quantity * item.price)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
    body: itemsData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    styles: {
      cellPadding: 6,
      fontSize: 10,
      valign: 'middle',
      lineColor: [220, 220, 220],
      lineWidth: 0.5
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Totals Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SUMMARY", margin, yPos);
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  const totals = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax) }
  ];
  
  if (invoice.discount && parseFloat(invoice.discount) > 0) {
    totals.push({ 
      label: "Discount", 
      value: `-${formatCurrency(invoice.discount)}` 
    });
  }
  
  totals.forEach((total, i) => {
    doc.text(total.label, pageWidth - 100, yPos + (i * 8));
    doc.text(total.value, pageWidth - margin, yPos + (i * 8), { 
      align: "right" 
    });
  });
  
  // Grand Total
  yPos += totals.length * 8 + 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL DUE", pageWidth - 100, yPos);
  doc.setTextColor(100, 100, 255);
  doc.text(formatCurrency(invoice.grandTotal), pageWidth - margin, yPos, { 
    align: "right" 
  });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Thank you for your business! Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: "center" }
  );

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
