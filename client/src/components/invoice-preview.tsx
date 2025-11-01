import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { type InvoiceItem } from "@shared/schema";

interface InvoicePreviewProps {
  companyName: string;
  companyLogo?: string;
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

export function InvoicePreview({
  companyName,
  companyLogo,
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
}: InvoicePreviewProps) {
  const currencySymbol = currencies[currency] || "$";

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="p-6 bg-card shadow-lg w-full" data-testid="invoice-preview">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="max-h-12 w-auto object-contain mb-2"
                data-testid="preview-company-logo"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <h3 className="text-2xl font-bold text-foreground" data-testid="preview-company-name">
              {companyName || "Company Name"}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Invoice
            </div>
            <div className="text-sm text-foreground" data-testid="preview-date">
              {date ? formatDate(date) : "Date"}
            </div>
            {category && (
              <div className="text-xs text-muted-foreground mt-1" data-testid="preview-category">
                {category}
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Bill To
          </div>
          <div className="text-foreground">
            <div className="font-semibold mb-1" data-testid="preview-customer-name">
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
              <div className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" data-testid="preview-customer-address">
                {customerAddress}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <div className="border-t border-b border-border overflow-x-auto">
            <div className="grid grid-cols-12 gap-3 py-3 text-sm font-medium uppercase tracking-wide text-muted-foreground min-w-[500px]">
              <div className="col-span-4">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {items.length > 0 && items.some((item) => item.name) ? (
              items
                .filter((item) => item.name)
                .map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 py-3 border-t border-border min-w-[500px]"
                    data-testid={`preview-item-${index}`}
                  >
                    <div className="col-span-4">
                      <div className="font-medium text-foreground break-words">{item.name}</div>
                      {item.details && (
                        <div className="text-xs text-muted-foreground mt-1 break-words">
                          {item.details}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-right font-mono text-foreground whitespace-nowrap">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 text-right font-mono text-foreground whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="col-span-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-mono font-semibold text-foreground" data-testid="preview-subtotal">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Tax ({taxPercentage}%)
            </span>
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
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-mono font-bold text-primary" data-testid="preview-total">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            This is a preview of your invoice
          </div>
        </div>
      </div>
    </Card>
  );
}
