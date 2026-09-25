import { type InvoiceItem } from "@/types/invoice";
import {
  type InvoiceTemplate,
  type ColorizableTemplate,
  type CustomColors,
  resolveColor,
} from "@/lib/pdf-templates";

export interface InvoicePreviewProps {
  template?: InvoiceTemplate;
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  invoiceNumber?: string;
  date: string;
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
  discount: number;
  grandTotal: number;
  /** Per-template color overrides from the "Customize Invoice" section —
   * see TEMPLATE_COLOR_SLOTS in pdf-templates.ts. Not consulted by Clean. */
  customColors?: CustomColors;
  /** The invoice's own light/dark background, set via the "Customize Invoice"
   * section — only consulted by the Clean template. Deliberately independent
   * of the app's own UI theme (see useTheme/header.tsx); defaults to "light". */
  invoiceTheme?: "light" | "dark";
}

export interface SharedProps extends InvoicePreviewProps {
  formatCurrency: (amount: number) => string;
}

/** Resolves a template's color slots to a plain object of CSS hex strings,
 * e.g. `colorsFor("classic", overrides)` -> `{ primary: "#dc264a", ... }`.
 * Used to build inline `style` overrides on top of each preview's Tailwind
 * defaults, so a customized color takes effect without needing a dynamic
 * Tailwind class per possible hex value. */
export function colorsFor(
  template: ColorizableTemplate,
  overrides: CustomColors | undefined,
  slotKeys: string[],
  isDark?: boolean
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of slotKeys) {
    result[key] = resolveColor(template, key, overrides, isDark);
  }
  return result;
}

export const currencies: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** DD/MM/YYYY, matching the Clean template's metadata grid date format. */
export function formatDateSlash(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
