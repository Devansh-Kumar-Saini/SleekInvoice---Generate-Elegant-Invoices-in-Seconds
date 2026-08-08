import React, { useMemo, useState } from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { DEFAULT_LINE_ITEMS, formatMoney } from '../data/content'
import { MinusIcon, PlusIcon } from './Icons'

const TAX_PCT = 8.5
const CURRENCY_SYMBOL = '$'

export default function TryItLive() {
  const [items, setItems] = useState(DEFAULT_LINE_ITEMS)
  const [discountPct, setDiscountPct] = useState(10)

  const incQty = (id) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.min(it.qty + 1, 99) } : it)))
  const decQty = (id) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(it.qty - 1, 1) } : it)))

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.rate * it.qty, 0)
    const discountAmt = subtotal * (discountPct / 100)
    const taxable = subtotal - discountAmt
    const tax = taxable * (TAX_PCT / 100)
    const total = taxable + tax
    return { subtotal, discountAmt, tax, total }
  }, [items, discountPct])

  return (
    <section id="try-it" style={{ scrollMarginTop: 84, position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading
        eyebrow="Try It Live"
        title="Watch the total update as you go"
        subtitle="Adjust a quantity or the discount below — everything recalculates instantly, just like inside the real builder."
        maxWidth={600}
      />

      <Reveal delay={1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', background: 'var(--bg-surface)', border: '1px solid var(--border-hair-strong)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: 36 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Line Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 26 }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border-hair)' }}>
                <div>
                  <div style={{ fontSize: 14.5, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 3 }}>{item.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {CURRENCY_SYMBOL}{formatMoney(item.rate)} / unit
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border-hair-strong)', borderRadius: 999, padding: 5 }}>
                    <button onClick={() => decQty(item.id)} aria-label="Decrease quantity" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <MinusIcon />
                    </button>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13.5, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => incQty(item.id)} aria-label="Increase quantity" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <PlusIcon />
                    </button>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14.5, color: 'var(--text-primary)', minWidth: 76, textAlign: 'right' }}>
                    {CURRENCY_SYMBOL}{formatMoney(item.rate * item.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Discount</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'var(--blue-ink)' }}>{discountPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={discountPct}
            onChange={(e) => setDiscountPct(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono',monospace", margin: '18px 0 0' }}>
            Tax calculated automatically at {TAX_PCT}% VAT
          </p>
        </div>
        <div style={{ padding: 36, background: 'var(--bg-surface-2)', borderLeft: '1px solid var(--border-hair)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 18 }}>Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{CURRENCY_SYMBOL}{formatMoney(totals.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>Discount</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>−{CURRENCY_SYMBOL}{formatMoney(totals.discountAmt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', paddingBottom: 16, borderBottom: '1px solid var(--border-hair-strong)' }}>
              <span>Tax ({TAX_PCT}%)</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>+{CURRENCY_SYMBOL}{formatMoney(totals.tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 4 }}>
              <span style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, color: 'var(--blue-ink)', fontWeight: 700 }}>{CURRENCY_SYMBOL}{formatMoney(totals.total)}</span>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', margin: '20px 0 0', lineHeight: 1.5 }}>
            This is a live preview of the real builder — updates instantly as you adjust quantity or discount.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
