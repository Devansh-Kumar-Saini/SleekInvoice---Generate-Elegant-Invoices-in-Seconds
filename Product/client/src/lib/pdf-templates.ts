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
