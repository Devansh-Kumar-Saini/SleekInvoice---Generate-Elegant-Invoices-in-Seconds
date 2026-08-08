/**
 * Lightweight template metadata, split out of pdf-generator.ts on purpose.
 *
 * pdf-generator.ts pulls in jsPDF, jspdf-autotable, and ~70KB of embedded
 * base64 font data (pdf-fonts.ts) — none of which is needed just to render
 * the template <Select> in the form or to pick which preview component to
 * show. Keeping this metadata in its own dependency-free module lets the
 * rest of the app import it eagerly while the actual PDF renderer is loaded
 * lazily (only when the user clicks "Download PDF").
 */
export type InvoiceTemplate = "classic" | "clean" | "modern" | "elegant" | "sidebar";

export const INVOICE_TEMPLATES: Array<{ id: InvoiceTemplate; label: string; description: string }> = [
  { id: "classic", label: "Classic", description: "The original InvoiceForge design" },
  { id: "clean", label: "Clean", description: "Monochrome, hairline dividers — Vercel-inspired" },
  { id: "modern", label: "Modern", description: "Bold type, color banner, dramatic total" },
  { id: "elegant", label: "Elegant", description: "Serif letterhead, centered header, boxed total" },
  { id: "sidebar", label: "Sidebar", description: "Full-height color sidebar, two-column layout" },
];

// ---------------------------------------------------------------------------
// "Customize Invoice" color overrides — every color constant each template's
// PDF renderer (pdf-generator.ts) and live preview (invoice-preview.tsx)
// draws with, keyed by slot name, with hex defaults matching those files'
// current hardcoded values. Clean is intentionally excluded: its palette
// auto-flips black/white with the app's own theme toggle rather than acting
// as a brand accent, so it isn't part of the customizable set.
//
// Kept in this dependency-free module (not pdf-generator.ts) so the "Customize
// Invoice" form section — which needs the slot list and defaults to render
// color pickers — doesn't pull in jsPDF just to know what colors exist.
// ---------------------------------------------------------------------------
export type ColorizableTemplate = Exclude<InvoiceTemplate, "clean">;

export interface ColorSlot {
  key: string;
  label: string;
  default: string;
}

export const TEMPLATE_COLOR_SLOTS: Record<ColorizableTemplate, ColorSlot[]> = {
  classic: [
    { key: "primary", label: "Accent (INVOICE title, total)", default: "#dc264a" },
    { key: "dark", label: "Text", default: "#1e1e1e" },
    { key: "muted", label: "Muted text", default: "#6e6e6e" },
    { key: "border", label: "Dividers", default: "#e1e1e1" },
    { key: "headerFill", label: "Table header fill", default: "#282828" },
  ],
  modern: [
    { key: "accent", label: "Banner background", default: "#17171b" },
    { key: "pop", label: "Highlight (total, INVOICE label)", default: "#ec4864" },
    { key: "ink", label: "Text", default: "#18181b" },
    { key: "muted", label: "Muted text", default: "#71717a" },
  ],
  elegant: [
    { key: "ink", label: "Text", default: "#23201c" },
    { key: "muted", label: "Muted text", default: "#787167" },
    { key: "gold", label: "Accent (rule, total box)", default: "#967438" },
    { key: "rule", label: "Dividers", default: "#d2cabc" },
  ],
  sidebar: [
    { key: "sidebar", label: "Sidebar background", default: "#183a33" },
    { key: "pop", label: "Highlight (labels, total)", default: "#ebb24a" },
    { key: "ink", label: "Text", default: "#1c1c1c" },
    { key: "muted", label: "Muted text", default: "#737373" },
  ],
};

/** Per-template color overrides, e.g. `{ classic: { primary: "#0ea5e9" } }`. Slots not present fall back to their default. */
export type CustomColors = Partial<Record<ColorizableTemplate, Partial<Record<string, string>>>>;

/** Parses "#rrggbb" (or "#rgb") into a jsPDF-style [r, g, b] triple; falls back to black on malformed input. */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const num = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Resolves the effective hex color for a given template/slot: the user's override if set, else the slot's default. */
export function resolveColor(
  template: ColorizableTemplate,
  slotKey: string,
  overrides?: CustomColors
): string {
  const override = overrides?.[template]?.[slotKey];
  if (override) return override;
  const slot = TEMPLATE_COLOR_SLOTS[template].find((s) => s.key === slotKey);
  return slot?.default ?? "#000000";
}
