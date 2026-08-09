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
  /** Fallback used instead of `default` when Invoice Theme is Dark and the
   * user hasn't set an override for this slot. Only set on slots that
   * represent neutral chrome (body text, muted labels, dividers) whose fixed
   * light-mode default (e.g. near-black text) would be unreadable on a dark
   * background. Saturated brand-accent slots (primary/pop/gold/sidebar/
   * headerFill) intentionally omit this — they're already vivid enough to
   * read on either background, and are the user's explicit brand color
   * choice, not something the theme should silently reinterpret. A slot the
   * user HAS overridden always keeps their exact override in both themes. */
  darkDefault?: string;
}

export const TEMPLATE_COLOR_SLOTS: Record<ColorizableTemplate, ColorSlot[]> = {
  classic: [
    { key: "primary", label: "Accent (INVOICE title, total)", default: "#dc264a" },
    { key: "dark", label: "Text", default: "#1e1e1e", darkDefault: "#f2f2f2" },
    { key: "muted", label: "Muted text", default: "#6e6e6e", darkDefault: "#a3a3a3" },
    { key: "border", label: "Dividers", default: "#e1e1e1", darkDefault: "#3a3a3a" },
    { key: "headerFill", label: "Table header fill", default: "#282828" },
  ],
  modern: [
    { key: "accent", label: "Banner background", default: "#17171b" },
    { key: "pop", label: "Highlight (total, INVOICE label)", default: "#ec4864" },
    { key: "ink", label: "Text", default: "#18181b", darkDefault: "#f4f4f5" },
    { key: "muted", label: "Muted text", default: "#71717a", darkDefault: "#a1a1aa" },
  ],
  elegant: [
    { key: "ink", label: "Text", default: "#23201c", darkDefault: "#ece8e2" },
    { key: "muted", label: "Muted text", default: "#787167", darkDefault: "#a8a095" },
    { key: "gold", label: "Accent (rule, total box)", default: "#967438" },
    { key: "rule", label: "Dividers", default: "#d2cabc", darkDefault: "#48433a" },
  ],
  sidebar: [
    { key: "sidebar", label: "Sidebar background", default: "#183a33" },
    { key: "pop", label: "Highlight (labels, total)", default: "#ebb24a" },
    { key: "ink", label: "Text", default: "#1c1c1c", darkDefault: "#f2f2f2" },
    { key: "muted", label: "Muted text", default: "#737373", darkDefault: "#a3a3a3" },
  ],
};

/**
 * Per-template structural (non-customizable) dark-mode colors — page/card
 * background and the neutral surface tints each template uses for table
 * zebra-striping, chips, or callout boxes. These aren't user-customizable
 * brand colors (see TEMPLATE_COLOR_SLOTS), just the dark-theme equivalent of
 * chrome that's hardcoded white/light-gray in light mode. jsPDF-triple and
 * CSS-hex forms are both provided since the PDF renderer and the live
 * preview each need their own format.
 */
export const TEMPLATE_DARK_SURFACES: Record<
  ColorizableTemplate,
  { pageBg: string; surface: string; surfaceAlt: string }
> = {
  classic: { pageBg: "#18181a", surface: "#212124", surfaceAlt: "#1c1c1f" },
  modern: { pageBg: "#18181a", surface: "#232326", surfaceAlt: "#1c1c1f" },
  elegant: { pageBg: "#1a1917", surface: "#242220", surfaceAlt: "#1e1c1a" },
  sidebar: { pageBg: "#18181a", surface: "#232326", surfaceAlt: "#1c1c1f" },
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

/**
 * Normalizes a user-typed hex string (with or without a leading "#", 3- or
 * 6-digit) to a well-formed "#rrggbb" string, or null if it isn't valid hex.
 * Used before feeding a value into a native `<input type="color">`, which
 * (unlike hexToRgb/resolveColor) requires an exact "#rrggbb" string and will
 * silently reset to black if given anything else — e.g. a value the user
 * typed without the "#" prefix, which is otherwise perfectly valid input.
 */
export function normalizeHex(hex: string): string | null {
  const clean = hex.trim().replace(/^#/, "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (full.length !== 6 || Number.isNaN(parseInt(full, 16)) || !/^[0-9a-fA-F]{6}$/.test(full)) {
    return null;
  }
  return `#${full.toLowerCase()}`;
}

/**
 * Resolves the effective hex color for a given template/slot: the user's
 * override if set and valid, else the slot's default (or `darkDefault` when
 * `isDark` is true and the slot defines one). The override is run through
 * `normalizeHex` so callers always get a well-formed "#rrggbb" string —
 * important for the live preview, which drops this straight into an inline
 * CSS `style={{ color: ... }}`, where a value without a leading "#" (or a
 * partially-typed hex) is invalid CSS and gets silently ignored by the
 * browser rather than erroring, which otherwise looks like "my customization
 * didn't apply" even though the value was saved correctly. Falls back to the
 * slot's own default (never black) while the override is invalid/incomplete,
 * e.g. mid-edit in the hex text input.
 *
 * `isDark` only changes anything for slots with a `darkDefault` (neutral text
 * slots) — an explicit user override always wins in either theme, and
 * saturated brand-accent slots (no `darkDefault`) are unaffected by theme.
 */
export function resolveColor(
  template: ColorizableTemplate,
  slotKey: string,
  overrides?: CustomColors,
  isDark?: boolean
): string {
  const slot = TEMPLATE_COLOR_SLOTS[template].find((s) => s.key === slotKey);
  const fallback = (isDark ? slot?.darkDefault : undefined) ?? slot?.default ?? "#000000";
  const override = overrides?.[template]?.[slotKey];
  if (!override) return fallback;
  return normalizeHex(override) ?? fallback;
}
