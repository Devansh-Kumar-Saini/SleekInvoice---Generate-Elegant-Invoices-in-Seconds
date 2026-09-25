import React from 'react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { HOW_IT_WORKS } from '../data/content'
import '../styles/HowItWorks.css'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <SectionHeading eyebrow="How It Works" title="From blank page to paid, in three steps" maxWidth={720} />
      <Reveal delay={1} as="ol" className="steps-grid">
        {HOW_IT_WORKS.map((step) => (
          <li key={step.num} className="step-card">
            <div className="step-number" aria-hidden="true">{step.num}</div>
            <h3 className="step-title">
              <span className="sr-only">Step {step.num}: </span>
              {step.title}
            </h3>
            <p className="step-body">{step.body}</p>
          </li>
        ))}
      </Reveal>
    </section>
  )
}
