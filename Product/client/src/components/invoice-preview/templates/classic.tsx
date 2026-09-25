import { Card } from "@/components/ui/card";
import { FileText, Mail, Phone, Home } from "lucide-react";
import { amountToWords } from "@/lib/invoice-format";
import { SharedProps, colorsFor, formatDate } from "../types";

export function ClassicPreview({
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
  invoiceTheme,
}: SharedProps) {
  const isDark = invoiceTheme === "dark";
  const c = colorsFor("classic", customColors, ["primary", "dark", "muted", "border", "headerFill"], isDark);
  return (
    <Card
      className={`p-8 shadow-sm w-full max-w-4xl mx-auto ${isDark ? "bg-[#18181a]" : "bg-white"}`}
      data-testid="invoice-preview"
    >
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
              <div
                className={`w-16 h-16 rounded-lg flex items-center justify-center mb-3 ${
                  isDark ? "bg-white/10" : "bg-muted"
                }`}
              >
                <FileText className="w-8 h-8" style={{ color: c.muted }} />
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
              <div className="py-8 text-center text-sm" style={{ color: c.muted }}>
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
        <div className="pt-6" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="text-xs text-center" style={{ color: c.muted }}>
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
// black/white with the invoice's own "Invoice Theme" setting (Customize
// Invoice section) — independent of the app's own UI theme — defaulting to light.
// ---------------------------------------------------------------------------
