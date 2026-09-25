import { type InvoiceTemplate, type CustomColors } from "@/lib/pdf-templates";

export type LogoSize = "small" | "medium" | "large";

// Invoice item type
export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number | "";
  details?: string;
}


export type FormValues = {
  companyName: string;
  companyLogo: string;
  logoSize: LogoSize;
  companyAddress: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  category: string;
  currency: string;
  taxPercentage: number;
  discountType: "none" | "flat" | "percentage";
  discountValue: number;
  notes: string;
  template: InvoiceTemplate;
  customColors: CustomColors;
  invoiceTheme: "light" | "dark";
};

export const categories = [
  "Electronics",
  "Groceries",
  "Services",
  "Consulting",
  "Software",
  "Hardware",
  "Office Supplies",
  "Other",
];

export const QTY_OPTIONAL_CATEGORIES = new Set(["Consulting", "Services"]);

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: CurrencyOption[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `INV-${y}${m}${d}-${rand}`;
}

export const initialFormValues: FormValues = {
  companyName: "",
  companyLogo: "",
  logoSize: "medium",
  companyAddress: "",
  date: new Date().toISOString().split("T")[0],
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerAddress: "",
  category: "",
  currency: "USD",
  taxPercentage: 10,
  discountType: "none",
  discountValue: 0,
  notes: "",
  template: "classic",
  customColors: {},
  invoiceTheme: "light",
};
