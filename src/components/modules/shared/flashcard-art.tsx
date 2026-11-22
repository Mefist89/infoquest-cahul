export type FlashcardArtId =
  | "vishing"
  | "social-engineering"
  | "sms-code"
  | "urgency"
  | "phishing"
  | "domain"
  | "https-lock"
  | "pin-cvv"
  | "two-fa"
  | "sessions"
  | "password-leak"
  | "recovery"
  | "prepayment"
  | "trap-price"
  | "ghost-shop"
  | "fake-reviews";

export function FlashcardArt({ art }: { art: FlashcardArtId }) {
  return (
    <div className="grid size-36 place-items-center rounded-3xl border border-neon/25 bg-[radial-gradient(circle_at_50%_40%,rgba(0,217,255,0.18),rgba(6,18,46,0.9))] p-3 shadow-[inset_0_0_24px_rgba(0,217,255,0.12)] sm:size-40">
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        {art === "vishing" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="34" y="14" width="52" height="92" rx="12" fill="#1e3a5f" />
            <rect x="41" y="24" width="38" height="66" rx="5" fill="#0b1f3f" />
            <circle cx="60" cy="48" r="11" fill="#ff5a6e" />
            <path d="M46 74c2-9 26-9 28 0" fill="#ff5a6e" />
            <circle cx="60" cy="98" r="3" fill="#00d9ff" stroke="none" />
            <path d="M92 34c8 6 8 20 0 26M99 26c12 10 12 32 0 42" fill="none" stroke="#ffd166" strokeWidth="4" />
            <path d="M28 34c-8 6-8 20 0 26" fill="none" stroke="#ff5a6e" strokeWidth="4" />
          </g>
        )}
        {art === "social-engineering" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 24h68" stroke="#ffd166" strokeWidth="5" />
            <path d="M40 26v24M60 26v18M80 26v24" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" />
            <path d="M32 54c0-14 56-14 56 0v22c0 16-14 26-28 28-14-2-28-12-28-28z" fill="#a855f7" />
            <circle cx="48" cy="66" r="5.5" fill="#08142b" />
            <circle cx="72" cy="66" r="5.5" fill="#08142b" />
            <path d="M46 82c8 7 20 7 28 0" fill="none" stroke="#ffd166" strokeWidth="4" />
          </g>
        )}
        {art === "sms-code" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="18" y="24" width="84" height="54" rx="14" fill="#00d9ff" />
            <path d="M36 78l-10 16 24-16z" fill="#00d9ff" />
            <circle cx="38" cy="51" r="6" fill="#08142b" />
            <circle cx="53" cy="51" r="6" fill="#08142b" />
            <circle cx="68" cy="51" r="6" fill="#08142b" />
            <circle cx="83" cy="51" r="6" fill="#08142b" />
            <path d="M84 64l18 6v14c0 11-8 18-18 22-10-4-18-11-18-22V70z" fill="#22c55e" />
            <path d="M77 84l5 5 10-11" fill="none" stroke="#08142b" strokeWidth="4" />
          </g>
        )}
        {art === "urgency" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 28l14-10M96 28l-14-10" stroke="#ffd166" strokeWidth="5" />
            <circle cx="60" cy="64" r="36" fill="#ff5a6e" />
            <circle cx="60" cy="64" r="27" fill="#fff7ed" />
            <path d="M60 44v20l14 10" fill="none" stroke="#08142b" strokeWidth="4.5" />
            <circle cx="60" cy="64" r="4" fill="#ff5a6e" />
            <path d="M98 44l10-8-4 12 10-4" fill="none" stroke="#ffd166" strokeWidth="3.5" />
          </g>
        )}
        {art === "phishing" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M60 12v42c0 14-18 14-18 0 0-5 4-8 8-8" fill="none" stroke="#ffd166" strokeWidth="5" />
            <rect x="26" y="64" width="68" height="42" rx="10" fill="#00d9ff" />
            <path d="M28 68l32 22 32-22" fill="none" stroke="#08142b" strokeWidth="4" />
            <circle cx="90" cy="64" r="11" fill="#ff5a6e" />
            <path d="M90 58v7M90 69h.01" stroke="#fff" strokeWidth="3.5" />
          </g>
        )}
        {art === "domain" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="14" y="28" width="92" height="40" rx="12" fill="#1e3a5f" />
            <rect x="22" y="36" width="76" height="24" rx="7" fill="#fff" />
            <path d="M30 48h26" stroke="#22c55e" strokeWidth="5" />
            <path d="M64 48h24" stroke="#ff5a6e" strokeWidth="5" />
            <circle cx="72" cy="70" r="20" fill="#00d9ff" fillOpacity="0.28" stroke="#00d9ff" strokeWidth="4.5" />
            <path d="M87 85l16 16" stroke="#ffd166" strokeWidth="6" />
          </g>
        )}
        {art === "https-lock" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 52V36c0-12 40-12 40 0v16" fill="none" stroke="#ffd166" strokeWidth="7" />
            <rect x="28" y="50" width="64" height="52" rx="14" fill="#22c55e" />
            <circle cx="60" cy="72" r="8" fill="#08142b" />
            <path d="M60 78v12" stroke="#08142b" strokeWidth="5" />
            <circle cx="90" cy="48" r="14" fill="#ff5a6e" />
            <path d="M86 44c0-3 8-3 8 1 0 3-4 3-4 6M90 55h.01" fill="none" stroke="#fff" strokeWidth="3" />
          </g>
        )}
        {art === "pin-cvv" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="14" y="26" width="92" height="62" rx="12" fill="#38bdf8" />
            <rect x="14" y="40" width="92" height="14" fill="#08142b" stroke="none" />
            <rect x="24" y="64" width="38" height="12" rx="4" fill="#fff" />
            <rect x="70" y="62" width="26" height="16" rx="5" fill="#ffd166" />
            <circle cx="88" cy="86" r="16" fill="#ff5a6e" />
            <path d="M81 79l14 14M95 79L81 93" stroke="#fff" strokeWidth="4" />
          </g>
        )}
        {art === "two-fa" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M60 14l38 14v28c0 24-16 40-38 48-22-8-38-24-38-48V28z" fill="#00d9ff" />
            <path d="M60 26l26 10v20c0 17-11 28-26 34-15-6-26-17-26-34V36z" fill="#0b1f3f" />
            <circle cx="52" cy="56" r="9" fill="#ffd166" />
            <path d="M60 56h18M72 56v8" stroke="#ffd166" strokeWidth="4.5" />
            <circle cx="86" cy="86" r="16" fill="#22c55e" />
            <path d="M78 86l5 5 11-11" fill="none" stroke="#08142b" strokeWidth="4" />
          </g>
        )}
        {art === "sessions" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="16" y="24" width="64" height="44" rx="8" fill="#1e3a5f" />
            <rect x="22" y="30" width="52" height="32" rx="4" fill="#00d9ff" />
            <path d="M10 74h76" stroke="#94a3b8" strokeWidth="6" />
            <rect x="68" y="48" width="36" height="56" rx="8" fill="#a855f7" />
            <rect x="74" y="56" width="24" height="36" rx="4" fill="#0b1f3f" />
            <circle cx="94" cy="48" r="12" fill="#ff5a6e" />
            <path d="M89 43l10 10M99 43l-10 10" stroke="#fff" strokeWidth="3.5" />
          </g>
        )}
        {art === "password-leak" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="16" y="34" width="88" height="38" rx="12" fill="#1e3a5f" />
            <circle cx="34" cy="53" r="6" fill="#ffd166" />
            <circle cx="52" cy="53" r="6" fill="#ffd166" />
            <circle cx="70" cy="53" r="6" fill="#ffd166" />
            <circle cx="88" cy="53" r="6" fill="#ff5a6e" />
            <path d="M46 72c0 12-8 14-8 22a8 8 0 0 0 16 0c0-8-8-10-8-22z" fill="#00d9ff" />
            <path d="M76 72c0 10-7 12-7 18a7 7 0 0 0 14 0c0-6-7-8-7-18z" fill="#ff5a6e" />
          </g>
        )}
        {art === "recovery" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="60" r="40" fill="#ff5a6e" />
            <circle cx="60" cy="60" r="22" fill="#0b1f3f" />
            <path d="M60 20v18M60 82v18M20 60h18M82 60h18" stroke="#fff" strokeWidth="8" />
            <circle cx="60" cy="60" r="14" fill="#22c55e" />
            <path d="M54 60l4 4 9-9" fill="none" stroke="#08142b" strokeWidth="3.5" />
          </g>
        )}
        {art === "prepayment" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="20" y="42" width="66" height="40" rx="8" fill="#22c55e" transform="rotate(-10 53 62)" />
            <circle cx="53" cy="62" r="10" fill="#ffd166" />
            <path d="M78 30c12-10 24-4 22 10 8 4 6 16-4 18" fill="none" stroke="#00d9ff" strokeWidth="4" />
            <path d="M84 22l12 2-4 12" fill="none" stroke="#ffd166" strokeWidth="4" />
          </g>
        )}
        {art === "trap-price" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 60l38-38h32v32L56 92a8 8 0 0 1-11 0L24 71a8 8 0 0 1 0-11z" fill="#ffd166" />
            <circle cx="80" cy="36" r="6" fill="#08142b" />
            <path d="M46 58l18 18M64 58L46 76" stroke="#ff5a6e" strokeWidth="5" />
            <circle cx="48" cy="60" r="3.5" fill="#ff5a6e" stroke="none" />
            <circle cx="62" cy="74" r="3.5" fill="#ff5a6e" stroke="none" />
          </g>
        )}
        {art === "ghost-shop" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 42h68l-6-18H32z" fill="#ff5a6e" />
            <path d="M32 54c0-16 56-16 56 0v42l-10-8-9 8-9-8-9 8-9-8-10 8z" fill="#e2e8f0" />
            <circle cx="48" cy="64" r="5" fill="#08142b" />
            <circle cx="72" cy="64" r="5" fill="#08142b" />
            <ellipse cx="60" cy="77" rx="6" ry="4" fill="#08142b" />
          </g>
        )}
        {art === "fake-reviews" && (
          <g stroke="#08142b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="16" y="22" width="88" height="58" rx="14" fill="#1e3a5f" />
            <path d="M40 80l-8 16 22-16z" fill="#1e3a5f" />
            <polygon points="36,36 39,43 47,44 41,49 43,57 36,53 29,57 31,49 25,44 33,43" fill="#ffd166" />
            <polygon points="60,34 64,42 73,43 66,49 68,58 60,53 52,58 54,49 47,43 56,42" fill="#ffd166" />
            <polygon points="84,36 87,43 95,44 89,49 91,57 84,53 77,57 79,49 73,44 81,43" fill="#ffd166" />
            <circle cx="88" cy="78" r="14" fill="#ff5a6e" />
            <path d="M88 71v8M88 83h.01" stroke="#fff" strokeWidth="3.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
