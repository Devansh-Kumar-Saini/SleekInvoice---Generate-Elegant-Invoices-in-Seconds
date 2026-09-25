import { Card } from "@/components/ui/card";
import { FileText, Mail, Phone, Home } from "lucide-react";
import { amountToWords } from "@/lib/invoice-format";
import { SharedProps, colorsFor, formatDate } from "../types";

export function SidebarPreview({
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
  const validItems = items.filter((item) => item.name);
  const isDark = invoiceTheme === "dark";
  const c = colorsFor("sidebar", customColors, ["sidebar", "pop", "ink", "muted"], isDark);

  return (
    <Card
      className={`p-0 shadow-sm w-full max-w-4xl mx-auto overflow-hidden ${isDark ? "bg-[#18181a]" : "bg-white"}`}
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

          <div className="border rounded-lg overflow-hidden" style={{ borderColor: isDark ? "#3a3a3e" : undefined }}>
            <div
              className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium uppercase tracking-wider min-w-[500px] ${
                isDark ? "bg-white/5" : "bg-muted/50"
              }`}
              style={{ color: c.muted }}
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
                  className={`grid grid-cols-12 gap-4 px-4 py-3 border-t min-w-[500px] ${
                    isDark ? "odd:bg-white/5" : "odd:bg-muted/20"
                  }`}
                  style={{ borderColor: isDark ? "#3a3a3e" : undefined }}
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
              <div className="py-8 text-center text-sm" style={{ color: c.muted }}>No items added yet</div>
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

          <div
            className="pt-4 border-t text-xs"
            style={{ borderColor: isDark ? "#3a3a3e" : undefined, color: c.muted }}
          >
            Thank you for your business!
          </div>
        </div>
      </div>
    </Card>
  );
}

