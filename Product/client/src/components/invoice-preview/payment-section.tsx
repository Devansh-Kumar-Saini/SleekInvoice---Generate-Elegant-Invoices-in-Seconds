import { type PaymentImageType } from "@/types/invoice";

export interface PaymentPreviewBlockProps {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingCode?: string;
  upiId?: string;
  paymentTerms?: string;
  paymentNotes?: string;
  paymentImage?: string;
  paymentImageType?: PaymentImageType;
  paymentImageLabel?: string;
  notes?: string;
  variant?: "classic" | "clean" | "modern" | "elegant" | "sidebar";
  theme?: {
    primary?: string;
    dark?: string;
    muted?: string;
    border?: string;
    cardBg?: string;
  };
}

export function PaymentPreviewBlock({
  bankName,
  accountName,
  accountNumber,
  routingCode,
  upiId,
  paymentTerms,
  paymentNotes,
  paymentImage,
  paymentImageType = "qr",
  paymentImageLabel,
  notes,
  variant = "classic",
  theme = {},
}: PaymentPreviewBlockProps) {
  const hasBankDetails = Boolean(
    bankName || accountName || accountNumber || routingCode || upiId || paymentNotes
  );
  const hasTerms = Boolean(paymentTerms && paymentTerms.trim());
  const hasImage = Boolean(paymentImage && paymentImage.trim());
  const hasNotes = Boolean(notes && notes.trim());

  if (!hasBankDetails && !hasTerms && !hasImage && !hasNotes) {
    return null;
  }

  const primary = theme.primary || "currentColor";
  const dark = theme.dark || "inherit";
  const muted = theme.muted || "#6b7280";
  const border = theme.border || "#e5e7eb";
  const cardBg = theme.cardBg || "transparent";

  const defaultImageCaption =
    paymentImageType === "cheque"
      ? "Cancelled Cheque"
      : paymentImageType === "qr"
      ? "Scan to Pay"
      : "Payment Document";

  const imageCaption = paymentImageLabel || defaultImageCaption;

  return (
    <div
      className="rounded-lg p-4 space-y-3.5 my-3"
      style={{
        border: `1px solid ${border}`,
        backgroundColor: cardBg,
      }}
      data-testid="preview-payment-section"
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        {/* Left side: Bank details, terms, notes */}
        <div className="flex-1 min-w-0 space-y-3 text-xs w-full">
          {hasBankDetails && (
            <div className="space-y-1.5">
              <div
                className="font-bold uppercase tracking-wider text-[11px]"
                style={{ color: primary }}
              >
                Payment Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {bankName && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: muted }}>
                      Bank
                    </span>
                    <span className="font-semibold" style={{ color: dark }}>
                      {bankName}
                    </span>
                  </div>
                )}

                {accountName && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: muted }}>
                      Account Name
                    </span>
                    <span className="font-semibold" style={{ color: dark }}>
                      {accountName}
                    </span>
                  </div>
                )}

                {accountNumber && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: muted }}>
                      Account Number
                    </span>
                    <span className="font-mono font-semibold" style={{ color: dark }}>
                      {accountNumber}
                    </span>
                  </div>
                )}

                {routingCode && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: muted }}>
                      IFSC / SWIFT / Routing
                    </span>
                    <span className="font-mono font-semibold uppercase" style={{ color: dark }}>
                      {routingCode}
                    </span>
                  </div>
                )}

                {upiId && (
                  <div className="flex flex-col sm:col-span-2">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: muted }}>
                      UPI ID / Payment Link
                    </span>
                    <span className="font-mono font-medium break-all" style={{ color: dark }}>
                      {upiId}
                    </span>
                  </div>
                )}
              </div>

              {paymentNotes && (
                <div className="pt-1 text-[11px] italic" style={{ color: muted }}>
                  {paymentNotes}
                </div>
              )}
            </div>
          )}

          {/* Payment Terms */}
          {hasTerms && (
            <div
              className={`space-y-1 ${hasBankDetails ? "pt-2 border-t" : ""}`}
              style={{ borderColor: border }}
            >
              <div
                className="font-bold uppercase tracking-wider text-[10px]"
                style={{ color: muted }}
              >
                Payment Terms
              </div>
              <p className="text-xs leading-relaxed" style={{ color: dark }}>
                {paymentTerms}
              </p>
            </div>
          )}

          {/* Additional Notes */}
          {hasNotes && (
            <div
              className={`space-y-1 ${hasBankDetails || hasTerms ? "pt-2 border-t" : ""}`}
              style={{ borderColor: border }}
            >
              <div
                className="font-bold uppercase tracking-wider text-[10px]"
                style={{ color: muted }}
              >
                Notes
              </div>
              <p className="text-xs leading-relaxed" style={{ color: dark }}>
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Right side: Payment Image (QR Code / Cancelled Cheque) */}
        {hasImage && (
          <div
            className="flex flex-col items-center justify-center p-2 rounded border bg-card/60 shrink-0 self-center sm:self-start mt-2 sm:mt-0"
            style={{ borderColor: border }}
          >
            <div
              className={
                paymentImageType === "cheque"
                  ? "w-40 h-24 flex items-center justify-center overflow-hidden rounded bg-background"
                  : "w-24 h-24 flex items-center justify-center overflow-hidden rounded bg-background"
              }
            >
              <img
                src={paymentImage}
                alt={imageCaption}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span
              className="text-[10px] font-medium text-center mt-1.5 max-w-[160px] truncate"
              style={{ color: muted }}
              title={imageCaption}
            >
              {imageCaption}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
