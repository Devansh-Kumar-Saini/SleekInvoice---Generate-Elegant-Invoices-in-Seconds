import React, { useId } from "react";

export default function PaymentIllustration({
  className = "features-payment-svg",
  style,
  ...props
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const phoneScreenClipId = `phone-screen-clip-${id}`;
  const cardClipId = `card-clip-${id}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      /* Tight viewBox around the artwork so the blue backdrop hugs the items */
      viewBox="153 129 817 566"
      width="100%"
      height="100%"
      className={className}
      style={style}
      {...props}
    >
      <defs>
        <clipPath id={phoneScreenClipId}>
          <rect x="25" y="62" width="158" height="342" rx="4" />
        </clipPath>

        <clipPath id={cardClipId}>
          <rect x="0" y="0" width="222" height="342" rx="28" />
        </clipPath>
      </defs>

      {/* Background card, sized to match the tightened viewBox */}
      <rect x="153" y="129" width="817" height="566" fill="#99d4fc" />

      {/* Centering wrapper offsetting Y by +120px */}
      <g transform="translate(0, 120)">
        <g id="hand-background">
          {/* Hand background content can be added here */}
        </g>

        <g id="financial-items">
          {/* 1. Smartphone (Leftmost, angled ~ -32deg) */}
          <g transform="translate(485, 435) rotate(-32) translate(-104, -400)">
            {/* Phone Outer Body */}
            <rect x="0" y="0" width="208" height="425" rx="20" fill="#ededed" />

            {/* Top Speaker / Camera Dot */}
            <circle cx="36" cy="30" r="4.5" fill="#cfd6db" />

            {/* Screen Area */}
            <rect x="25" y="62" width="158" height="342" rx="4" fill="#0b2c54" />

            {/* Screen Reflection Stripes */}
            <g clipPath={`url(#${phoneScreenClipId})`}>
              <polygon points="5,-20 30,-20 185,320 160,320" fill="#1b4d89" opacity="0.9" />
              <polygon points="40,-20 62,-20 220,320 198,320" fill="#1b4d89" opacity="0.9" />
              <polygon points="68,-20 86,-20 240,320 222,320" fill="#1b4d89" opacity="0.9" />
            </g>
          </g>

          {/* 2. Banknote / Dollar Bill (Angled ~ -15deg) */}
          <g transform="translate(540, 430) rotate(-15) translate(-106, -370)">
            {/* White Border */}
            <rect x="0" y="0" width="212" height="415" rx="4" fill="#ffffff" />
            {/* Green Interior */}
            <rect x="18" y="18" width="176" height="379" fill="#028267" />
            {/* Bill Center Details */}
            <circle cx="106" cy="142" r="16" fill="#a4e4be" />
            {/* Bill Large Lower Watermark/Circle */}
            <circle cx="106" cy="275" r="54" fill="#f0f5ed" />
          </g>

          {/* 3. Receipt/Paper */}
          <g transform="translate(595, 410) rotate(12) translate(-130, -350)">
            <rect x="0" y="0" width="245" height="400" rx="3" fill="#ffffff" />
            <rect x="14" y="12" width="202" height="376" fill="#aee2ab" />

            <rect x="28" y="24" width="34" height="42" fill="#ffffff" />
            <rect x="24" y="80" width="34" height="46" fill="#ffffff" />
            <rect x="20" y="140" width="34" height="82" fill="#ffffff" />

            <text x="86" y="172" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="28" fill="#028267" textAnchor="middle">$</text>

            <rect x="76" y="184" width="2.5" height="74" fill="#028267" />

            <rect x="120" y="86" width="3" height="154" fill="#028267" />

            <path d="M 172 178 Q 166 220 184 228 Q 192 232 174 250" fill="none" stroke="#003429" strokeWidth="2.8" strokeLinecap="round" />

            <rect x="20" y="328" width="52" height="50" rx="26" fill="#028267" />
          </g>

          {/* 4. Credit Card */}
          <g transform="translate(675, 415) rotate(42) translate(-111, -270)">
            <rect x="0" y="0" width="222" height="342" rx="28" fill="#13519c" />

            <g clipPath={`url(#${cardClipId})`}>
              <polygon points="126,-20 152,-20 -20,326 -46,326" fill="#ffffff" />

              <rect x="126" y="60" width="58" height="68" rx="14" fill="#e5a12f" />

              <circle cx="36" cy="230" r="24" fill="#027e74" />
            </g>
          </g>
        </g>

        <g id="hand-foreground">
          {/* Hand foreground content can be added here */}
        </g>
      </g>
    </svg>
  );
}
