import { Card } from "@/components/ui/card";
import { FileText, Mail, Phone, Home } from "lucide-react";
import { amountToWords } from "@/lib/invoice-format";
import { SharedProps, colorsFor, formatDate } from "../types";

export function ModernPreview({
  companyName,
  companyLogo,
  logoSize = "medium",
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
  const validItems = items.filter((item) => item.name);
  const isDark = invoiceTheme === "dark";
  const c = colorsFor("modern", customColors, ["accent", "pop", "ink", "muted"], isDark);

  const logoHeightClass =
    logoSize === "small" ? "max-h-6" : logoSize === "large" ? "max-h-14" : "max-h-8";

  return (
    <Card
      className={`p-0 shadow-sm w-full max-w-4xl mx-auto overflow-hidden ${isDark ? "bg-[#18181a]" : "bg-white"}`}
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
                  className={`${logoHeightClass} w-auto object-contain`}
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
          <div
            className={`rounded-lg p-3 min-w-0 ${isDark ? "bg-white/5" : "bg-muted"}`}
          >
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
          <div
            className={`rounded-lg p-3 min-w-0 ${isDark ? "bg-white/5" : "bg-muted"}`}
          >
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
          <div
            className={`rounded-lg p-3 min-w-0 ${isDark ? "bg-white/5" : "bg-muted"}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: c.muted }}>
              Category
            </div>
            <div className="text-sm font-bold break-words" style={{ color: c.ink }} data-testid="preview-category">
              {category || "General"}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg overflow-hidden border overflow-x-auto min-w-[500px]" style={{ borderColor: isDark ? "#3a3a3e" : undefined }}>
          <table className="w-full border-collapse">
            <thead>
              <tr
                className="text-white text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: c.accent }}
              >
                <th className="px-4 py-3 text-left font-bold">Item</th>
                <th className="px-4 py-3 text-right font-bold whitespace-nowrap min-w-[60px]">Qty</th>
                <th className="px-4 py-3 text-right font-bold whitespace-nowrap min-w-[100px]">Price</th>
                <th className="px-4 py-3 text-right font-bold whitespace-nowrap min-w-[100px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {validItems.length > 0 ? (
                validItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      isDark ? "odd:bg-white/5" : "odd:bg-muted/40"
                    }`}
                    style={{ borderColor: isDark ? "#3a3a3e" : undefined }}
                    data-testid={`preview-item-${index}`}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-bold text-sm break-words" style={{ color: c.ink }}>{item.name}</div>
                      {item.details && (
                        <div className="text-xs mt-0.5 break-words" style={{ color: c.muted }}>
                          {item.details}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm align-top whitespace-nowrap" style={{ color: c.ink }}>{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm align-top whitespace-nowrap" style={{ color: c.ink }}>
                      {formatCurrency(Number(item.price) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold align-top whitespace-nowrap" style={{ color: c.ink }}>
                      {formatCurrency((Number(item.quantity) || 0) * (Number(item.price) || 0))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm" style={{ color: c.muted }}>No items added yet</td>
                </tr>
              )}
            </tbody>
          </table>
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
        <div
          className="pt-4 border-t flex justify-between text-xs"
          style={{ borderColor: isDark ? "#3a3a3e" : undefined, color: c.muted }}
        >
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
