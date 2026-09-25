import { Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  INVOICE_TEMPLATES,
  TEMPLATE_COLOR_SLOTS,
  normalizeHex,
  type InvoiceTemplate,
  type ColorizableTemplate,
} from "@/lib/pdf-templates";
import { type FormValues } from "@/types/invoice";

function isColorizable(template: InvoiceTemplate): template is ColorizableTemplate {
  return template !== "clean";
}

interface CustomizeSectionProps {
  values: FormValues;
  updateField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
  setTemplateColor: (template: ColorizableTemplate, slotKey: string, value: string) => void;
  resetTemplateColors: (template: ColorizableTemplate) => void;
}

export function CustomizeSection({
  values,
  updateField,
  setTemplateColor,
  resetTemplateColors,
}: CustomizeSectionProps) {
  return (
    <AccordionItem
      value="customize"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <div className="flex items-center gap-2 text-left">
          <Palette className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Customize Invoice</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-6">
          {/* Invoice theme — independent of the app's own light/dark UI toggle */}
          <div className="space-y-2 pb-6 border-b border-border">
            <Label htmlFor="invoiceTheme" className="text-sm font-medium">
              Invoice Theme
            </Label>
            <Select
              value={values.invoiceTheme}
              onValueChange={(value) => updateField("invoiceTheme", value as "light" | "dark")}
            >
              <SelectTrigger id="invoiceTheme" data-testid="select-invoice-theme" className="h-12 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light" data-testid="option-invoice-theme-light">
                  Light
                </SelectItem>
                <SelectItem value="dark" data-testid="option-invoice-theme-dark">
                  Dark
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sets the background and text color of this invoice — applies to every template, in both the
              preview and the downloaded PDF. Independent of your app's own light/dark mode above — defaults
              to Light regardless.
            </p>
          </div>

          {isColorizable(values.template) ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Colors for the{" "}
                  <span className="font-medium text-foreground">
                    {INVOICE_TEMPLATES.find((t) => t.id === values.template)?.label}
                  </span>{" "}
                  template. Each template remembers its own colors, so switching templates won't lose these.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => resetTemplateColors(values.template as ColorizableTemplate)}
                  data-testid="button-reset-colors"
                  className="shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Reset to default
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TEMPLATE_COLOR_SLOTS[values.template].map((slot) => {
                  const current =
                    values.customColors[values.template as ColorizableTemplate]?.[slot.key] ??
                    slot.default;
                  return (
                    <div key={slot.key} className="space-y-2">
                      <Label htmlFor={`color-${values.template}-${slot.key}`} className="text-sm font-medium">
                        {slot.label}
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          id={`color-${values.template}-${slot.key}`}
                          type="color"
                          value={normalizeHex(current) ?? slot.default}
                          onChange={(e) =>
                            setTemplateColor(values.template as ColorizableTemplate, slot.key, e.target.value)
                          }
                          data-testid={`input-color-${values.template}-${slot.key}`}
                          className="h-12 w-16 shrink-0 rounded-md border border-input cursor-pointer bg-background p-1"
                          aria-label={`${slot.label} color`}
                        />
                        <Input
                          value={current}
                          onChange={(e) =>
                            setTemplateColor(values.template as ColorizableTemplate, slot.key, e.target.value)
                          }
                          data-testid={`input-color-hex-${values.template}-${slot.key}`}
                          className="h-12 font-mono uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              The Clean template doesn't have customizable accent colors — its palette is just the Invoice
              Theme above (Light or Dark). Pick a different PDF Template to customize accent colors too.
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
