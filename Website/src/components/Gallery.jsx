import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import SectionHeading from './SectionHeading'
import { GALLERY_ITEMS } from '../data/content'
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, ZoomIcon } from './Icons'

const resolveImage = (filename) => new URL(`../Assets/${filename}`, import.meta.url).href

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeIndex, setActiveIndex] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  const items = useMemo(() => {
    return GALLERY_ITEMS.map((item) => ({
      ...item,
      src: resolveImage(item.image),
      title: item.caption.split('—')[0]?.trim() || item.caption,
      subtitle: item.caption.includes('—')
        ? item.caption.split('—')[1]?.trim()
        : '',
    }))
  }, [])

  const count = items.length

  // Responsive dimensions
  // Cards have been increased significantly.
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const layout = useMemo(() => {
    if (windowWidth < 640) {
      return {
        cardWidth: 250,
        cardHeight: 190,
        spacing: 145,
        stageHeight: 350,
        perspective: 850,
        zStep: 34,
        rotStep: 14,
      }
    } else if (windowWidth < 1024) {
      return {
        cardWidth: 320,
        cardHeight: 235,
        spacing: 190,
        stageHeight: 420,
        perspective: 1000,
        zStep: 42,
        rotStep: 16,
      }
    } else {
      return {
        cardWidth: 380,
        cardHeight: 275,
        spacing: 255,
        stageHeight: 490,
        perspective: 1200,
        zStep: 50,
        rotStep: 18,
      }
    }
  }, [windowWidth])

  // Navigation handlers
  const next = useCallback(() => {
    setDragOffset(0)
    setCurrentIndex((i) => (i + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    setDragOffset(0)
    setCurrentIndex((i) => (i - 1 + count) % count)
  }, [count])

  const goTo = useCallback((idx) => {
    setDragOffset(0)
    setCurrentIndex(idx)
  }, [])

  // Drag interaction refs & handlers
  const dragStartXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const currentDragOffsetRef = useRef(0)

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (e.target.closest('button')) return

    isDraggingRef.current = true
    setIsDragging(true)
    dragStartXRef.current = e.clientX
    currentDragOffsetRef.current = 0
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return

    const diff = e.clientX - dragStartXRef.current

    currentDragOffsetRef.current = diff
    setDragOffset(diff)
  }

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    setIsDragging(false)

    const offset = currentDragOffsetRef.current

    currentDragOffsetRef.current = 0
    setDragOffset(0)

    if (offset < -45) {
      next()
    } else if (offset > 45) {
      prev()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex !== null) {
        if (e.key === 'Escape') {
          setActiveIndex(null)
        }

        if (e.key === 'ArrowLeft') {
          setActiveIndex((i) => (i - 1 + count) % count)
        }

        if (e.key === 'ArrowRight') {
          setActiveIndex((i) => (i + 1) % count)
        }

        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'Enter') {
        setActiveIndex(currentIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, count, prev, next, currentIndex])

  const currentItem = items[currentIndex]

  return (
    <section
      id="gallery"
      style={{
        scrollMarginTop: 84,
        position: 'relative',
        zIndex: 1,
        maxWidth: 1440,
        margin: '0 auto',
        padding: '80px 16px 70px',
        overflow: 'hidden',
      }}
    >
      <SectionHeading
        eyebrow="Invoice Gallery"
        title="See InvoiceForge in action"
        subtitle="Explore our live builder, crafted invoice templates, and branding tools in a 3D panorama — drag or use arrows to spin."
        maxWidth={640}
      />

      {/* Main 3D Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1400,
          margin: '36px auto 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Previous Button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Previous template"
          className="gallery-nav-btn"
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
            transition:
              'transform 0.2s, background 0.2s, border-color 0.2s',
          }}
        >
          <ChevronLeftIcon size={24} />
        </button>

        {/* 3D Viewport */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={(e) => {
            if (isDraggingRef.current) {
              handlePointerUp(e)
            }
          }}
          tabIndex={0}
          role="region"
          aria-label="3D curved invoice gallery. Drag or use arrow keys to navigate."
          style={{
            position: 'relative',
            width: '100%',
            height: layout.stageHeight,
            perspective: `${layout.perspective}px`,
            perspectiveOrigin: '50% 50%',
            overflow: 'hidden',
            userSelect: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'pan-y',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 3D Container */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transformStyle: 'preserve-3d',
              pointerEvents: 'none',
            }}
          >
            {items.map((item, idx) => {
              // Calculate shortest circular relative offset
              let offset = idx - currentIndex

              if (offset > count / 2) {
                offset -= count
              }

              if (offset < -count / 2) {
                offset += count
              }

              const isActive = offset === 0

              // 3D positioning
              const dragShift = dragOffset * 0.4

              const x = offset * layout.spacing + dragShift

              const z = -Math.abs(offset) * layout.zStep

              const rotY =
                -Math.sign(offset) *
                (Math.abs(offset) * layout.rotStep)

              // Slightly larger side cards as well
              const scale = 1 - Math.abs(offset) * 0.055

              const zIndex = 50 - Math.abs(offset) * 10

              const opacity =
                Math.abs(offset) > 3
                  ? 0
                  : 1 - Math.abs(offset) * 0.1

              return (
                <div
                  key={item.key}
                  onClick={() => {
                    if (isActive) {
                      setActiveIndex(idx)
                    } else {
                      goTo(idx)
                    }
                  }}
                  className={`gallery-card-3d ${
                    isActive ? 'is-active' : ''
                  }`}
                  style={{
                    position: 'absolute',

                    // INCREASED CARD SIZE
                    width: layout.cardWidth,
                    height: layout.cardHeight,

                    top: -layout.cardHeight / 2,
                    left: -layout.cardWidth / 2,

                    borderRadius: 18,
                    overflow: 'hidden',
                    cursor: isActive ? 'zoom-in' : 'pointer',
                    pointerEvents: 'auto',
                    zIndex,
                    opacity,

                    background:
                      item.key === 'darkmode'
                        ? '#0E1526'
                        : '#FFFFFF',

                    border: isActive
                      ? '2.5px solid var(--blue)'
                      : '1.5px solid rgba(255, 255, 255, 0.18)',

                    boxShadow: isActive
                      ? '0 0 45px rgba(59, 130, 246, 0.5), 0 24px 60px rgba(0, 0, 0, 0.65)'
                      : '0 16px 38px rgba(0, 0, 0, 0.4)',

                    transform: `
                      translate3d(
                        ${x.toFixed(1)}px,
                        0px,
                        ${z.toFixed(1)}px
                      )
                      rotateY(${rotY.toFixed(1)}deg)
                      scale(${scale.toFixed(2)})
                    `,

                    transformOrigin: '50% 50%',
                    backfaceVisibility: 'hidden',

                    transition: isDragging
                      ? 'none'
                      : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    padding: 10,
                  }}
                >
                  {/* Zoom Button */}
                  {isActive && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveIndex(idx)
                      }}
                      aria-label="Zoom into invoice preview"
                      className="gallery-card-zoom-btn"
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#0F172A',
                        border: '2px solid #FFFFFF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 120,
                        boxShadow:
                          '0 5px 18px rgba(0, 0, 0, 0.7)',
                        transition:
                          'transform 0.2s, background 0.2s',
                      }}
                    >
                      <ZoomIcon size={18} />
                    </button>
                  )}

                  {/* Invoice Image */}
                  <img
                    src={item.src}
                    alt={item.caption}
                    draggable={false}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      borderRadius: 12,
                      display: 'block',
                      pointerEvents: 'none',
                      filter:
                        item.key === 'darkmode'
                          ? 'none'
                          : 'drop-shadow(0 3px 10px rgba(0,0,0,0.1))',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          aria-label="Next template"
          className="gallery-nav-btn"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
            transition:
              'transform 0.2s, background 0.2s, border-color 0.2s',
          }}
        >
          <ChevronRightIcon size={24} />
        </button>
      </div>

      {/* Information Bar & Interactive Dots */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Caption & Quick Zoom Card */}
        <div
          style={{
            maxWidth: 680,
            width: '100%',
            padding: '16px 22px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hair-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            boxShadow: '0 10px 30px rgba(0,0,0,.2)',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--blue)',
                }}
              >
                Template {currentIndex + 1} of {count}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentItem?.caption}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex(currentIndex)}
            style={{
              padding: '9px 19px',
              borderRadius: 10,
              background: 'var(--blue)',
              border: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow:
                '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition:
                'transform 0.15s, opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
            className="gallery-zoom-btn"
          >
            <ZoomIcon size={15} />
            Zoom Preview
          </button>
        </div>

        {/* Dot Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {items.map((item, idx) => {
            const isSelected = idx === currentIndex

            return (
              <button
                type="button"
                key={item.key}
                onClick={() => goTo(idx)}
                aria-label={`Go to ${item.title}`}
                style={{
                  width: isSelected ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: isSelected
                    ? 'var(--blue)'
                    : 'var(--text-tertiary)',
                  opacity: isSelected ? 1 : 0.4,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition:
                    'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            )
          })}
        </div>

        {/* Interaction Hint */}
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.02em',
          }}
        >
          Drag horizontally, click &lt; &gt; or use arrow keys •
          Click center invoice to zoom
        </p>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 16, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(null)
            }}
            aria-label="Close lightbox"
            style={{
              position: 'absolute',
              top: 22,
              right: 22,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border:
                '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10010,
              transition: 'background 0.2s',
            }}
          >
            <CloseIcon size={20} />
          </button>

          {/* Previous Lightbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(
                (i) => (i - 1 + count) % count
              )
            }}
            aria-label="Previous template"
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border:
                '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10010,
              transition: 'background 0.2s',
            }}
          >
            <ChevronLeftIcon size={26} />
          </button>

          {/* Lightbox Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 1200,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              zIndex: 10005,
              padding: '0 16px',
            }}
          >
            <img
              src={items[activeIndex].src}
              alt={items[activeIndex].caption}
              style={{
                maxWidth: '94vw',
                maxHeight: '82vh',
                borderRadius: 18,
                boxShadow:
                  '0 30px 100px rgba(0, 0, 0, 0.85)',
                border:
                  '1px solid rgba(255, 255, 255, 0.15)',
                objectFit: 'contain',
                background:
                  items[activeIndex].key === 'darkmode'
                    ? '#0E1526'
                    : '#FFFFFF',
              }}
            />

            <div
              style={{
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  color: '#F5F7FB',
                  fontSize: 16,
                  fontWeight: 600,
                  margin: '0 0 4px',
                }}
              >
                {items[activeIndex].title}
              </p>

              <p
                style={{
                  color: '#93A0BC',
                  fontSize: 14,
                  margin: 0,
                }}
              >
                {items[activeIndex].caption}
              </p>
            </div>
          </div>

          {/* Next Lightbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(
                (i) => (i + 1) % count
              )
            }}
            aria-label="Next template"
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border:
                '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10010,
              transition: 'background 0.2s',
            }}
          >
            <ChevronRightIcon size={26} />
          </button>
        </div>
      )}
    </section>
  )
}
