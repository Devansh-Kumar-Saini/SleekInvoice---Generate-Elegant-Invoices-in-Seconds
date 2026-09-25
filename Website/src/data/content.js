export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#templates', label: 'Templates' },
  { href: '#faqs', label: 'FAQs' },
]

export const TRUSTED_LOGOS = [
  'Momentum',
  'CoRide Connect',
  'News Connect',
  'Pass Guard',
  'Rehabit',
  'API Gen',
  'Goal Invest AI',
  'OCC Mobiles'
]

export const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Enter Invoice Details',
    body: 'Add your logo, client info, and line items in a form that renders as you go.',
  },
  {
    num: '02',
    title: 'Customize & Preview',
    body: 'Toggle templates, tax rates, and accent colors — every change reflects instantly in the live preview.',
  },
  {
    num: '03',
    title: 'Export & Collect',
    body: 'Download a high-res PDF or share a direct link — get paid faster.',
  },
]

export const TEMPLATES = [
  { name: 'Classic', accent: 'var(--blue)', surface: 'var(--bg-surface-2)', highlighted: true, badge: 'Default' },
  { name: 'Clean', accent: 'var(--text-secondary)', surface: 'var(--bg-surface-2)' },
  { name: 'Modern', accent: 'var(--cyan)', surface: 'var(--bg-canvas)', bordered: true },
  { name: 'Elegant', accent: 'var(--indigo)', surface: 'var(--bg-surface-2)' },
  { name: 'Sidebar', accent: 'var(--cyan-ink)', surface: 'var(--bg-surface-2)' },
]

export const GALLERY_ITEMS = [
  { key: 'fullpreview', image: 'fullpreview.png', caption: 'Live builder with real-time invoice preview' },
  { key: 'default', image: 'default.png', caption: 'Classic template — clean itemized layout' },
  { key: 'modern', image: 'modern.png', caption: 'Modern template — bold header, card summary' },
  { key: 'cleanInvoice', image: 'cleanInvoice.png', caption: 'Clean template — minimal, theme-aware' },
  { key: 'customize', image: 'customize.png', caption: 'Customize Invoice — brand your accent colors' },
  { key: 'elegent', image: 'elegent.png', caption: 'Elegant template — formal serif letterhead' },
  { key: 'darkmode', image: 'darkmode.png', caption: 'Dark mode — easy on the eyes for night work' },
]

export const TESTIMONIALS = [
  {
    initials: 'D',
    quote: "I went from a blank page to a client-ready PDF in under two minutes. It's the fastest invoicing flow I've used.",
    role: 'Full Stack Web Developer',
  },
  {
    initials: 'SE',
    quote: 'The live preview alone is worth it — I can see exactly what my client will receive before I hit export.',
    role: 'Startup Entrepreneur',
  },
  {
    initials: 'FD',
    quote: 'Clean templates, custom branding, and no clunky sign-up flow. Exactly what a small studio needs.',
    role: 'Freelance Designer',
  },
]

export const FAQS = [
  { q: 'Do I need to create an account to use InvoiceForge?', a: 'No. Build and download your first invoice with zero sign-up. Create an account only if you want to save clients, templates, or enable recurring invoices.' },
  { q: 'What formats can I export to?', a: 'Every invoice exports as a crisp, print-ready PDF in under a second. CSV export and shareable payment links are on the roadmap.' },
  { q: 'Does it handle multiple currencies and tax rules?', a: 'Yes — choose from 30+ currencies and InvoiceForge automatically calculates VAT, GST, and custom tax or discount rates per line item.' },
  { q: 'Is my invoice data stored anywhere?', a: 'Free plan invoices stay local to your browser.' },
  { q: 'Can I add my own logo and branding?', a: 'Absolutely. Drop in your logo and brand color for custom branding.' },
]
