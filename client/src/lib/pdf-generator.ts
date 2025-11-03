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

  // Header section
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.companyName, margin, yPos);

  // Invoice details (right-aligned)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, yPos + 8, {
    align: "right",
  });
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, yPos + 16, {
    align: "right",
  });
  doc.text(`Category: ${invoice.category}`, pageWidth - margin, yPos + 24, {
    align: "right",
  });

  yPos += 40;

  // Customer Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("BILL TO", margin, yPos);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customerName, margin, yPos + 8);
  
  if (invoice.customerEmail || invoice.customerPhone || invoice.customerAddress) {
    doc.setFontSize(10);
    let contactY = yPos + 16;
    
    if (invoice.customerEmail) {
      doc.text(`Email: ${invoice.customerEmail}`, margin, contactY);
      contactY += 6;
    }
    
    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, margin, contactY);
      contactY += 6;
    }
    
    if (invoice.customerAddress) {
      const addressLines = doc.splitTextToSize(
        `Address: ${invoice.customerAddress}`,
        pageWidth - margin * 2
      );
      doc.text(addressLines, margin, contactY);
      contactY += addressLines.length * 5;
    }
    
    yPos = contactY + 15;
  } else {
    yPos += 25;
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
      fillColor: [60, 60, 60],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    styles: {
      cellPadding: 4,
      fontSize: 10,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Totals Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SUMMARY", margin, yPos);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const totals = [
    { label: "Subtotal", value: formatCurrency(invoice.subtotal.toString()) },
    { label: `Tax (${invoice.taxPercentage}%)`, value: formatCurrency(invoice.tax.toString()) }
  ];
  
  if (invoice.discount && parseFloat(invoice.discount) > 0) {
    totals.push({ 
      label: "Discount", 
      value: `-${formatCurrency(invoice.discount.toString())}` 
    });
  }
  
  totals.forEach((total, i) => {
    doc.text(total.label, pageWidth - 100, yPos + 10 + (i * 8));
    doc.text(total.value, pageWidth - margin, yPos + 10 + (i * 8), { 
      align: "right" 
    });
  });
  
  // Grand Total
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL DUE", pageWidth - 100, yPos + 40);
  doc.text(formatCurrency(invoice.grandTotal), pageWidth - margin, yPos + 40, { 
    align: "right" 
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
