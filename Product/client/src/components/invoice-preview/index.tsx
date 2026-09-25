import { memo } from "react";
import { formatCurrencyAmount } from "@/lib/invoice-format";
import { type InvoicePreviewProps, currencies } from "./types";
import { ClassicPreview } from "./templates/classic";
import { CleanPreview } from "./templates/clean";
import { ModernPreview } from "./templates/modern";
import { ElegantPreview } from "./templates/elegant";
import { SidebarPreview } from "./templates/sidebar";

export type { InvoicePreviewProps };

// Memoized so this template tree only re-renders when one of
// its own props actually changes — the parent page also re-renders on
// unrelated state (e.g. isGenerating, accordion open/close) that shouldn't
// force the live preview to redo its work.
export const InvoicePreview = memo(function InvoicePreview(props: InvoicePreviewProps) {
  const currencySymbol = currencies[props.currency] || "$";
  const formatCurrency = (amount: number) =>
    formatCurrencyAmount(amount, currencySymbol, props.currency);

  const shared = { ...props, formatCurrency };

  switch (props.template) {
    case "clean":
      return <CleanPreview {...shared} />;
    case "modern":
      return <ModernPreview {...shared} />;
    case "elegant":
      return <ElegantPreview {...shared} />;
    case "sidebar":
      return <SidebarPreview {...shared} />;
    case "classic":
    default:
      return <ClassicPreview {...shared} />;
  }
});
