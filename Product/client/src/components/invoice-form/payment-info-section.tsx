import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type FormValues, type PaymentImageType } from "@/types/invoice";
import { Building2, QrCode, FileCheck, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";

interface PaymentInfoSectionProps {
  values: FormValues;
  paymentImagePreview: string;
  updateField: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
  handlePaymentImageUrlChange: (url: string) => void;
  handlePaymentImageFileChange: (file: File | null) => void;
  handleRemovePaymentImage: () => void;
}

const TERM_PRESETS = [
  { label: "Due on Receipt", text: "Payment is due upon receipt of invoice." },
  { label: "Net 15", text: "Payment is due within 15 days of invoice date." },
  { label: "Net 30", text: "Payment is due within 30 days of invoice date." },
  { label: "Net 60", text: "Payment is due within 60 days of invoice date." },
];

export function PaymentInfoSection({
  values,
  paymentImagePreview,
  updateField,
  handlePaymentImageUrlChange,
  handlePaymentImageFileChange,
  handleRemovePaymentImage,
}: PaymentInfoSectionProps) {
  const isConfigured = Boolean(
    values.bankName ||
    values.accountName ||
    values.accountNumber ||
    values.routingCode ||
    values.upiId ||
    values.paymentTerms ||
    paymentImagePreview ||
    values.paymentNotes
  );

  const handleTypeChange = (type: PaymentImageType) => {
    updateField("paymentImageType", type);
    // If the label is currently empty or matches a default, update it intuitively
    if (!values.paymentImageLabel || values.paymentImageLabel === "Scan to Pay" || values.paymentImageLabel === "Cancelled Cheque" || values.paymentImageLabel === "Payment QR Code") {
      if (type === "qr") updateField("paymentImageLabel", "Scan to Pay");
      else if (type === "cheque") updateField("paymentImageLabel", "Cancelled Cheque");
      else updateField("paymentImageLabel", "Payment Document");
    }
  };

  return (
    <AccordionItem
      value="payment"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-left">Payment Information</h2>
          {isConfigured && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Configured
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-8">
          {/* Sub-section 1: Bank & Transfer Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                Bank &amp; Account Details
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide your direct bank transfer, wire, or digital payment credentials.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-medium">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  data-testid="input-bank-name"
                  placeholder="e.g. JPMorgan Chase, HDFC Bank, Barclays"
                  value={values.bankName}
                  onChange={(e) => updateField("bankName", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-sm font-medium">
                  Account Holder / Beneficiary Name
                </Label>
                <Input
                  id="accountName"
                  data-testid="input-account-name"
                  placeholder="e.g. Acme Corp / John Doe"
                  value={values.accountName}
                  onChange={(e) => updateField("accountName", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium">
                  Account Number / IBAN
                </Label>
                <Input
                  id="accountNumber"
                  data-testid="input-account-number"
                  placeholder="e.g. 1234567890 or GB29 NWBK..."
                  value={values.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value)}
                  className="h-11 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingCode" className="text-sm font-medium">
                  IFSC / SWIFT / Routing Code
                </Label>
                <Input
                  id="routingCode"
                  data-testid="input-routing-code"
                  placeholder="e.g. IFSC, SWIFT/BIC, or Routing #"
                  value={values.routingCode}
                  onChange={(e) => updateField("routingCode", e.target.value)}
                  className="h-11 font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiId" className="text-sm font-medium">
                UPI ID / Payment Link / VPA (optional)
              </Label>
              <Input
                id="upiId"
                data-testid="input-upi-id"
                placeholder="e.g. company@upi, paypal.me/acme, or payment url"
                value={values.upiId}
                onChange={(e) => updateField("upiId", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes" className="text-sm font-medium">
                Payment Instructions / Notes (optional)
              </Label>
              <Textarea
                id="paymentNotes"
                data-testid="input-payment-notes"
                placeholder="e.g. Please quote invoice number in the transfer reference. Wire transfer fees borne by payer."
                value={values.paymentNotes}
                onChange={(e) => updateField("paymentNotes", e.target.value)}
                className="min-h-16 resize-none"
              />
            </div>
          </div>

          {/* Sub-section 2: Terms & Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                Payment Terms &amp; Conditions
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Define expected payment windows, penalties, or compliance policies.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 self-center mr-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick fill:
              </span>
              {TERM_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 bg-muted/30 hover:bg-muted"
                  onClick={() => updateField("paymentTerms", preset.text)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms" className="text-sm font-medium">
                Terms Clause
              </Label>
              <Textarea
                id="paymentTerms"
                data-testid="input-payment-terms"
                placeholder="e.g. Payment due within 30 days of invoice date. 1.5% interest fee per month on overdue balances."
                value={values.paymentTerms}
                onChange={(e) => updateField("paymentTerms", e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>
          </div>

          {/* Sub-section 3: Payment Image (QR Code / Cancelled Cheque) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <QrCode className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                Payment Image (QR Code or Cancelled Cheque)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a QR code for instant scanning or a cancelled cheque image for verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentImageType" className="text-sm font-medium">
                  Image Type
                </Label>
                <Select
                  id="paymentImageType"
                  data-testid="select-payment-image-type"
                  value={values.paymentImageType || "qr"}
                  onChange={(e) => handleTypeChange(e.target.value as PaymentImageType)}
                  className="h-11"
                >
                  <option value="qr">Payment QR Code (UPI / Bank / PayPal)</option>
                  <option value="cheque">Cancelled Cheque (Bank Verification)</option>
                  <option value="other">Other Payment Document / Proof</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentImageLabel" className="text-sm font-medium">
                  Image Label / Caption
                </Label>
                <Input
                  id="paymentImageLabel"
                  data-testid="input-payment-image-label"
                  placeholder={
                    values.paymentImageType === "cheque"
                      ? "e.g. Cancelled Cheque"
                      : "e.g. Scan to Pay via UPI"
                  }
                  value={values.paymentImageLabel}
                  onChange={(e) => updateField("paymentImageLabel", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full space-y-2">
                  <Label htmlFor="paymentImageUrl" className="text-sm font-medium">
                    Image URL or File Upload
                  </Label>
                  <Input
                    id="paymentImageUrl"
                    data-testid="input-payment-image-url"
                    placeholder="https://example.com/qr-code.png"
                    value={paymentImagePreview.startsWith("data:") ? "" : paymentImagePreview}
                    onChange={(e) => handlePaymentImageUrlChange(e.target.value)}
                    className="h-11"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      id="paymentImageFile"
                      type="file"
                      accept="image/*"
                      data-testid="input-payment-image-file"
                      onChange={(e) => handlePaymentImageFileChange(e.target.files?.[0] ?? null)}
                      className="h-10 text-xs file:text-xs file:font-medium"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload PNG, JPG, WebP, or SVG format, or paste an image URL.
                  </p>
                </div>

                {paymentImagePreview && (
                  <div className="w-full sm:w-auto p-3 border border-border rounded-lg bg-muted/20 flex flex-col items-center justify-center shrink-0">
                    <div className="w-28 h-28 border border-border rounded bg-card flex items-center justify-center overflow-hidden">
                      <img
                        src={paymentImagePreview}
                        alt="Payment preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground mt-2 max-w-28 text-center truncate">
                      {values.paymentImageLabel || (values.paymentImageType === "cheque" ? "Cancelled Cheque" : "QR Code")}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePaymentImage}
                      className="h-7 text-xs text-destructive hover:text-destructive flex items-center gap-1 mt-1 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
