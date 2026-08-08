import { memo } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Mail, Phone, Home } from "lucide-react";
import { type InvoiceItem } from "@/types/invoice";
import {
  type InvoiceTemplate,
  type ColorizableTemplate,
  type CustomColors,
  resolveColor,
} from "@/lib/pdf-templates";
import { amountToWords, formatCurrencyAmount } from "@/lib/invoice-format";
import { useTheme } from "@/hooks/use-theme";

interface InvoicePreviewProps {
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
}

/** Resolves a template's color slots to a plain object of CSS hex strings,
 * e.g. `colorsFor("classic", overrides)` -> `{ primary: "#dc264a", ... }`.
 * Used to build inline `style` overrides on top of each preview's Tailwind
 * defaults, so a customized color takes effect without needing a dynamic
 * Tailwind class per possible hex value. */
function colorsFor(
  template: ColorizableTemplate,
  overrides: CustomColors | undefined,
  slotKeys: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of slotKeys) {
    result[key] = resolveColor(template, key, overrides);
  }
  return result;
}

const currencies: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** DD/MM/YYYY, matching the Clean template's metadata grid date format. */
function formatDateSlash(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// Memoized so this (fairly large) template tree only re-renders when one of
// its own props actually changes — the parent page also re-renders on
// unrelated state (e.g. isGenerating, accordion open/close) that shouldn't
// force the live preview to redo its work.
export const InvoicePreview = memo(function InvoicePreview(props: InvoicePreviewProps) {
  const currencySymbol = currencies[props.currency] || "$";
  const formatCurrency = (amount: number) =>
    formatCurrencyAmount(amount, currencySymbol, props.currency);

  const shared = { ...props, formatCurrency };

  switch (props.template) {
    case "clean":
      return <CleanPreview {...shared} />;
    case "modern":
      return <ModernPreview {...shared} />;
    case "elegant":
      return <ElegantPreview {...shared} />;
    case "sidebar":
      return <SidebarPreview {...shared} />;
    case "classic":
    default:
      return <ClassicPreview {...shared} />;
  }
});

interface SharedProps extends InvoicePreviewProps {
  formatCurrency: (amount: number) => string;
}

// ---------------------------------------------------------------------------
// Classic — the original InvoiceForge design.
// ---------------------------------------------------------------------------
function ClassicPreview({
  companyName,
  companyLogo,
  companyAddress,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  category,
  currency,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
  customColors,
}: SharedProps) {
  const c = colorsFor("classic", customColors, ["primary", "dark", "muted", "border", "headerFill"]);
  return (
    <Card className="p-8 bg-background shadow-sm w-full max-w-4xl" data-testid="invoice-preview">
      <div className="space-y-8">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <div className="min-w-0">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="max-h-16 w-auto object-contain mb-3"
                data-testid="preview-company-logo"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <h3
              className="text-2xl sm:text-3xl font-bold break-words"
              style={{ color: c.dark }}
              data-testid="preview-company-name"
            >
              {companyName || "Company Name"}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-medium uppercase tracking-wider mb-1" style={{ color: c.primary }}>
              Invoice
            </div>
            {invoiceNumber && (
              <div
                className="text-xs sm:text-sm font-mono whitespace-nowrap"
                style={{ color: c.dark }}
                data-testid="preview-invoice-number"
              >
                {invoiceNumber}
              </div>
            )}
            <div className="text-sm whitespace-nowrap" style={{ color: c.muted }} data-testid="preview-date">
              {date ? formatDate(date) : "Date"}
            </div>
            {category && (
              <div className="text-xs mt-2" style={{ color: c.muted }} data-testid="preview-category">
                {category}
              </div>
            )}
          </div>
        </div>

        {/* Billed By / Bill To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="min-w-0">
            <div className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: c.muted }}>
              Billed By
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold break-words" style={{ color: c.dark }} data-testid="preview-company-billed-by">
                {companyName || "Company Name"}
              </div>
              {companyAddress && (
                <div
                  className="flex items-start gap-2 text-sm"
                  style={{ color: c.muted }}
                  data-testid="preview-company-address"
                >
                  <Home className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap break-words min-w-0">{companyAddress}</span>
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: c.muted }}>
              Bill To
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold break-words" style={{ color: c.dark }} data-testid="preview-customer-name">
                {customerName || "Customer Name"}
              </div>
              {customerEmail && (
                <div className="flex items-start gap-2 text-sm" style={{ color: c.muted }} data-testid="preview-customer-email">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="break-all min-w-0">{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-start gap-2 text-sm" style={{ color: c.muted }} data-testid="preview-customer-phone">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="break-words min-w-0">{customerPhone}</span>
                </div>
              )}
              {customerAddress && (
                <div
                  className="flex items-start gap-2 text-sm mt-2"
                  style={{ color: c.muted }}
                  data-testid="preview-customer-address"
                >
                  <Home className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap break-words min-w-0">{customerAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
            <div
              className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium uppercase tracking-wider min-w-[600px]"
              style={{ backgroundColor: c.headerFill, color: "#ffffff" }}
            >
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {items.length > 0 && items.some((item) => item.name) ? (
              items
                .filter((item) => item.name)
                .map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 px-4 py-3 min-w-[600px] hover:bg-muted/10"
                    style={{ borderTop: `1px solid ${c.border}` }}
                    data-testid={`preview-item-${index}`}
                  >
                    <div className="col-span-6">
                      <div className="font-medium break-words" style={{ color: c.dark }}>{item.name}</div>
                      {item.details && (
                        <div className="text-xs mt-1 break-words" style={{ color: c.muted }}>
                          {item.details}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-right font-mono" style={{ color: c.dark }}>
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right font-mono" style={{ color: c.dark }}>
                      {formatCurrency(item.price)}
                    </div>
                    <div className="col-span-2 text-right font-mono font-semibold" style={{ color: c.dark }}>
                      {formatCurrency(item.quantity * item.price)}
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No items added yet
              </div>
            )}
          </div>
        </div>

        {/* Calculations */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: c.muted }}>Subtotal</span>
            <span className="font-mono font-semibold" style={{ color: c.dark }} data-testid="preview-subtotal">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: c.muted }}>Tax ({taxPercentage}%)</span>
            <span className="font-mono font-semibold" style={{ color: c.dark }} data-testid="preview-tax">
              {formatCurrency(tax)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: c.muted }}>Discount</span>
              <span className="font-mono font-semibold text-destructive" data-testid="preview-discount">
                -{formatCurrency(discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4" style={{ borderTop: `1px solid ${c.border}` }}>
            <span className="text-lg font-semibold" style={{ color: c.dark }}>Total Due</span>
            <span className="text-2xl font-mono font-bold" style={{ color: c.primary }} data-testid="preview-total">
              {formatCurrency(grandTotal)}
            </span>
          </div>
          <div className="pt-1">
            <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: c.muted }}>
              Invoice Total (in words)
            </div>
            <div className="text-sm capitalize" style={{ color: c.dark }} data-testid="preview-total-words">
              {amountToWords(grandTotal, currency)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Thank you for your business!
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Clean — matches the reference invoice design exactly: giant thin title,
// label/value metadata grid, Billed By/To split with a vertical divider,
// borderless items table with plain-text headers, monospaced numeric
// columns, and an "Invoice Total (in words)" line. The background flips
// black/white with the app's own theme toggle rather than always being dark.
// ---------------------------------------------------------------------------
function CleanPreview({
  companyName,
  companyAddress,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  currency,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card
      className={`p-8 sm:p-10 shadow-sm w-full max-w-4xl border-border ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
      data-testid="invoice-preview"
    >
      <div className="space-y-8">
        {/* Giant, thin-weight title */}
        <div className="pb-6 border-b border-border">
          <h1
            className="text-3xl sm:text-4xl font-light tracking-tight break-words"
            data-testid="preview-company-name"
          >
            Invoice {invoiceNumber || ""}
          </h1>
        </div>

        {/* Metadata label/value grid */}
        <div className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm max-w-md">
          <span className="text-muted-foreground">Serial Number</span>
          <span data-testid="preview-invoice-number">
            {(invoiceNumber || "").replace(/^INV-?/i, "") || invoiceNumber || "—"}
          </span>
          <span className="text-muted-foreground">Date</span>
          <span data-testid="preview-date">{date ? formatDateSlash(date) : "—"}</span>
          <span className="text-muted-foreground">Currency</span>
          <span>{currency}</span>
        </div>

        {/* Billed By / Billed To with a vertical divider */}
        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-border relative">
          <div className="sm:border-r border-border pr-6 min-w-0">
            <div className="text-xs text-muted-foreground mb-2">Billed By</div>
            <div className="text-base font-semibold break-words" data-testid="preview-company-billed-by">
              {companyName || "Company Name"}
            </div>
            {companyAddress && (
              <div
                className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-words"
                data-testid="preview-company-address"
              >
                {companyAddress}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-2">Billed To</div>
            <div className="text-base font-semibold break-words" data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {(customerEmail || customerPhone) && (
              <div className="text-xs text-muted-foreground mt-1 break-words">
                {[customerEmail, customerPhone].filter(Boolean).join("  •  ")}
              </div>
            )}
            {customerAddress && (
              <div
                className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-words"
                data-testid="preview-customer-address"
              >
                {customerAddress}
              </div>
            )}
          </div>
        </div>

        {/* Items — no borders/fills on header, just a rule; monospaced numbers */}
        <div>
          <div className="grid grid-cols-12 gap-4 pb-2 border-b border-border text-sm text-muted-foreground min-w-[600px]">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {validItems.length > 0 ? (
            validItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 py-3 min-w-[600px]"
                data-testid={`preview-item-${index}`}
              >
                <div className="col-span-6">
                  <div className="text-sm break-words">{item.name}</div>
                  {item.details && (
                    <div className="text-xs text-muted-foreground mt-0.5 break-words">
                      {item.details}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm font-mono">{item.quantity}</div>
                <div className="col-span-2 text-right text-sm font-mono">
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-2 text-right text-sm font-mono">
                  {formatCurrency(item.quantity * item.price)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No items added yet</div>
          )}
          <div className="border-b border-border" />
        </div>

        {/* Large sparse gap, matching the reference's minimal layout */}
        <div className="hidden sm:block h-24" />

        {/* Calculations */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-sm font-mono" data-testid="preview-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {/* Mirrors the reference invoice's per-item subtotal breakdown,
                but that only reads cleanly with a single line item — with
                several items it would just duplicate the items table. */}
            {validItems.length <= 1 &&
              validItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground break-words pr-2">{item.name}</span>
                  <span className="text-sm font-mono whitespace-nowrap">
                    {formatCurrency(item.quantity * item.price)}
                  </span>
                </div>
              ))}
            {tax > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Tax ({taxPercentage}%)</span>
                <span className="text-sm font-mono" data-testid="preview-tax">
                  {formatCurrency(tax)}
                </span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Discount</span>
                <span className="text-sm font-mono" data-testid="preview-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-mono font-bold" data-testid="preview-total">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="pt-2">
              <div className="text-[10px] text-muted-foreground">Invoice Total (in words)</div>
              <div className="text-sm capitalize" data-testid="preview-total-words">
                {amountToWords(grandTotal, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
          <span>Thank you for your business</span>
          <span>InvoiceForge</span>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Modern — bold type, dark banner header, dramatic accent-colored total.
// ---------------------------------------------------------------------------
function ModernPreview({
  companyName,
  companyLogo,
  companyAddress,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  category,
  currency,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
  customColors,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);
  const c = colorsFor("modern", customColors, ["accent", "pop", "ink", "muted"]);

  return (
    <Card
      className="p-0 bg-background shadow-sm w-full max-w-4xl overflow-hidden"
      data-testid="invoice-preview"
    >
      {/* Banner header */}
      <div className="px-8 py-8" style={{ backgroundColor: c.accent }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {companyLogo && (
              <div className="bg-white rounded-md p-1.5 inline-block mb-3">
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="max-h-8 w-auto object-contain"
                  data-testid="preview-company-logo"
                />
              </div>
            )}
            <h3
              className="text-2xl font-extrabold text-white break-words tracking-tight"
              data-testid="preview-company-name"
            >
              {companyName || "Company Name"}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: c.pop }}>INVOICE</div>
            {invoiceNumber && (
              <div className="text-sm text-zinc-300 mt-1" data-testid="preview-invoice-number">
                {invoiceNumber}
              </div>
            )}
            <div className="text-sm text-zinc-400" data-testid="preview-date">
              {date ? formatDate(date) : "Date"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Billed By / Billed To / Category chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: c.muted }}>
              Billed By
            </div>
            <div className="text-sm font-bold break-words" style={{ color: c.ink }} data-testid="preview-company-billed-by">
              {companyName || "Company Name"}
            </div>
            {companyAddress && (
              <div
                className="flex items-start gap-1.5 text-[11px] mt-1.5"
                style={{ color: c.muted }}
                data-testid="preview-company-address"
              >
                <Home className="w-3 h-3 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap break-words min-w-0">{companyAddress}</span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-muted p-3 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: c.muted }}>
              Billed To
            </div>
            <div className="text-sm font-bold break-words" style={{ color: c.ink }} data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {(customerEmail || customerPhone || customerAddress) && (
              <div className="mt-1.5 space-y-1">
                {customerEmail && (
                  <div className="flex items-start gap-1.5 text-[11px]" style={{ color: c.muted }}>
                    <Mail className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="break-all min-w-0">{customerEmail}</span>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex items-start gap-1.5 text-[11px]" style={{ color: c.muted }}>
                    <Phone className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="break-words min-w-0">{customerPhone}</span>
                  </div>
                )}
                {customerAddress && (
                  <div
                    className="flex items-start gap-1.5 text-[11px]"
                    style={{ color: c.muted }}
                    data-testid="preview-customer-address"
                  >
                    <Home className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="whitespace-pre-wrap break-words min-w-0">{customerAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="rounded-lg bg-muted p-3 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: c.muted }}>
              Category
            </div>
            <div className="text-sm font-bold break-words" style={{ color: c.ink }} data-testid="preview-category">
              {category || "General"}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg overflow-hidden border border-border">
          <div
            className="grid grid-cols-12 gap-4 px-4 py-3 text-white text-xs font-bold uppercase tracking-wide min-w-[600px]"
            style={{ backgroundColor: c.accent }}
          >
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {validItems.length > 0 ? (
            validItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-border min-w-[600px] odd:bg-muted/40"
                data-testid={`preview-item-${index}`}
              >
                <div className="col-span-6">
                  <div className="font-bold text-sm break-words" style={{ color: c.ink }}>{item.name}</div>
                  {item.details && (
                    <div className="text-xs mt-0.5 break-words" style={{ color: c.muted }}>
                      {item.details}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm" style={{ color: c.ink }}>{item.quantity}</div>
                <div className="col-span-2 text-right text-sm" style={{ color: c.ink }}>
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-2 text-right text-sm font-bold" style={{ color: c.ink }}>
                  {formatCurrency(item.quantity * item.price)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No items added yet</div>
          )}
        </div>

        {/* Calculations */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: c.muted }}>Subtotal</span>
              <span className="text-sm" style={{ color: c.ink }} data-testid="preview-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: c.muted }}>Tax ({taxPercentage}%)</span>
              <span className="text-sm" style={{ color: c.ink }} data-testid="preview-tax">
                {formatCurrency(tax)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: c.muted }}>Discount</span>
                <span className="text-sm" style={{ color: c.ink }} data-testid="preview-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center rounded-lg px-4 py-3 mt-3" style={{ backgroundColor: c.pop }}>
              <span className="text-sm font-extrabold text-white uppercase tracking-wide">
                Total Due
              </span>
              <span className="text-xl font-extrabold text-white" data-testid="preview-total">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.muted }}>
                Invoice Total (in words)
              </div>
              <div className="text-sm capitalize" style={{ color: c.ink }} data-testid="preview-total-words">
                {amountToWords(grandTotal, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex justify-between text-xs" style={{ color: c.muted }}>
          <span>Thank you for your business!</span>
          <span className="font-bold" style={{ color: c.pop }}>InvoiceForge</span>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Elegant — a formal serif-style letterhead: centered company name, a thin
// gold double-rule under the header, label-above-value contact blocks with
// no icons, and a bordered (not filled) total box. Mirrors the "Elegant" PDF
// template's restrained, letterhead-inspired aesthetic.
// ---------------------------------------------------------------------------
function ElegantPreview({
  companyName,
  companyLogo,
  companyAddress,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  currency,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
  customColors,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);
  const c = colorsFor("elegant", customColors, ["ink", "muted", "gold", "rule"]);

  return (
    <Card
      className="p-8 sm:p-10 bg-background shadow-sm w-full max-w-4xl"
      data-testid="invoice-preview"
    >
      <div className="space-y-8">
        {/* Centered letterhead header */}
        <div className="flex flex-col items-center text-center">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="max-h-14 w-auto object-contain mb-3"
              data-testid="preview-company-logo"
            />
          ) : null}
          <h3
            className="text-2xl sm:text-3xl font-semibold tracking-wide break-words"
            style={{ color: c.ink }}
            data-testid="preview-company-name"
          >
            {companyName || "Company Name"}
          </h3>
          {companyAddress && (
            <div
              className="text-xs mt-2 max-w-md whitespace-pre-wrap break-words"
              style={{ color: c.muted }}
              data-testid="preview-company-address"
            >
              {companyAddress}
            </div>
          )}
          <div className="flex items-center gap-1 mt-4">
            <span className="h-px w-10" style={{ backgroundColor: c.gold }} />
            <span className="h-px w-10" style={{ backgroundColor: c.gold }} />
          </div>
        </div>

        {/* Invoice title + metadata */}
        <div className="flex items-baseline justify-between pt-6" style={{ borderTop: `1px solid ${c.rule}` }}>
          <div className="text-sm font-bold uppercase tracking-widest" style={{ color: c.gold }}>
            Invoice
          </div>
          <div className="text-right text-xs" style={{ color: c.muted }}>
            {invoiceNumber && <div data-testid="preview-invoice-number">No. {invoiceNumber}</div>}
            <div data-testid="preview-date">{date ? formatDate(date) : "Date"}</div>
          </div>
        </div>

        {/* Billed By / Bill To — quiet, no icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6" style={{ borderTop: `1px solid ${c.rule}` }}>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c.gold }}>
              Billed By
            </div>
            <div className="text-base font-semibold break-words" style={{ color: c.ink }} data-testid="preview-company-billed-by">
              {companyName || "Company Name"}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c.gold }}>
              Bill To
            </div>
            <div className="text-base font-semibold break-words" style={{ color: c.ink }} data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {(customerEmail || customerPhone) && (
              <div className="text-xs mt-1 break-words" style={{ color: c.muted }}>
                {[customerEmail, customerPhone].filter(Boolean).join("   ")}
              </div>
            )}
            {customerAddress && (
              <div
                className="text-xs mt-1 whitespace-pre-wrap break-words"
                style={{ color: c.muted }}
                data-testid="preview-customer-address"
              >
                {customerAddress}
              </div>
            )}
          </div>
        </div>

        {/* Items — bordered table, gold rule under header */}
        <div>
          <div
            className="grid grid-cols-12 gap-4 pb-2 text-xs font-bold uppercase tracking-wide min-w-[600px]"
            style={{ borderBottom: `2px solid ${c.gold}`, color: c.gold }}
          >
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {validItems.length > 0 ? (
            validItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 py-3 min-w-[600px]"
                style={{ borderBottom: `1px solid ${c.rule}` }}
                data-testid={`preview-item-${index}`}
              >
                <div className="col-span-6">
                  <div className="text-sm break-words" style={{ color: c.ink }}>{item.name}</div>
                  {item.details && (
                    <div className="text-xs mt-0.5 break-words" style={{ color: c.muted }}>
                      {item.details}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm" style={{ color: c.ink }}>{item.quantity}</div>
                <div className="col-span-2 text-right text-sm" style={{ color: c.ink }}>
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-2 text-right text-sm" style={{ color: c.ink }}>
                  {formatCurrency(item.quantity * item.price)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No items added yet</div>
          )}
        </div>

        {/* Calculations */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: c.muted }}>Subtotal</span>
              <span className="text-sm" style={{ color: c.ink }} data-testid="preview-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: c.muted }}>Tax ({taxPercentage}%)</span>
              <span className="text-sm" style={{ color: c.ink }} data-testid="preview-tax">
                {formatCurrency(tax)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: c.muted }}>Discount</span>
                <span className="text-sm" style={{ color: c.ink }} data-testid="preview-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            {/* Bordered (not filled) total box — restrained, letterhead-style. */}
            <div
              className="flex justify-between items-center rounded-sm px-4 py-3 mt-3"
              style={{ border: `2px solid ${c.gold}` }}
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: c.gold }}>
                Total Due
              </span>
              <span className="text-xl font-semibold" style={{ color: c.ink }} data-testid="preview-total">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="pt-1">
              <div className="text-[10px]" style={{ color: c.muted }}>Invoice total in words</div>
              <div className="text-sm capitalize" style={{ color: c.ink }} data-testid="preview-total-words">
                {amountToWords(grandTotal, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 text-center text-xs" style={{ borderTop: `1px solid ${c.rule}`, color: c.muted }}>
          Thank you for your business
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sidebar — a full-height color block down the left carries the company
// identity and invoice metadata; items and totals sit in the white main
// column. Structurally distinct from Modern's top banner.
// ---------------------------------------------------------------------------
function SidebarPreview({
  companyName,
  companyLogo,
  companyAddress,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  category,
  currency,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
  customColors,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);
  const c = colorsFor("sidebar", customColors, ["sidebar", "pop", "ink", "muted"]);

  return (
    <Card
      className="p-0 bg-background shadow-sm w-full max-w-4xl overflow-hidden"
      data-testid="invoice-preview"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div className="sm:w-56 shrink-0 text-white p-6 space-y-6" style={{ backgroundColor: c.sidebar }}>
          <div>
            {companyLogo && (
              <div className="bg-white rounded-md p-1.5 inline-block mb-3">
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="max-h-8 w-auto object-contain"
                  data-testid="preview-company-logo"
                />
              </div>
            )}
            <div className="text-base font-bold break-words" data-testid="preview-company-name">
              {companyName || "Company Name"}
            </div>
            {companyAddress && (
              <div
                className="text-xs text-teal-200/80 mt-2 whitespace-pre-wrap break-words"
                data-testid="preview-company-address"
              >
                {companyAddress}
              </div>
            )}
          </div>

          <div className="pt-4 space-y-3" style={{ borderTop: `1px solid ${c.pop}66` }}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.pop }}>
                Invoice No.
              </div>
              <div className="text-sm mt-0.5" data-testid="preview-invoice-number">
                {invoiceNumber || "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.pop }}>Date</div>
              <div className="text-sm mt-0.5" data-testid="preview-date">
                {date ? formatDate(date) : "—"}
              </div>
            </div>
            {category && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.pop }}>
                  Category
                </div>
                <div className="text-sm mt-0.5" data-testid="preview-category">
                  {category}
                </div>
              </div>
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.pop }}>
                Currency
              </div>
              <div className="text-sm mt-0.5">{currency}</div>
            </div>
          </div>

          <div className="pt-4" style={{ borderTop: `1px solid ${c.pop}66` }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: c.pop }}>
              Bill To
            </div>
            <div className="text-sm font-bold break-words" data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {customerEmail && (
              <div className="text-xs text-teal-200/80 mt-1 break-all">{customerEmail}</div>
            )}
            {customerPhone && (
              <div className="text-xs text-teal-200/80 mt-0.5 break-words">{customerPhone}</div>
            )}
            {customerAddress && (
              <div
                className="text-xs text-teal-200/80 mt-1 whitespace-pre-wrap break-words"
                data-testid="preview-customer-address"
              >
                {customerAddress}
              </div>
            )}
          </div>
        </div>

        {/* Main column */}
        <div className="flex-1 p-6 sm:p-8 space-y-6 min-w-0">
          <h3 className="text-3xl font-extrabold tracking-tight" style={{ color: c.ink }}>Invoice</h3>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium uppercase tracking-wider text-muted-foreground min-w-[500px]">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {validItems.length > 0 ? (
              validItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-t min-w-[500px] odd:bg-muted/20"
                  data-testid={`preview-item-${index}`}
                >
                  <div className="col-span-6">
                    <div className="font-medium text-sm break-words" style={{ color: c.ink }}>{item.name}</div>
                    {item.details && (
                      <div className="text-xs mt-1 break-words" style={{ color: c.muted }}>
                        {item.details}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm" style={{ color: c.ink }}>
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm" style={{ color: c.ink }}>
                    {formatCurrency(item.price)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm font-semibold" style={{ color: c.ink }}>
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">No items added yet</div>
            )}
          </div>

          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: c.muted }}>Subtotal</span>
                <span className="text-sm font-mono" style={{ color: c.ink }} data-testid="preview-subtotal">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: c.muted }}>Tax ({taxPercentage}%)</span>
                <span className="text-sm font-mono" style={{ color: c.ink }} data-testid="preview-tax">
                  {formatCurrency(tax)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: c.muted }}>Discount</span>
                  <span className="text-sm font-mono" style={{ color: c.ink }} data-testid="preview-discount">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center rounded-lg px-4 py-3 mt-3" style={{ backgroundColor: c.sidebar }}>
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: c.pop }}>
                  Total Due
                </span>
                <span className="text-xl font-mono font-bold text-white" data-testid="preview-total">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
              <div className="pt-1">
                <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: c.muted }}>
                  Invoice total in words
                </div>
                <div className="text-sm capitalize" style={{ color: c.ink }} data-testid="preview-total-words">
                  {amountToWords(grandTotal, currency)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            Thank you for your business!
          </div>
        </div>
      </div>
    </Card>
  );
}
