import { Card } from "@/components/ui/card";
import { FileText, Mail, Phone, Home } from "lucide-react";
import { amountToWords } from "@/lib/invoice-format";
import { SharedProps, colorsFor, formatDate } from "../types";

export function ElegantPreview({
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
  const c = colorsFor("elegant", customColors, ["ink", "muted", "gold", "rule"], isDark);

  const logoHeightClass =
    logoSize === "small" ? "max-h-9" : logoSize === "large" ? "max-h-20" : "max-h-14";

  return (
    <Card
      className={`p-8 sm:p-10 shadow-sm w-full max-w-4xl mx-auto ${isDark ? "bg-[#1a1917]" : "bg-white"}`}
      data-testid="invoice-preview"
    >
      <div className="space-y-8">
        {/* Centered letterhead header */}
        <div className="flex flex-col items-center text-center">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className={`${logoHeightClass} w-auto object-contain mb-3`}
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr
                className="text-xs font-bold uppercase tracking-wide"
                style={{ borderBottom: `2px solid ${c.gold}`, color: c.gold }}
              >
                <th className="pb-2 text-left font-bold">Description</th>
                <th className="pb-2 px-4 text-right font-bold whitespace-nowrap min-w-[60px]">Qty</th>
                <th className="pb-2 px-4 text-right font-bold whitespace-nowrap min-w-[100px]">Rate</th>
                <th className="pb-2 pl-4 text-right font-bold whitespace-nowrap min-w-[100px]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {validItems.length > 0 ? (
                validItems.map((item, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: `1px solid ${c.rule}` }}
                    data-testid={`preview-item-${index}`}
                  >
                    <td className="py-3 pr-4 align-top">
                      <div className="text-sm break-words" style={{ color: c.ink }}>{item.name}</div>
                      {item.details && (
                        <div className="text-xs mt-0.5 break-words" style={{ color: c.muted }}>
                          {item.details}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-sm align-top whitespace-nowrap" style={{ color: c.ink }}>{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-sm align-top whitespace-nowrap" style={{ color: c.ink }}>
                      {formatCurrency(Number(item.price) || 0)}
                    </td>
                    <td className="py-3 pl-4 text-right text-sm align-top whitespace-nowrap" style={{ color: c.ink }}>
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
