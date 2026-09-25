import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import SectionHeading from './SectionHeading'
import { GALLERY_ITEMS } from '../data/content'
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, ZoomIcon } from './Icons'
import '../styles/Gallery.css'

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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const layout = useMemo(() => {
    if (windowWidth < 640) {
      return {
        cardWidth: 260,
        cardHeight: 195,
        spacing: 155,
        stageHeight: 360,
        perspective: 850,
        zStep: 34,
        rotStep: 14,
      }
    } else if (windowWidth < 1024) {
      return {
        cardWidth: 340,
        cardHeight: 250,
        spacing: 210,
        stageHeight: 440,
        perspective: 1000,
        zStep: 42,
        rotStep: 16,
      }
    } else {
      return {
        cardWidth: 420,
        cardHeight: 300,
        spacing: 280,
        stageHeight: 520,
        perspective: 1300,
        zStep: 52,
        rotStep: 18,
      }
    }
  }, [windowWidth])

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
    <section id="gallery" className="gallery-section">
      <SectionHeading
        eyebrow="Invoice Gallery"
        title="See InvoiceForge in action"
        subtitle="Explore our live builder, crafted invoice templates, and branding tools."
        maxWidth={760}
      />

      {/* Main 3D Stage */}
      <div className="gallery-stage">
        {/* Previous Button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Previous template"
          className="gallery-nav-btn gallery-nav-prev"
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
          className="gallery-3d-viewport"
          style={{
            height: layout.stageHeight,
            perspective: `${layout.perspective}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* 3D Container */}
          <div className="gallery-3d-container">
            {items.map((item, idx) => {
              let offset = idx - currentIndex

              if (offset > count / 2) {
                offset -= count
              }
              if (offset < -count / 2) {
                offset += count
              }

              const isActive = offset === 0
              const dragShift = dragOffset * 0.4
              const x = offset * layout.spacing + dragShift
              const z = -Math.abs(offset) * layout.zStep
              const rotY = -Math.sign(offset) * (Math.abs(offset) * layout.rotStep)
              const scale = 1 - Math.abs(offset) * 0.055
              const zIndex = 50 - Math.abs(offset) * 10
              const opacity = Math.abs(offset) > 3 ? 0 : 1 - Math.abs(offset) * 0.1

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
                  } ${item.key === 'darkmode' ? 'is-dark' : 'is-light'}`}
                  style={{
                    width: layout.cardWidth,
                    height: layout.cardHeight,
                    top: -layout.cardHeight / 2,
                    left: -layout.cardWidth / 2,
                    zIndex,
                    opacity,
                    cursor: isActive ? 'zoom-in' : 'pointer',
                    transform: `
                      translate3d(
                        ${x.toFixed(1)}px,
                        0px,
                        ${z.toFixed(1)}px
                      )
                      rotateY(${rotY.toFixed(1)}deg)
                      scale(${scale.toFixed(2)})
                    `,
                    transition: isDragging
                      ? 'none'
                      : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',
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
                      aria-label={`Zoom into ${item.title} preview`}
                      className="gallery-card-zoom-btn"
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
                    className={`gallery-card-img ${item.key !== 'darkmode' ? 'has-shadow' : ''}`}
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
          className="gallery-nav-btn gallery-nav-next"
        >
          <ChevronRightIcon size={24} />
        </button>
      </div>

      {/* Information Bar & Interactive Dots */}
      <div className="gallery-info-bar">
        {/* Caption & Quick Zoom Card */}
        <div className="gallery-caption-card">
          <div className="gallery-caption-info">
            <div className="gallery-caption-tag-wrapper">
              <span className="gallery-caption-tag">
                {currentItem?.title}
              </span>
              {/* <span className="gallery-caption-tag">
                Template {currentIndex + 1} of {count}
              </span> */}
            </div>

            <p className="gallery-caption-text">
              {currentItem?.caption}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex(currentIndex)}
            aria-label={`Zoom into ${currentItem?.title || 'invoice'} preview`}
            className="gallery-zoom-btn"
          >
            <ZoomIcon size={16} />
            Zoom Preview
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="gallery-dots" role="tablist" aria-label="Template slides">
          {items.map((item, idx) => {
            const isSelected = idx === currentIndex

            return (
              <button
                type="button"
                key={item.key}
                onClick={() => goTo(idx)}
                aria-label={`View slide ${idx + 1} of ${count}: ${item.title}`}
                aria-current={isSelected ? 'true' : undefined}
                className={`gallery-dot ${isSelected ? 'is-active' : ''}`}
              />
            )
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Invoice preview: ${items[activeIndex]?.title || 'Template'}`}
          onClick={() => setActiveIndex(null)}
          className="gallery-modal-overlay"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(null)
            }}
            aria-label="Close invoice preview lightbox"
            className="gallery-modal-close-btn"
          >
            <CloseIcon size={22} />
          </button>

          {/* Previous Lightbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex((i) => (i - 1 + count) % count)
            }}
            aria-label="Previous template preview"
            className="gallery-modal-nav-btn gallery-modal-nav-prev"
          >
            <ChevronLeftIcon size={26} />
          </button>

          {/* Lightbox Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="gallery-modal-content"
          >
            <img
              src={items[activeIndex].src}
              alt={items[activeIndex].caption}
              className={`gallery-modal-img ${
                items[activeIndex].key === 'darkmode' ? 'is-dark' : 'is-light'
              }`}
            />

            <div className="gallery-modal-info">
              <p className="gallery-modal-title">
                {items[activeIndex].title}
              </p>

              <p className="gallery-modal-caption">
                {items[activeIndex].caption}
              </p>
            </div>
          </div>

          {/* Next Lightbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex((i) => (i + 1) % count)
            }}
            aria-label="Next template preview"
            className="gallery-modal-nav-btn gallery-modal-nav-next"
          >
            <ChevronRightIcon size={26} />
          </button>
        </div>
      )}
    </section>
  )
}
