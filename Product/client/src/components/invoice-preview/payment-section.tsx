import { useMemo } from "react";
import { type PaymentImageType, type PaymentImageItem } from "@/types/invoice";

export interface PaymentPreviewBlockProps {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingCode?: string;
  upiId?: string;
  paymentTerms?: string;
  paymentNotes?: string;
  paymentImages?: PaymentImageItem[];
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
  paymentImages,
  paymentImage,
  paymentImageType = "qr",
  paymentImageLabel,
  notes,
  variant = "classic",
  theme = {},
}: PaymentPreviewBlockProps) {
  const normalizedImages: PaymentImageItem[] = useMemo(() => {
    if (paymentImages && paymentImages.length > 0) {
      return paymentImages
        .filter((img) => img.image && img.image.trim() !== "")
        .slice(0, 3)
        .map((img) => ({
          ...img,
          label:
            img.label ||
            (img.type === "cheque"
              ? "Cancelled Cheque"
              : img.type === "qr"
              ? "Scan to Pay"
              : "Payment Document"),
        }));
    }
    if (paymentImage && paymentImage.trim() !== "") {
      const defaultCaption =
        paymentImageType === "cheque"
          ? "Cancelled Cheque"
          : paymentImageType === "qr"
          ? "Scan to Pay"
          : "Payment Document";
      return [
        {
          id: "default-img",
          image: paymentImage,
          type: paymentImageType || "qr",
          label: paymentImageLabel || defaultCaption,
        },
      ];
    }
    return [];
  }, [paymentImages, paymentImage, paymentImageType, paymentImageLabel]);

  const hasBankDetails = Boolean(
    bankName || accountName || accountNumber || routingCode || upiId || paymentNotes
  );
  const hasTerms = Boolean(paymentTerms && paymentTerms.trim());
  const hasImage = normalizedImages.length > 0;
  const hasNotes = Boolean(notes && notes.trim());

  if (!hasBankDetails && !hasTerms && !hasImage && !hasNotes) {
    return null;
  }

  const primary = theme.primary || "currentColor";
  const dark = theme.dark || "inherit";
  const muted = theme.muted || "#6b7280";
  const border = theme.border || "#e5e7eb";
  const cardBg = theme.cardBg || "transparent";

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
                <div className="pt-1 text-[11px] italic whitespace-pre-wrap break-words" style={{ color: muted }}>
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
              <p className="text-xs leading-relaxed whitespace-pre-wrap break-words" style={{ color: dark }}>
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
              <p className="text-xs leading-relaxed whitespace-pre-wrap break-words" style={{ color: dark }}>
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Right side: Payment Image when exactly 1 image and other details exist */}
        {hasImage && normalizedImages.length === 1 && (hasBankDetails || hasTerms || hasNotes) && (
          <div
            className="flex flex-col items-center justify-center p-2 rounded border bg-card/60 shrink-0 self-center sm:self-start mt-2 sm:mt-0"
            style={{ borderColor: border }}
          >
            <div
              className={
                normalizedImages[0].type === "cheque"
                  ? "w-40 h-24 flex items-center justify-center overflow-hidden rounded bg-background"
                  : "w-24 h-24 flex items-center justify-center overflow-hidden rounded bg-background"
              }
            >
              <img
                src={normalizedImages[0].image}
                alt={normalizedImages[0].label}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span
              className="text-[10px] font-medium text-center mt-1.5 max-w-[160px] truncate"
              style={{ color: muted }}
              title={normalizedImages[0].label}
            >
              {normalizedImages[0].label}
            </span>
          </div>
        )}
      </div>

      {/* Multiple Payment Images (or single image when no text details exist) */}
      {hasImage && (normalizedImages.length > 1 || (!hasBankDetails && !hasTerms && !hasNotes)) && (
        <div
          className={`space-y-2 ${hasBankDetails || hasTerms || hasNotes ? "pt-3 border-t" : ""}`}
          style={{ borderColor: border }}
        >
          {(hasBankDetails || hasTerms || hasNotes) && (
            <div
              className="font-bold uppercase tracking-wider text-[10px]"
              style={{ color: muted }}
            >
              Payment Methods &amp; Verification
            </div>
          )}
          <div
            className={`grid gap-3 ${
              normalizedImages.length === 1
                ? "grid-cols-1 max-w-[200px]"
                : normalizedImages.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {normalizedImages.map((img, idx) => (
              <div
                key={img.id || idx}
                className="flex flex-col items-center justify-center p-2.5 rounded border bg-card/60"
                style={{ borderColor: border }}
              >
                <div
                  className={
                    img.type === "cheque"
                      ? "w-full h-24 flex items-center justify-center overflow-hidden rounded bg-background"
                      : "w-24 h-24 flex items-center justify-center overflow-hidden rounded bg-background"
                  }
                >
                  <img
                    src={img.image}
                    alt={img.label}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <span
                  className="text-[10px] font-medium text-center mt-1.5 max-w-[160px] truncate"
                  style={{ color: muted }}
                  title={img.label}
                >
                  {img.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
