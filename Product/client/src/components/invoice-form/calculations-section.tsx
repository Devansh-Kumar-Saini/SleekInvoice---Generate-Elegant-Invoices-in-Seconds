import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type FormValues, type CurrencyOption } from "@/types/invoice";

interface CalculationsSectionProps {
  values: FormValues;
  subtotal: number;
  taxPercentage: number;
  tax: number;
  discount: number;
  grandTotal: number;
  selectedCurrency?: CurrencyOption;
  formatCurrency: (amount: number) => string;
  updateField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
}

export function CalculationsSection({
  values,
  subtotal,
  taxPercentage,
  tax,
  discount,
  grandTotal,
  selectedCurrency,
  formatCurrency,
  updateField,
}: CalculationsSectionProps) {
  const { discountType } = values;

  return (
    <AccordionItem
      value="calculations"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <h2 className="text-xl font-semibold text-left">Calculations</h2>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="taxPercentage" className="text-sm font-medium">
                Tax Percentage (%)
              </Label>
              <Input
                id="taxPercentage"
                data-testid="input-tax-percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={values.taxPercentage}
                onChange={(e) =>
                  updateField("taxPercentage", e.target.value === "" ? 0 : Number(e.target.value))
                }
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountType" className="text-sm font-medium">
                Discount Type
              </Label>
              <Select
                value={values.discountType}
                onValueChange={(value) => updateField("discountType", value as any)}
              >
                <SelectTrigger id="discountType" data-testid="select-discount-type" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Discount</SelectItem>
                  <SelectItem value="flat">Flat Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {discountType !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="discountValue" className="text-sm font-medium">
                Discount Value {discountType === "percentage" ? "(%)" : `(${selectedCurrency?.symbol})`}
              </Label>
              <Input
                id="discountValue"
                data-testid="input-discount-value"
                type="number"
                min="0"
                step="0.01"
                value={values.discountValue}
                onChange={(e) =>
                  updateField("discountValue", e.target.value === "" ? 0 : Number(e.target.value))
                }
                className="h-12"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              data-testid="input-notes"
              placeholder="Payment terms, thank-you message, etc."
              value={values.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>

          {/* Totals Display */}
          <div className="border-t border-border pt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Subtotal</span>
              <span className="text-base font-mono font-semibold" data-testid="text-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Tax ({taxPercentage}%)</span>
              <span className="text-base font-mono font-semibold" data-testid="text-tax">
                {formatCurrency(tax)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Discount</span>
                <span
                  className="text-base font-mono font-semibold text-destructive"
                  data-testid="text-discount"
                >
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-lg font-semibold text-foreground">Grand Total</span>
              <span
                className="text-2xl font-mono font-bold text-primary"
                data-testid="text-grand-total"
              >
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
