/**
 * Material-style filled icon (24px grid): a white Card of Hope with the cup-of-hope logo on it,
 * a little heart rising like steam, and a blush card tilted behind to suggest a collection.
 */
export default function CupCardIcon({
  className = "h-6 w-6",
  card = "#fffdf8",
  cup = "#fbdc08",
  edge = "#e2a800",
  heart = "#ff6f8e",
  back = "#ffd3df",
  stack = true,
}: {
  className?: string;
  card?: string;
  cup?: string;
  edge?: string;
  heart?: string;
  back?: string;
  stack?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden data-anim="flip">
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
      {/* a little heart rising like steam */}
      <path d="M10.45 9.05c-.55-.48-1.45-1.1-1.45-1.85 0-.48.38-.85.85-.85.27 0 .45.1.6.3.15-.2.33-.3.6-.3.47 0 .85.37.85.85 0 .75-.9 1.37-1.45 1.85Z" fill={heart} />
      {/* blush cheeks */}
      <circle cx="8.3" cy="14.1" r=".55" fill={heart} opacity=".45" />
      <circle cx="12.6" cy="14.1" r=".55" fill={heart} opacity=".45" />
    </svg>
  );
}
