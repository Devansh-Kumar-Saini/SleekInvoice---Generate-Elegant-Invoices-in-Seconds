import React, { useEffect, useState } from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { GALLERY_ITEMS } from '../data/content'
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, ZoomIcon } from './Icons'

const IMAGE_MODULES = import.meta.glob('../Assets/*.png', { eager: true, import: 'default' })

function resolveImage(filename) {
  const match = Object.entries(IMAGE_MODULES).find(([path]) => path.endsWith(`/${filename}`))
  return match ? match[1] : ''
}

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null)

  const open = (index) => setActiveIndex(index)
  const close = () => setActiveIndex(null)
  const showPrev = () => setActiveIndex((i) => (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)
  const showNext = () => setActiveIndex((i) => (i + 1) % GALLERY_ITEMS.length)

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex])

  return (
    <section id="gallery" style={{ scrollMarginTop: 84, position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '100px 24px' }}>
      <SectionHeading
        eyebrow="Gallery"
        title="See InvoiceForge in action"
        subtitle="A closer look at the builder, the templates, and the brand customization — click any image to zoom in."
        maxWidth={620}
      />

      <Reveal
        delay={1}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 160,
          gap: 20,
        }}
        className="gallery-grid"
      >
        {GALLERY_ITEMS.map((item, index) => {
          return (
            <button
              key={item.key}
              onClick={() => open(index)}
              className="gallery-card"
              aria-label={`Open image: ${item.caption}`}
              style={{
                position: 'relative',
                gridColumn: `span ${item.colSpan}`,
                gridRow: `span ${item.rowSpan}`,
                border: '2px solid var(--border-hair)',
                borderRadius: 18,
                overflow: 'hidden',
                padding: 0,
                cursor: 'zoom-in',
                background: '#f4f6fb15',
                transition: 'transform .25s, border-color .25s',
              }}
            >
              <img
                src={resolveImage(item.image)}
                alt={item.caption}
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <div
                className="gallery-overlay"
                aria-hidden="true"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 45%, rgba(8,11,20,.88) 100%)',
                  opacity: 0, transition: 'opacity .25s',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  padding: 16,
                }}
              >
                <span style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <ZoomIcon size={14} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F7FB', textAlign: 'left', lineHeight: 1.4 }}>
                  {item.caption}
                </span>
              </div>
            </button>
          )
        })}
      </Reveal>

      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(5,8,16,.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); close() }}
            aria-label="Close"
            style={{
              position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <CloseIcon size={18} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); showPrev() }}
            aria-label="Previous image"
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <ChevronLeftIcon />
          </button>

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 920, maxHeight: '86vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <img
              src={resolveImage(GALLERY_ITEMS[activeIndex].image)}
              alt={GALLERY_ITEMS[activeIndex].caption}
              style={{ maxWidth: '100%', maxHeight: '76vh', borderRadius: 14, boxShadow: '0 30px 80px rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.12)' }}
            />
            <p style={{ color: '#E3E8F2', fontSize: 14.5, textAlign: 'center', margin: 0 }}>
              {GALLERY_ITEMS[activeIndex].caption}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); showNext() }}
            aria-label="Next image"
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </section>
  )
}
