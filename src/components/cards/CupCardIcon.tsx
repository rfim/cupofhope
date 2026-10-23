/**
 * Material-style filled icon (24px grid): a Card of Hope with the cup-of-hope logo on it,
 * and a second card tilted behind to suggest a collection.
 */
export default function CupCardIcon({
  className = "h-6 w-6",
  card = "#1d1b18",
  cup = "#fbdc08",
  back = "rgb(29 27 24 / 0.28)",
  stack = true,
}: {
  className?: string;
  card?: string;
  cup?: string;
  back?: string;
  stack?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden data-anim="flip">
      {stack && <rect x="7.2" y="2.6" width="13" height="17.6" rx="2.6" fill={back} transform="rotate(12 13.7 11.4)" />}
      <rect x="3.8" y="3.2" width="13" height="17.6" rx="2.6" fill={card} />
      {/* cup body */}
      <path
        d="M6.4 10.9c0-1.05 1.83-1.7 4.1-1.7s4.1.65 4.1 1.7v1.9c0 2.43-1.84 4.3-4.1 4.3s-4.1-1.87-4.1-4.3Z"
        fill={cup}
      />
      {/* handle */}
      <path d="M14.5 11.25h.95a1.95 1.95 0 0 1 0 3.9h-1.3v-1.25h1.3a.7.7 0 0 0 0-1.4h-.95Z" fill={cup} />
      {/* rim opening */}
      <ellipse cx="10.5" cy="10.75" rx="3.15" ry=".72" fill={card} />
      {/* steam curl */}
      <path d="M12.95 11.9c.45.3.45.7.1 1s-.35.75.1 1.05" fill="none" stroke={card} strokeWidth=".55" strokeLinecap="round" />
    </svg>
  );
}
