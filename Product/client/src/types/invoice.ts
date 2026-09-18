// Invoice item type
export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  details?: string;
}

// Invoice form data type
export interface Invoice {
  invoiceNumber: string;
  date: string;
  companyName: string;
  companyLogo?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  category: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercentage: number;
  tax: number;
  discountType?: "flat" | "percentage";
  discountValue?: number;
  discount?: number;
  grandTotal: number;
}
