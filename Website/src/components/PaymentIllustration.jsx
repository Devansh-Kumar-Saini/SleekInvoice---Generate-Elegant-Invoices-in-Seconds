import React, { useId } from "react";

export default function PaymentIllustration({
  className = "features-payment-svg",
  style,
  ...props
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const paymentShadowId = `payment-shadow-${id}`;
  const cardShadowId = `card-shadow-${id}`;

  return (
    <svg
      className={className}
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Payment methods illustration showing QR payment, payment card, and cancelled cheque"
      style={{
        maxWidth: 220,
        width: "100%",
        height: "auto",
        margin: "0 auto",
        display: "block",
        ...style,
      }}
      {...props}
    >
      <defs>
        <filter
          id={paymentShadowId}
          x="-20%"
          y="-20%"
          width="140%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="7"
            floodColor="#18181B"
            floodOpacity="0.08"
          />
        </filter>

        <filter
          id={cardShadowId}
          x="-20%"
          y="-20%"
          width="140%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor="#18181B"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      {/* =========================
          SOFT BACKGROUND
      ========================== */}
      <path
        d="M62 91C45 132 37 184 63 218C91 255 154 271 220 263C283 256 337 229 350 187C365 139 341 92 302 66C262 39 208 36 161 48C112 60 77 61 62 91Z"
        fill="#F4F4F5"
      />

      <path
        d="M91 244C137 270 223 278 291 248"
        stroke="#E4E4E7"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* =========================
          LEFT — QR PAYMENT
      ========================== */}
      <g filter={`url(#${paymentShadowId})`}>
        {/* Sleeve */}
        <path d="M38 320L52 247L94 256L82 320H38Z" fill="#27272A" />

        {/* Wrist */}
        <path d="M54 247L62 205L88 213L94 256L54 247Z" fill="#D4D4D8" />

        {/* Phone */}
        <g transform="rotate(-11 75 155)" filter={`url(#${cardShadowId})`}>
          <rect
            x="37"
            y="98"
            width="76"
            height="124"
            rx="14"
            fill="#18181B"
          />

          <rect
            x="41"
            y="103"
            width="68"
            height="114"
            rx="10"
            fill="white"
          />

          {/* Speaker */}
          <rect
            x="65"
            y="108"
            width="20"
            height="3"
            rx="1.5"
            fill="#D4D4D8"
          />

          {/* Screen Header */}
          <rect
            x="51"
            y="119"
            width="48"
            height="5"
            rx="2.5"
            fill="#F4F4F5"
          />

          {/* QR Container */}
          <rect
            x="50"
            y="132"
            width="50"
            height="50"
            rx="5"
            fill="#FAFAFA"
            stroke="#E4E4E7"
            strokeWidth="1"
          />

          {/* QR — Top Left */}
          <rect
            x="54"
            y="136"
            width="12"
            height="12"
            rx="2"
            fill="#18181B"
          />
          <rect
            x="56.5"
            y="138.5"
            width="7"
            height="7"
            rx="1"
            fill="white"
          />
          <rect
            x="58.5"
            y="140.5"
            width="3"
            height="3"
            fill="#18181B"
          />

          {/* QR — Top Right */}
          <rect
            x="84"
            y="136"
            width="12"
            height="12"
            rx="2"
            fill="#18181B"
          />
          <rect
            x="86.5"
            y="138.5"
            width="7"
            height="7"
            rx="1"
            fill="white"
          />
          <rect
            x="88.5"
            y="140.5"
            width="3"
            height="3"
            fill="#18181B"
          />

          {/* QR — Bottom Left */}
          <rect
            x="54"
            y="154"
            width="12"
            height="12"
            rx="2"
            fill="#18181B"
          />
          <rect
            x="56.5"
            y="156.5"
            width="7"
            height="7"
            rx="1"
            fill="white"
          />
          <rect
            x="58.5"
            y="158.5"
            width="3"
            height="3"
            fill="#18181B"
          />

          {/* QR Matrix */}
          <rect
            x="70"
            y="136"
            width="4"
            height="7"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="76"
            y="136"
            width="5"
            height="4"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="70"
            y="146"
            width="9"
            height="4"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="80"
            y="146"
            width="4"
            height="7"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="87"
            y="151"
            width="8"
            height="4"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="69"
            y="155"
            width="5"
            height="8"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="76"
            y="157"
            width="8"
            height="4"
            rx="1"
            fill="#18181B"
          />
          <rect
            x="86"
            y="159"
            width="9"
            height="6"
            rx="1"
            fill="#18181B"
          />

          {/* Payment Label */}
          <rect
            x="56"
            y="190"
            width="36"
            height="4"
            rx="2"
            fill="#E4E4E7"
          />

          {/* Home Indicator */}
          <rect
            x="64"
            y="207"
            width="28"
            height="3"
            rx="1.5"
            fill="#E4E4E7"
          />
        </g>

        {/* Thumb */}
        <path
          d="M72 198C74 184 84 178 91 185C97 192 91 210 81 216C76 218 70 211 72 198Z"
          fill="#E4E4E7"
        />

        {/* Thumb highlight */}
        <path
          d="M79 190C82 186 87 187 89 191"
          stroke="#D4D4D8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* =========================
          CENTER — PAYMENT CARD
      ========================== */}
      <g filter={`url(#${paymentShadowId})`}>
        {/* Sleeve */}
        <path d="M174 320V242H226V320H174Z" fill="#52525B" />

        {/* Sleeve highlight */}
        <path
          d="M181 244V320"
          stroke="#71717A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Wrist */}
        <path d="M179 242L181 188H219L222 242H179Z" fill="#E4E4E7" />

        {/* Payment Card */}
        <g transform="rotate(90 202 120)" filter={`url(#${cardShadowId})`}>
          <rect
            x="155"
            y="120"
            width="96"
            height="62"
            rx="8"
            fill="#18181B"
          />

          {/* Card Accent */}
          <rect x="155" y="130" width="96" height="11" fill="#3F3F46" />

          {/* Chip */}
          <rect
            x="168"
            y="130"
            width="15"
            height="11"
            rx="3"
            fill="#D4D4D8"
          />

          <path
            d="M171 117H180M171 121H180M175 114V125"
            stroke="#A1A1AA"
            strokeWidth="0.8"
          />

          {/* Contactless */}
          <path
            d="M191 117C195 119 195 122 191 125"
            stroke="#A1A1AA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <path
            d="M195 114C201 118 201 123 195 128"
            stroke="#A1A1AA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Card Number */}
          <rect
            x="168"
            y="135"
            width="42"
            height="3"
            rx="1.5"
            fill="#2059e2"
          />

          {/* Card Details */}
          <rect
            x="215"
            y="135"
            width="22"
            height="3"
            rx="1.5"
            fill="#1001e2"
          />
        </g>

        {/* Fingers */}
        <path
          d="M188 174C188 157 196 148 203 154C210 160 209 179 200 187C195 191 188 184 188 174Z"
          fill="#E4E4E7"
        />

        <path
          d="M180 181C180 168 187 161 193 167C199 173 195 188 187 191C183 192 180 187 180 181Z"
          fill="#D4D4D8"
        />

        {/* Finger Detail */}
        <path
          d="M191 164C194 168 194 174 192 178"
          stroke="#C4C4C8"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* =========================
          RIGHT — CANCELLED CHEQUE
      ========================== */}
      <g filter={`url(#${paymentShadowId})`}>
        {/* Sleeve */}
        <path
          d="M310 320L296 246L335 237L351 320H310Z"
          fill="#3F3F46"
        />

        {/* Sleeve seam */}
        <path
          d="M306 250L320 320"
          stroke="#52525B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Wrist */}
        <path
          d="M296 246L293 201L322 193L335 237L296 246Z"
          fill="#A1A1AA"
        />

        {/* Cheque */}
        <g transform="rotate(22 282 112)" filter={`url(#${cardShadowId})`}>
          {/* Paper */}
          <rect
            x="218"
            y="78"
            width="126"
            height="68"
            rx="5"
            fill="white"
            stroke="#D4D4D8"
            strokeWidth="1.5"
          />

          {/* Fold */}
          <path d="M218 78H232V92H218L232 78" fill="#F4F4F5" />

          <path d="M218 92L232 78V92H218Z" fill="#E4E4E7" />

          {/* Bank Mark */}
          <circle cx="241" cy="91" r="4" fill="#71717A" />

          <rect
            x="249"
            y="89"
            width="25"
            height="4"
            rx="2"
            fill="#A1A1AA"
          />

          {/* Date */}
          <rect
            x="310"
            y="86"
            width="27"
            height="9"
            rx="2"
            fill="#FAFAFA"
            stroke="#E4E4E7"
          />

          {/* Payee */}
          <rect
            x="228"
            y="103"
            width="76"
            height="3"
            rx="1.5"
            fill="#E4E4E7"
          />

          {/* Amount */}
          <rect
            x="228"
            y="113"
            width="60"
            height="3"
            rx="1.5"
            fill="#E4E4E7"
          />

          <rect
            x="300"
            y="108"
            width="37"
            height="12"
            rx="2"
            fill="#FAFAFA"
            stroke="#E4E4E7"
          />

          {/* Signature */}
          <path
            d="M276 134C281 126 286 137 291 130C295 125 300 137 305 131C309 127 313 134 318 130"
            fill="none"
            stroke="#71717A"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          {/* MICR */}
          <rect
            x="228"
            y="137"
            width="108"
            height="5"
            rx="1.5"
            fill="#F4F4F5"
          />

          <path
            d="M239 139H273"
            stroke="#A1A1AA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Cancelled Lines */}
          <line
            x1="229"
            y1="91"
            x2="333"
            y2="134"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          <line
            x1="236"
            y1="83"
            x2="340"
            y2="126"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Cancelled Label */}
          <text
            x="225"
            y="120"
            textAnchor="middle"
            transform="rotate(22 285 114)"
            fill="#18181B"
            fontSize="7"
            fontWeight="700"
            letterSpacing="2"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            CANCELLED
          </text>
        </g>

        {/* Fingers */}
        <path
          d="M287 179C285 164 294 154 301 161C309 168 307 188 298 195C293 198 288 190 287 179Z"
          fill="#71717A"
        />

        <path
          d="M298 186C296 174 303 168 309 175C315 182 312 196 304 201C300 202 298 195 298 186Z"
          fill="#52525B"
        />

        {/* Finger Detail */}
        <path
          d="M295 166C299 170 299 176 297 180"
          stroke="#63636B"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* =========================
          GROUNDING DETAILS
      ========================== */}
      <circle cx="108" cy="258" r="2" fill="#D4D4D8" />
      <circle cx="268" cy="264" r="2" fill="#D4D4D8" />
      <circle cx="331" cy="222" r="1.5" fill="#E4E4E7" />
    </svg>
  );
}
