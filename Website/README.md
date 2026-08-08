# InvoiceForge Landing Page

A React + Vite rebuild of the InvoiceForge marketing landing page, matching the original design system (dark/light theming, Outfit/Inter/JetBrains Mono type, amber/cyan accent palette) and all interactive behavior.

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Structure

- `src/context/ThemeContext.jsx` — dark/light theme provider (toggles the `data-theme` attribute consumed by CSS variables in `src/styles/global.css`)
- `src/data/content.js` — static copy/content arrays (nav links, FAQs, testimonials, templates, trusted-by logos, default invoice line items)
- `src/components/` — one component per section: `Header`, `Hero`, `TrustBar`, `Features`, `HowItWorks`, `TryItLive` (the interactive invoice calculator), `Templates`, `Testimonials`, `Faqs` (accordion), `FinalCta`, `Footer`
- `src/components/Icons.jsx` — inline SVG icon components used throughout

## Notes

- All pricing math in the "Try It Live" section (subtotal, discount, 8.5% VAT, total) is computed client-side in `TryItLive.jsx`, mirroring the original invoice builder logic.
- Theme toggle switches CSS custom properties via a `data-theme="dark" | "light"` attribute on the root wrapper — no external state library needed.
- Fonts (Outfit, Inter, JetBrains Mono) are loaded from Google Fonts in `index.html`.

<!-- testing 3 -->