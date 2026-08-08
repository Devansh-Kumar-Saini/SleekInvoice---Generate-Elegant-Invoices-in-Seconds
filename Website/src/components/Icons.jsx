export function ForgeMark({ size = 17, fill = '#1A1206' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="none">
      <path d="M12 2c1 3-3 4.2-3 8.2a3 3 0 006 0c0-1-.5-1.7-1-2.2 1.6 1.1 3 3.2 3 5.8A5 5 0 1112 7.8c0-2-1-3.6-2-5.8z" />
    </svg>
  )
}

export function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5z" />
    </svg>
  )
}

export function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  )
}

export function MenuIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function PlayIcon({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function BoltIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--amber-ink)" stroke="none">
      <path d="M13 2L3 14h7l-1 8 11-14h-8z" />
    </svg>
  )
}

export function GridIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="18" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}

export function DocIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <polyline points="9 14 12 17 15 14" />
    </svg>
  )
}

export function GlobeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z" />
    </svg>
  )
}

export function UsersIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19c0-3.3 3-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <circle cx="17.5" cy="8.5" r="2.6" />
      <path d="M15.7 13.8c2.6.4 4.8 2.3 4.8 5.2" />
    </svg>
  )
}

export function StarIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.5l3.1 6.6 7.1.9-5.3 4.9 1.5 7-6.4-3.6-6.4 3.6 1.5-7-5.3-4.9 7.1-.9z" />
    </svg>
  )
}

export function VerifiedIcon({ size = 13, color = 'var(--cyan-ink)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 1.4 2.8-.3 1 2.6 2.6 1-.3 2.8L22 12l-1.5 2.5.3 2.8-2.6 1-1 2.6-2.8-.3L12 22l-2.4-1.4-2.8.3-1-2.6-2.6-1 .3-2.8L2 12l1.5-2.5-.3-2.8 2.6-1 1-2.6 2.8.3z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function ChevronLeftIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function ZoomIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.3" y1="15.3" x2="20" y2="20" />
      <line x1="10.5" y1="7.8" x2="10.5" y2="13.2" />
      <line x1="7.8" y1="10.5" x2="13.2" y2="10.5" />
    </svg>
  )
}

export function MailIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3.5 6l8.5 6.5L20.5 6" />
    </svg>
  )
}

export function CommunityIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 11-3.6-6.9L21 3l-1.2 4.1c.8 1.2 1.2 2.7 1.2 4.4z" />
    </svg>
  )
}

export function UpdatesIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <line x1="9" y1="3" x2="7" y2="21" />
      <line x1="17" y1="3" x2="15" y2="21" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="3" y1="15" x2="19" y2="15" />
    </svg>
  )
}

export function MinusIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function PlusIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function PaletteIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 100 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0022 10.7C22 5.9 17.5 2 12 2z" />
      <circle cx="7.5" cy="10.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="7" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="9" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M18.9 2.6h3.3l-7.2 8.2 8.5 10.6h-6.6l-5.2-6.5-5.9 6.5H2.5l7.6-8.7L2 2.6h6.8l4.7 6z" />
    </svg>
  )
}

export function LinkedinIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9.98h4v11.02H3zM9.5 9.98h3.8v1.5h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1v6.48h-4v-5.75c0-1.37-.02-3.13-1.9-3.13-1.9 0-2.2 1.49-2.2 3.03v5.85h-4z" />
    </svg>
  )
}

export function YoutubeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M22.5 7.2s-.22-1.56-.9-2.25c-.86-.9-1.83-.9-2.27-.95C16.3 3.75 12 3.75 12 3.75h-.01s-4.3 0-7.33.25c-.44.05-1.4.05-2.27.95-.68.69-.9 2.25-.9 2.25S1.25 9.03 1.25 10.86v1.63c0 1.83.24 3.66.24 3.66s.22 1.56.9 2.25c.86.9 1.99.87 2.5.97 1.8.17 7.11.25 7.11.25s4.3-.01 7.33-.26c.44-.05 1.4-.05 2.27-.95.68-.69.9-2.25.9-2.25s.24-1.83.24-3.66v-1.63c0-1.83-.24-3.66-.24-3.66zM9.75 14.98v-6l6 3z" />
    </svg>
  )
}
