import React from 'react'
import { ArrowRightIcon } from './Icons'
import Reveal from './Reveal'
import '../styles/FinalCta.css'

export default function FinalCta() {
  return (
    <section aria-label="Call to action" className="final-cta-section">
      <Reveal className="final-cta-card">
        <div aria-hidden="true" className="final-cta-glow" />
        <div className="final-cta-content">
          <div className="final-cta-badge">
            No Sign-Up Required
          </div>
          <h2 className="final-cta-title">
            Ready to upgrade your invoicing experience?
          </h2>
          <a href="https://allfreeinvoice.vercel.app/" className="cta-final">
            Create Your First Invoice Free
            <ArrowRightIcon />
          </a>
        </div>
      </Reveal>
    </section>
  )
}
