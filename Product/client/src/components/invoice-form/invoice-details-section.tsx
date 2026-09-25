import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { INVOICE_TEMPLATES, type InvoiceTemplate } from "@/lib/pdf-templates";
import { categories, currencies, type FormValues } from "@/types/invoice";

interface InvoiceDetailsSectionProps {
  values: FormValues;
  invoiceNumber: string;
  setInvoiceNumber: (num: string) => void;
  updateField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
}

export function InvoiceDetailsSection({
  values,
  invoiceNumber,
  setInvoiceNumber,
  updateField,
}: InvoiceDetailsSectionProps) {
  return (
    <AccordionItem
      value="invoice"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <h2 className="text-xl font-semibold text-left">Invoice Details</h2>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber" className="text-sm font-medium">
              Invoice Number
            </Label>
            <Input
              id="invoiceNumber"
              data-testid="input-invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="h-12 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date *
            </Label>
            <Input
              id="date"
              data-testid="input-date"
              type="date"
              value={values.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={values.category}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger id="category" data-testid="select-category" className="h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    data-testid={`option-category-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency *
            </Label>
            <Select
              value={values.currency}
              onValueChange={(value) => updateField("currency", value)}
            >
              <SelectTrigger id="currency" data-testid="select-currency" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem
                    key={curr.code}
                    value={curr.code}
                    data-testid={`option-currency-${curr.code.toLowerCase()}`}
                  >
                    {curr.symbol} {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="template" className="text-sm font-medium">
              PDF Template
            </Label>
            <Select
              value={values.template}
              onValueChange={(value) => updateField("template", value as InvoiceTemplate)}
            >
              <SelectTrigger id="template" data-testid="select-template" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_TEMPLATES.map((tpl) => (
                  <SelectItem
                    key={tpl.id}
                    value={tpl.id}
                    data-testid={`option-template-${tpl.id}`}
                  >
                    {tpl.label} — {tpl.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
