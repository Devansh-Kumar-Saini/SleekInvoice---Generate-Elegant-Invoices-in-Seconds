import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type FormValues } from "@/types/invoice";

interface CustomerInfoSectionProps {
  values: FormValues;
  updateField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
}

export function CustomerInfoSection({ values, updateField }: CustomerInfoSectionProps) {
  return (
    <AccordionItem
      value="customer"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <h2 className="text-xl font-semibold text-left">Customer Information</h2>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium">
              Customer Name *
            </Label>
            <Input
              id="customerName"
              data-testid="input-customer-name"
              placeholder="Enter customer name"
              value={values.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="customerEmail"
                data-testid="input-customer-email"
                type="email"
                placeholder="customer@example.com"
                value={values.customerEmail}
                onChange={(e) => updateField("customerEmail", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="customerPhone"
                data-testid="input-customer-phone"
                placeholder="+1 (555) 123-4567"
                value={values.customerPhone}
                onChange={(e) => updateField("customerPhone", e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress" className="text-sm font-medium">
              Address
            </Label>
            <Textarea
              id="customerAddress"
              data-testid="input-customer-address"
              placeholder="Enter customer address"
              value={values.customerAddress}
              onChange={(e) => updateField("customerAddress", e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
