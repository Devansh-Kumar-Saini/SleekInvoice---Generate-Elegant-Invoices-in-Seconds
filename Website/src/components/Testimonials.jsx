import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { TESTIMONIALS } from '../data/content'
import { StarIcon, VerifiedIcon } from './Icons'
import '../styles/Testimonials.css'

export default function Testimonials() {
  return (
    <section aria-label="Testimonials" className="testimonials-section">
      <SectionHeading eyebrow="Testimonials" title="Loved by people who hate busywork" />
      <Reveal delay={1} className="testimonials-grid">
        {TESTIMONIALS.map((t) => (
          <figure key={t.initials} className="testimonial-card">
            <div role="img" aria-label="5 out of 5 stars rating" className="testimonial-stars">
              {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
            </div>
            <blockquote className="testimonial-quote">{t.quote}</blockquote>
            <figcaption className="testimonial-author">
              <span aria-hidden="true" className="testimonial-avatar">
                {t.initials}
              </span>
              <div>
                <div className="testimonial-role">
                  {t.role} <VerifiedIcon />
                </div>
                <div className="testimonial-verified">Verified user</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  )
}
