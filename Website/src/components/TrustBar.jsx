import React from 'react'
import { TRUSTED_LOGOS } from '../data/content'
import Reveal from './Reveal'
import '../styles/TrustBar.css'

export default function TrustBar() {
  return (
    <section aria-label="Trusted by companies worldwide" className="trustbar-section">
      <Reveal as="p" className="trustbar-text">
        Trusted by freelancers, developers, and agency founders worldwide
      </Reveal>
      <Reveal delay={1} className="trustbar-logos">
        {TRUSTED_LOGOS.map((logo) => (
          <span key={logo} className="trust-logo">
            {logo}
          </span>
        ))}
      </Reveal>
    </section>
  )
}
