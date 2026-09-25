import { Card } from "@/components/ui/card";
import { FileText, Mail, Phone, Home } from "lucide-react";
import { amountToWords } from "@/lib/invoice-format";
import { SharedProps, formatDateSlash } from "../types";

export function CleanPreview({
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
  invoiceTheme,
}: SharedProps) {
  const validItems = items.filter((item) => item.name);
  const isDark = invoiceTheme === "dark";
  const muted = isDark ? "text-white/60" : "text-muted-foreground";
  const border = isDark ? "border-white/15" : "border-border";

  return (
    <Card
      className={`p-8 sm:p-10 shadow-sm w-full max-w-4xl mx-auto ${border} ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
      data-testid="invoice-preview"
    >
      <div className="space-y-8">
        {/* Giant, thin-weight title */}
        <div className={`pb-6 border-b ${border}`}>
          <h1
            className="text-3xl sm:text-4xl font-light tracking-tight break-words"
            data-testid="preview-company-name"
          >
            Invoice {invoiceNumber || ""}
          </h1>
        </div>

        {/* Metadata label/value grid */}
        <div className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm max-w-md">
          <span className={muted}>Serial Number</span>
          <span data-testid="preview-invoice-number">
            {(invoiceNumber || "").replace(/^INV-?/i, "") || invoiceNumber || "—"}
          </span>
          <span className={muted}>Date</span>
          <span data-testid="preview-date">{date ? formatDateSlash(date) : "—"}</span>
          <span className={muted}>Currency</span>
          <span>{currency}</span>
        </div>

        {/* Billed By / Billed To with a vertical divider */}
        <div className={`grid grid-cols-2 gap-6 pb-6 border-b ${border} relative`}>
          <div className={`sm:border-r ${border} pr-6 min-w-0`}>
            <div className={`text-xs ${muted} mb-2`}>Billed By</div>
            <div className="text-base font-semibold break-words" data-testid="preview-company-billed-by">
              {companyName || "Company Name"}
            </div>
            {companyAddress && (
              <div
                className={`text-xs ${muted} mt-1 whitespace-pre-wrap break-words`}
                data-testid="preview-company-address"
              >
                {companyAddress}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className={`text-xs ${muted} mb-2`}>Billed To</div>
            <div className="text-base font-semibold break-words" data-testid="preview-customer-name">
              {customerName || "Customer Name"}
            </div>
            {(customerEmail || customerPhone) && (
              <div className={`text-xs ${muted} mt-1 break-words`}>
                {[customerEmail, customerPhone].filter(Boolean).join("  •  ")}
              </div>
            )}
            {customerAddress && (
              <div
                className={`text-xs ${muted} mt-1 whitespace-pre-wrap break-words`}
                data-testid="preview-customer-address"
              >
                {customerAddress}
              </div>
            )}
          </div>
        </div>

        {/* Items — no borders/fills on header, just a rule; monospaced numbers */}
        <div>
          <div className={`grid grid-cols-12 gap-4 pb-2 border-b ${border} text-sm ${muted} min-w-[600px]`}>
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
                    <div className={`text-xs ${muted} mt-0.5 break-words`}>
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
            <div className={`py-8 text-center text-sm ${muted}`}>No items added yet</div>
          )}
          <div className={`border-b ${border}`} />
        </div>

        {/* Large sparse gap, matching the reference's minimal layout */}
        <div className="hidden sm:block h-24" />

        {/* Calculations */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${muted}`}>Subtotal</span>
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
                  <span className={`text-xs ${muted} break-words pr-2`}>{item.name}</span>
                  <span className="text-sm font-mono whitespace-nowrap">
                    {formatCurrency(item.quantity * item.price)}
                  </span>
                </div>
              ))}
            {tax > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${muted}`}>Tax ({taxPercentage}%)</span>
                <span className="text-sm font-mono" data-testid="preview-tax">
                  {formatCurrency(tax)}
                </span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${muted}`}>Discount</span>
                <span className="text-sm font-mono" data-testid="preview-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className={`flex justify-between items-center pt-2 border-t ${border}`}>
              <span className={`text-sm ${muted}`}>Total</span>
              <span className="text-lg font-mono font-bold" data-testid="preview-total">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="pt-2">
              <div className={`text-[10px] ${muted}`}>Invoice Total (in words)</div>
              <div className="text-sm capitalize" data-testid="preview-total-words">
                {amountToWords(grandTotal, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-6 border-t ${border} flex justify-between text-[10px] ${muted} uppercase tracking-widest`}>
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
