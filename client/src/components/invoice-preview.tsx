import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { type InvoiceItem } from "@/types/invoice";

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
    return `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
    <Card className="p-8 bg-background shadow-sm w-full max-w-4xl" data-testid="invoice-preview">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div>
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
            <h3 className="text-3xl font-bold text-foreground" data-testid="preview-company-name">
              {companyName || "Company Name"}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium uppercase tracking-wider text-primary mb-1">
              Invoice
            </div>
            <div className="text-sm text-foreground" data-testid="preview-date">
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
