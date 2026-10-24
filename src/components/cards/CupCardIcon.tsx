/**
 * Material-style filled icon (24px grid): a white Card of Hope with the cup-of-hope logo on it,
 * soft light rising from the cup, and a pale gold card tilted behind to suggest a collection.
 */
export default function CupCardIcon({
  className = "h-6 w-6",
  card = "#fffdf8",
  cup = "#fbdc08",
  edge = "#e2a800",
  light = "#e9a900",
  blush = "#ff8fa3",
  back = "#fde9a8",
  stack = true,
}: {
  className?: string;
  card?: string;
  cup?: string;
  edge?: string;
  light?: string;
  blush?: string;
  back?: string;
  stack?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden data-anim="flip">
      <defs>
        <radialGradient id="coh-glow">
          <stop offset="0" stopColor="#fff3b0" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {stack && <rect x="7.4" y="2.8" width="12.6" height="17.2" rx="3.2" fill={back} transform="rotate(13 13.7 11.4)" />}
      <rect x="3.9" y="3.3" width="12.6" height="17.2" rx="3.2" fill={card} />
      {/* cup body */}
      <path
        d="M6.3 11.6c0-1.05 1.85-1.7 4.15-1.7s4.15.65 4.15 1.7v1.75c0 2.45-1.86 4.35-4.15 4.35S6.3 15.8 6.3 13.35Z"
        fill={cup}
        stroke={edge}
        strokeWidth=".45"
        strokeLinejoin="round"
      />
      {/* handle */}
      <path d="M14.55 11.95h.9a1.95 1.95 0 0 1 0 3.9h-1.25v-1.2h1.25a.75.75 0 0 0 0-1.5h-.9Z" fill={cup} stroke={edge} strokeWidth=".45" strokeLinejoin="round" />
      {/* rim opening */}
      <ellipse cx="10.45" cy="11.45" rx="3.2" ry=".72" fill="#fff6c7" />
      {/* soft light rising from the cup */}
      <ellipse cx="10.45" cy="8.9" rx="3.4" ry="3" fill="url(#coh-glow)" />
      <path d="M10.45 5.35v1.3M8.1 6.15l.65.8M12.8 6.15l-.65.8M6.95 8.05l.85.35M13.95 8.05l-.85.35" stroke={light} strokeWidth=".5" strokeLinecap="round" />
      {/* rosy cheeks */}
      <circle cx="8.3" cy="14.1" r=".55" fill={blush} opacity=".5" />
      <circle cx="12.6" cy="14.1" r=".55" fill={blush} opacity=".5" />
    </svg>
  );
}
