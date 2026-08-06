import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { type InvoiceItem } from "@/types/invoice";
import { type InvoiceTemplate } from "@/lib/pdf-generator";

interface InvoicePreviewProps {
  template?: InvoiceTemplate;
  companyName: string;
  companyLogo?: string;
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

export function InvoicePreview(props: InvoicePreviewProps) {
  const currencySymbol = currencies[props.currency] || "$";
  const formatCurrency = (amount: number) =>
    `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const shared = { ...props, formatCurrency };

  switch (props.template) {
    case "clean":
      return <CleanPreview {...shared} />;
    case "modern":
      return <ModernPreview {...shared} />;
    case "classic":
    default:
      return <ClassicPreview {...shared} />;
  }
}

interface SharedProps extends InvoicePreviewProps {
  formatCurrency: (amount: number) => string;
}

// ---------------------------------------------------------------------------
// Classic — the original InvoiceForge design.
// ---------------------------------------------------------------------------
function ClassicPreview({
  companyName,
  companyLogo,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  category,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
}: SharedProps) {
  return (
    <Card className="p-8 bg-background shadow-sm w-full max-w-4xl" data-testid="invoice-preview">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b pb-6">
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
              className="text-2xl sm:text-3xl font-bold text-foreground break-words"
              data-testid="preview-company-name"
            >
              {companyName || "Company Name"}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-medium uppercase tracking-wider text-primary mb-1">
              Invoice
            </div>
            {invoiceNumber && (
              <div
                className="text-xs sm:text-sm font-mono text-foreground whitespace-nowrap"
                data-testid="preview-invoice-number"
              >
                {invoiceNumber}
              </div>
            )}
            <div className="text-sm text-muted-foreground whitespace-nowrap" data-testid="preview-date">
              {date ? formatDate(date) : "Date"}
            </div>
            {category && (
              <div className="text-xs text-muted-foreground mt-2" data-testid="preview-category">
                {category}
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-b pb-6">
          <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Bill To
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-foreground" data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {customerEmail && (
              <div className="text-sm text-muted-foreground" data-testid="preview-customer-email">
                {customerEmail}
              </div>
            )}
            {customerPhone && (
              <div className="text-sm text-muted-foreground" data-testid="preview-customer-phone">
                {customerPhone}
              </div>
            )}
            {customerAddress && (
              <div
                className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap"
                data-testid="preview-customer-address"
              >
                {customerAddress}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium uppercase tracking-wider text-muted-foreground min-w-[600px]">
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
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-t min-w-[600px] hover:bg-muted/10"
                    data-testid={`preview-item-${index}`}
                  >
                    <div className="col-span-6">
                      <div className="font-medium text-foreground break-words">{item.name}</div>
                      {item.details && (
                        <div className="text-xs text-muted-foreground mt-1 break-words">
                          {item.details}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-right font-mono text-foreground">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right font-mono text-foreground">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="col-span-2 text-right font-mono font-semibold text-foreground">
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
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-mono font-semibold text-foreground" data-testid="preview-subtotal">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tax ({taxPercentage}%)</span>
            <span className="font-mono font-semibold text-foreground" data-testid="preview-tax">
              {formatCurrency(tax)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Discount</span>
              <span className="font-mono font-semibold text-destructive" data-testid="preview-discount">
                -{formatCurrency(discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-lg font-semibold text-foreground">Total Due</span>
            <span className="text-2xl font-mono font-bold text-primary" data-testid="preview-total">
              {formatCurrency(grandTotal)}
            </span>
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
// Clean — Vercel-inspired. Pure monochrome, hairline rules, no fills/boxes,
// uppercase micro-labels, generous whitespace.
// ---------------------------------------------------------------------------
function CleanPreview({
  companyName,
  companyLogo,
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  category,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);

  return (
    <Card
      className="p-8 sm:p-10 bg-background shadow-sm w-full max-w-4xl border-border"
      data-testid="invoice-preview"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-border">
          <div className="min-w-0">
            {companyLogo && (
              <img
                src={companyLogo}
                alt={companyName}
                className="max-h-10 w-auto object-contain mb-3"
                data-testid="preview-company-logo"
              />
            )}
            <h3
              className="text-lg sm:text-xl font-bold text-foreground break-words"
              data-testid="preview-company-name"
            >
              {companyName || "Company Name"}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
              Invoice
            </div>
            {invoiceNumber && (
              <div
                className="text-sm font-bold text-foreground whitespace-nowrap"
                data-testid="preview-invoice-number"
              >
                {invoiceNumber}
              </div>
            )}
            <div className="text-xs text-muted-foreground whitespace-nowrap mt-1" data-testid="preview-date">
              {date ? formatDate(date) : "Date"}
            </div>
            {category && (
              <div className="text-xs text-muted-foreground" data-testid="preview-category">
                {category}
              </div>
            )}
          </div>
        </div>

        {/* Billed to / date columns */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Billed To
            </div>
            <div className="text-sm font-bold text-foreground" data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {customerEmail && (
              <div className="text-xs text-muted-foreground mt-1" data-testid="preview-customer-email">
                {customerEmail}
              </div>
            )}
            {customerPhone && (
              <div className="text-xs text-muted-foreground" data-testid="preview-customer-phone">
                {customerPhone}
              </div>
            )}
            {customerAddress && (
              <div
                className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap"
                data-testid="preview-customer-address"
              >
                {customerAddress}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Invoice Date
            </div>
            <div className="text-sm text-foreground">{date ? formatDate(date) : "—"}</div>
          </div>
        </div>

        {/* Items — no borders/fills, just header rule + row rules */}
        <div>
          <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-foreground text-[10px] font-medium uppercase tracking-widest text-muted-foreground min-w-[600px]">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {validItems.length > 0 ? (
            validItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 py-3 border-b border-border min-w-[600px]"
                data-testid={`preview-item-${index}`}
              >
                <div className="col-span-6">
                  <div className="font-bold text-sm text-foreground break-words">{item.name}</div>
                  {item.details && (
                    <div className="text-xs text-muted-foreground mt-0.5 break-words">
                      {item.details}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm text-foreground">{item.quantity}</div>
                <div className="col-span-2 text-right text-sm text-foreground">
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-2 text-right text-sm font-bold text-foreground">
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
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-sm text-foreground" data-testid="preview-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Tax ({taxPercentage}%)</span>
              <span className="text-sm text-foreground" data-testid="preview-tax">
                {formatCurrency(tax)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Discount</span>
                <span className="text-sm text-foreground" data-testid="preview-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t-2 border-foreground">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground" data-testid="preview-total">
                {formatCurrency(grandTotal)}
              </span>
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
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  category,
  items,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  formatCurrency,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);

  return (
    <Card
      className="p-0 bg-background shadow-sm w-full max-w-4xl overflow-hidden"
      data-testid="invoice-preview"
    >
      {/* Banner header */}
      <div className="bg-zinc-900 dark:bg-black px-8 py-8">
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
            <div className="text-3xl font-extrabold text-primary tracking-tight">INVOICE</div>
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
        {/* Bill To / Category chips */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
              Billed To
            </div>
            <div className="text-sm font-bold text-foreground" data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
              Category
            </div>
            <div className="text-sm font-bold text-foreground" data-testid="preview-category">
              {category || "General"}
            </div>
          </div>
        </div>

        {(customerEmail || customerPhone || customerAddress) && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            {(customerEmail || customerPhone) && (
              <div className="flex gap-3">
                {customerEmail && <span data-testid="preview-customer-email">{customerEmail}</span>}
                {customerPhone && <span data-testid="preview-customer-phone">{customerPhone}</span>}
              </div>
            )}
            {customerAddress && (
              <div className="whitespace-pre-wrap" data-testid="preview-customer-address">
                {customerAddress}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-900 dark:bg-black text-white text-xs font-bold uppercase tracking-wide min-w-[600px]">
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
                  <div className="font-bold text-sm text-foreground break-words">{item.name}</div>
                  {item.details && (
                    <div className="text-xs text-muted-foreground mt-0.5 break-words">
                      {item.details}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm text-foreground">{item.quantity}</div>
                <div className="col-span-2 text-right text-sm text-foreground">
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-2 text-right text-sm font-bold text-foreground">
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
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm text-foreground" data-testid="preview-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tax ({taxPercentage}%)</span>
              <span className="text-sm text-foreground" data-testid="preview-tax">
                {formatCurrency(tax)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="text-sm text-foreground" data-testid="preview-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center rounded-lg bg-primary px-4 py-3 mt-3">
              <span className="text-sm font-extrabold text-primary-foreground uppercase tracking-wide">
                Total Due
              </span>
              <span className="text-xl font-extrabold text-primary-foreground" data-testid="preview-total">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
          <span>Thank you for your business!</span>
          <span className="font-bold text-primary">InvoiceForge</span>
        </div>
      </div>
    </Card>
  );
}
