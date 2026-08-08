export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#templates', label: 'Templates' },
  { href: '#faqs', label: 'FAQs' },
]

export const TRUSTED_LOGOS = [
  'Momentum',
  'CoRide Connect',
  'News Connect',
  'Pass Guard',
  'Rehabit',
  'Talk2SQL',
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

export const TESTIMONIALS = [
  {
    initials: 'FD',
    quote: "I went from a blank page to a client-ready PDF in under two minutes. It's the fastest invoicing flow I've used.",
    role: 'Freelance Web Developer',
  },
  {
    initials: 'AO',
    quote: 'The live preview alone is worth it — I can see exactly what my client will receive before I hit export.',
    role: 'Creative Agency Owner',
  },
  {
    initials: 'IC',
    quote: 'Clean templates, automatic tax math, and no clunky sign-up flow. Exactly what a small studio needs.',
    role: 'Independent Consultant',
  },
]

export const FAQS = [
  { q: 'Do I need to create an account to use InvoiceForge?', a: 'No. Build and download your first invoice with zero sign-up. Create an account only if you want to save clients, templates, or enable recurring invoices.' },
  { q: 'What formats can I export to?', a: 'Every invoice exports as a crisp, print-ready PDF in under a second. CSV export and shareable payment links are on the roadmap.' },
  { q: 'Does it handle multiple currencies and tax rules?', a: 'Yes — choose from 30+ currencies and InvoiceForge automatically calculates VAT, GST, and custom tax or discount rates per line item.' },
  { q: 'Is my invoice data stored anywhere?', a: 'Free plan invoices stay local to your browser. Forge Pro securely syncs your clients, catalog, and invoice history so you can access them anywhere.' },
  { q: 'Can I add my own logo and branding?', a: 'Absolutely. Drop in your logo and brand color on any plan — Forge Pro unlocks full custom themes and saved branding presets.' },
  { q: 'Can I cancel Forge Pro anytime?', a: 'Yes. It is a simple monthly plan with no contracts — cancel anytime and keep using the Free plan.' },
]

export const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£' }

export const DEFAULT_LINE_ITEMS = [
  { id: 1, name: 'Landing page design', rate: 650, qty: 1 },
  { id: 2, name: 'Extra revision round', rate: 120, qty: 2 },
]

export function formatMoney(n) {
  return n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}
