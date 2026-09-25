import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { TESTIMONIALS } from '../data/content'
import { StarIcon, VerifiedIcon } from './Icons'
import '../styles/Testimonials.css'

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <SectionHeading eyebrow="Testimonials" title="Loved by people who hate busywork" maxWidth={600} />
      <Reveal delay={1} className="testimonials-grid">
        {TESTIMONIALS.map((t) => (
          <div key={t.initials} className="testimonial-card">
            <div className="testimonial-stars">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
            </div>
            <p className="testimonial-quote">{t.quote}</p>
            <div className="testimonial-author">
              <span className="testimonial-avatar">
                {t.initials}
              </span>
              <div>
                <div className="testimonial-role">
                  {t.role} <VerifiedIcon />
                </div>
                <div className="testimonial-verified">Verified user</div>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
