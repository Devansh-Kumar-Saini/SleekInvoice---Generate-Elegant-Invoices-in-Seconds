import { jsPDF } from "jspdf";
import {
  registerFonts,
  loadLogo,
  type InvoicePdfData,
  type LoadedLogo,
  type TemplateContext,
  FONT_FAMILY,
} from "./core";
import {
  hexToRgb,
  resolveColor,
  INVOICE_TEMPLATES,
  type InvoiceTemplate,
  type CustomColors,
} from "@/lib/pdf-templates";
import { renderClassicTemplate } from "./templates/classic";
import { renderCleanTemplate } from "./templates/clean";
import { renderModernTemplate } from "./templates/modern";
import { renderElegantTemplate } from "./templates/elegant";
import { renderSidebarTemplate } from "./templates/sidebar";

export type { InvoicePdfData, InvoiceTemplate, CustomColors };
export { INVOICE_TEMPLATES };

export async function generateInvoicePDF(invoice: InvoicePdfData): Promise<{ warning: string | null }> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFonts(doc);
  doc.setFont(FONT_FAMILY, "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const footerReserve = 20;

  let logo: LoadedLogo | null = null;
  let logoWarning: string | null = null;
  if (invoice.companyLogo) {
    const result = await loadLogo(invoice.companyLogo);
    logo = result.logo;
    logoWarning = result.warning;
  }

  const validItems = invoice.items.filter((item) => item.name && item.name.trim() !== "");
  const isDark = !!invoice.isDarkMode;

  const ctx: TemplateContext = {
    doc,
    invoice,
    logo,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    footerReserve,
    currency: invoice.currencySymbol,
    currencyCode: invoice.currencyCode,
    validItems,
    color: (template, slotKey) => hexToRgb(resolveColor(template, slotKey, invoice.customColors, isDark)),
    isDark,
  };

  switch (invoice.template) {
    case "clean":
      renderCleanTemplate(ctx);
      break;
    case "modern":
      renderModernTemplate(ctx);
      break;
    case "elegant":
      renderElegantTemplate(ctx);
      break;
    case "sidebar":
      renderSidebarTemplate(ctx);
      break;
    case "classic":
    default:
      renderClassicTemplate(ctx);
      break;
  }

  const safeInvoiceNumber = (invoice.invoiceNumber || "invoice").replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`${safeInvoiceNumber}.pdf`);

  return { warning: logoWarning };
}
