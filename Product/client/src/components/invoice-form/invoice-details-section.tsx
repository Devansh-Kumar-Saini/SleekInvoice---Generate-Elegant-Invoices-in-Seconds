import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
              id="category"
              data-testid="select-category"
              value={values.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="h-12"
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  data-testid={`option-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency *
            </Label>
            <Select
              id="currency"
              data-testid="select-currency"
              value={values.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              className="h-12"
            >
              {currencies.map((curr) => (
                <option
                  key={curr.code}
                  value={curr.code}
                  data-testid={`option-currency-${curr.code.toLowerCase()}`}
                >
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="template" className="text-sm font-medium">
              PDF Template
            </Label>
            <Select
              id="template"
              data-testid="select-template"
              value={values.template}
              onChange={(e) => updateField("template", e.target.value as InvoiceTemplate)}
              className="h-12"
            >
              {INVOICE_TEMPLATES.map((tpl) => (
                <option
                  key={tpl.id}
                  value={tpl.id}
                  data-testid={`option-template-${tpl.id}`}
                >
                  {tpl.label} — {tpl.description}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
