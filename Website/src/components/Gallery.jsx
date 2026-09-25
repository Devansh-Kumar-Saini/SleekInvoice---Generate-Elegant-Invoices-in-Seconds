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

  const items = useMemo(() => {
    return GALLERY_ITEMS.map((item) => ({
      ...item,
      src: resolveImage(item.image),
      title: item.caption.split('—')[0]?.trim() || item.caption,
    }))
  }, [])

  const count = items.length

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + count) % count)
  }, [count])

  const goTo = useCallback((idx) => {
    setCurrentIndex(idx)
  }, [])

  const dragStartXRef = useRef(0)

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (e.target.closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStartXRef.current = e.clientX
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    setDragOffset(e.clientX - dragStartXRef.current)
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = e.clientX - dragStartXRef.current
    setDragOffset(0)
    if (diff < -45) next()
    else if (diff > 45) prev()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex !== null) {
        if (e.key === 'Escape') setActiveIndex(null)
        else if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + count) % count)
        else if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % count)
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
      />

      {/* Main 3D Stage */}
      <div className="gallery-stage">
        {/* Previous Button */}
        <button
          type="button"
          onClick={prev}
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
          tabIndex={0}
          role="region"
          aria-label="3D curved invoice gallery. Drag or use arrow keys to navigate."
          className={`gallery-3d-viewport${isDragging ? ' is-dragging' : ''}`}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            '--drag-shift': `${(dragOffset * 0.4).toFixed(1)}px`,
          }}
        >
          {/* 3D Container */}
          <div className="gallery-3d-container">
            {items.map((item, idx) => {
              let offset = idx - currentIndex
              if (offset > count / 2) offset -= count
              if (offset < -count / 2) offset += count

              const isActive = offset === 0
              const absOffset = Math.abs(offset)
              const zIndex = 50 - absOffset * 10
              const opacity = absOffset > 3 ? 0 : 1 - absOffset * 0.1

              return (
                <div
                  key={item.key}
                  onClick={() => {
                    if (isActive) setActiveIndex(idx)
                    else goTo(idx)
                  }}
                  className={`gallery-card-3d ${isActive ? 'is-active' : ''} ${
                    item.key === 'darkmode' ? 'is-dark' : 'is-light'
                  }`}
                  style={{
                    '--offset': offset,
                    '--abs-offset': absOffset,
                    '--sign-offset': Math.sign(offset),
                    zIndex,
                    opacity,
                    cursor: isActive ? 'zoom-in' : 'pointer',
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
          onClick={next}
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
