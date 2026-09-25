import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type FormValues } from "@/types/invoice";

interface CompanyInfoSectionProps {
  values: FormValues;
  logoPreview: string;
  updateField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
  handleLogoUrlChange: (url: string) => void;
  handleLogoFileChange: (file: File | null) => void;
}

export function CompanyInfoSection({
  values,
  logoPreview,
  updateField,
  handleLogoUrlChange,
  handleLogoFileChange,
}: CompanyInfoSectionProps) {
  return (
    <AccordionItem
      value="company"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <h2 className="text-xl font-semibold text-left">Company Information</h2>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              Company Name *
            </Label>
            <Input
              id="companyName"
              data-testid="input-company-name"
              placeholder="Enter your company name"
              value={values.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLogo" className="text-sm font-medium">
              Company Logo
            </Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  id="companyLogo"
                  data-testid="input-company-logo"
                  placeholder="https://example.com/logo.png"
                  value={logoPreview.startsWith("data:") ? "" : logoPreview}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  className="h-12"
                />
                <div className="flex items-center gap-2">
                  <Input
                    id="companyLogoFile"
                    type="file"
                    accept="image/*"
                    data-testid="input-company-logo-file"
                    onChange={(e) => handleLogoFileChange(e.target.files?.[0] ?? null)}
                    className="h-10 text-xs file:text-xs file:font-medium"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a logo URL, or upload an image file directly.
                </p>
              </div>
              {logoPreview && (
                <div className="w-16 h-16 border border-border rounded-md overflow-hidden flex items-center justify-center bg-card shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="text-sm font-medium">
              Address
            </Label>
            <Textarea
              id="companyAddress"
              data-testid="input-company-address"
              placeholder="Enter your company address"
              value={values.companyAddress}
              onChange={(e) => updateField("companyAddress", e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
