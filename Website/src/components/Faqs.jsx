import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { FAQS } from '../data/content'
import { ChevronDownIcon } from './Icons'
import '../styles/Faqs.css'

export default function Faqs() {
  return (
    <section id="faqs" className="faqs-section">
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
      <Reveal delay={1} className="faqs-list">
        {FAQS.map((faq) => (
          <details key={faq.q} className="faq-item">
            <summary className="faq-summary">
              {faq.q}
              <span aria-hidden="true" className="faq-chevron">
                <ChevronDownIcon />
              </span>
            </summary>
            <div className="faq-answer">
              {faq.a}
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  )
}
