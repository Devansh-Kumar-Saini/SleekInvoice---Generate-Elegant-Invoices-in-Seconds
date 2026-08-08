# InvoiceForge — Invoice Templates & Customization (2026-08-08)

## What was done
1. Added 2 new invoice templates (Elegant, Sidebar) to the existing 3 (Classic, Clean, Modern).
2. Added a "Customize Invoice" form section letting users override every color constant in each colorizable template, with each template remembering its own overrides independently.

## Part 1 — 2 new templates

Surveyed Wave, Zoho Books, FreshBooks, and Canva's invoice design gallery to find visual archetypes not covered by the existing 3.

**Elegant** — formal serif-style letterhead. Centered company name, thin gold double-rule under the header, muted ink/gold palette, label-above-value contact blocks with no icons, bordered (not filled) total box.

**Sidebar** — full-height color block (deep teal) running down the left edge carries company identity, invoice metadata, and Bill To; items table and totals sit in the white main column. Structurally distinct from Modern's top banner.

Files: `pdf-templates.ts` (2 new `INVOICE_TEMPLATES` entries), `pdf-generator.ts` (`renderElegantTemplate`, `renderSidebarTemplate`), `invoice-preview.tsx` (`ElegantPreview`, `SidebarPreview`). No changes needed to `create-invoice.tsx` — the template `<Select>` is metadata-driven.

## Part 2 — "Customize Invoice" color section

Every color constant in Classic, Modern, Elegant, and Sidebar is now user-overridable via a new "Customize Invoice" accordion section in `create-invoice.tsx`, placed right after "Invoice Details" (where the PDF Template picker lives). Clean is intentionally excluded — its palette auto-flips black/white with the app's theme toggle by design, not a brand accent.

**Data model** (`pdf-templates.ts`):
- `TEMPLATE_COLOR_SLOTS: Record<ColorizableTemplate, ColorSlot[]>` — the named color slots per template, each with a hex default matching the original hardcoded RGB values exactly (verified programmatically).
  - Classic: primary, dark, muted, border, headerFill (5 slots)
  - Modern: accent, pop, ink, muted (4 slots)
  - Elegant: ink, muted, gold, rule (4 slots)
  - Sidebar: sidebar, pop, ink, muted (4 slots)
- `CustomColors` type: `Partial<Record<ColorizableTemplate, Partial<Record<string, string>>>>` — e.g. `{ classic: { primary: "#0ea5e9" } }`. Unset slots fall back to defaults.
- `hexToRgb()` / `resolveColor()` helpers shared by both the PDF renderer and the live preview.

**Wiring:**
- `pdf-generator.ts` — `InvoicePdfData.customColors?: CustomColors`; `TemplateContext.color(template, slotKey)` resolves a slot to a jsPDF RGB triple; each of the 4 render functions now calls `ctx.color(...)` instead of hardcoding constants.
- `invoice-preview.tsx` — `InvoicePreviewProps.customColors?: CustomColors`; a `colorsFor()` helper resolves a template's slots to hex strings for inline `style` overrides layered on top of the existing Tailwind classes (so light/dark-mode-aware neutral text stays on theme tokens; only true brand-accent elements get overridden).
- `create-invoice.tsx` — `FormValues.customColors: CustomColors`, defaulting to `{}`. `setTemplateColor(template, slotKey, hex)` and `resetTemplateColors(template)` update/clear one template's overrides without touching any other template's — this is what makes each template "remember" its own customization independently when switching templates, per the user's explicit request. The new section shows a native color-swatch input paired with a hex text input per slot, plus a "Reset to default" button. If Clean is selected, the section shows an explanatory message instead of color pickers.

## Verified
- Programmatically confirmed every hex default converts back to the exact original RGB triple (byte-for-byte), and that the no-override case (`customColors: {}`, the default) resolves to those same original colors — so this feature is provably a no-op for anyone who doesn't touch it.
- Full real build in a reconstructed copy of the project (`npm run build` = `tsc && vite build`): succeeded, 0 TypeScript errors. Confirmed "Customize Invoice" text and all new default color hex values are present in the built bundle.
- Diffed all 4 changed files against their prior versions: every hunk is either a pure insertion or a targeted, expected replacement (hardcoded color constant → `ctx.color(...)` / `colorsFor(...)` call); no unrelated code was touched.

## Not done / flagged
- No visual/pixel screenshot review of the color pickers or resulting PDF/preview output — recommend opening the app locally, picking a non-default color for a couple of slots per template, and confirming both the live preview and the downloaded PDF reflect it correctly.
- Sidebar's `SIDEBAR_MUTED` (a lighter tint used for secondary text on the sidebar) is not user-customizable and does not auto-derive from a custom `sidebar` color — it stays fixed even if the user recolors the sidebar background. Same for Modern's `ACCENT_TEXT`/`SOFT_FILL` and Classic's default logo-less placeholder — these were treated as structural, not brand-accent, slots.