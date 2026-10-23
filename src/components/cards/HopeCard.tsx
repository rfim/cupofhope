import type { HopeCard as Card, Palette, Rarity } from "@/data";
import { asset } from "@/lib/asset";
import CardArt from "./CardArt";

// Styled after the printed Cards of Hope: cream paper, a soft colour wash,
// "reminder for you", the English message with an Indonesian translation, "with love,".

export const PALETTES: Record<Palette, { wash: string; accent: string }> = {
  cream: { wash: "#f1e6cf", accent: "#c9a25c" },
  lilac: { wash: "#e0d9f6", accent: "#9585e0" },
  sky: { wash: "#d6e8f5", accent: "#5f9fd2" },
  mint: { wash: "#d5eedf", accent: "#55ad80" },
  lime: { wash: "#e9f1c6", accent: "#9fb93a" },
  sun: { wash: "#fbeaa6", accent: "#d9a50f" },
  pink: { wash: "#f5dbe9", accent: "#cf77ac" },
  coral: { wash: "#fadacf", accent: "#e06d55" },
  clay: { wash: "#ecdcc7", accent: "#ad7d43" },
};

export const RARITY_STYLE: Record<Rarity, { label: string; gem: string; frame: string | null }> = {
  common: { label: "Common", gem: "#b9b2a6", frame: null },
  rare: { label: "Rare", gem: "#8fb3d9", frame: "linear-gradient(135deg,#f4f4f4,#c9ced6 30%,#ffffff 50%,#aeb4bd 70%,#f2f2f2)" },
  epic: { label: "Epic", gem: "#d6a531", frame: "linear-gradient(135deg,#f7dd8c,#c8952b 30%,#fff2c2 50%,#b9841f 70%,#f5d77d)" },
  legendary: { label: "Legendary", gem: "#e0582b", frame: "linear-gradient(135deg,#f7dd8c,#c8952b 30%,#fff2c2 50%,#b9841f 70%,#f5d77d)" },
};

/** Renders "*highlighted*" phrases in the message in the card's orange. */
export function Message({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="text-[#e0582b]">{part.slice(1, -1)}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function sizeFor(text: string, script: boolean) {
  const n = text.replace(/\*/g, "").length;
  if (script) return n > 110 ? "7cqw" : n > 70 ? "8.2cqw" : "9.4cqw";
  return n > 150 ? "5cqw" : n > 110 ? "5.5cqw" : n > 70 ? "6.2cqw" : "7cqw";
}

type Props = {
  card: Card;
  total: number;
  face?: "front" | "back";
  locked?: boolean;
  /** hides the translation and footer for tiny thumbnails */
  compact?: boolean;
  className?: string;
};

export default function HopeCard({ card, total, face = "front", locked = false, compact = false, className = "" }: Props) {
  const p = PALETTES[card.palette] ?? PALETTES.cream;
  const r = RARITY_STYLE[card.rarity];
  const number = `#${String(card.number).padStart(2, "0")}`;

  if (locked) {
    return (
      <div className={`@container relative aspect-[5/7] overflow-hidden rounded-[7cqw] bg-[#ece8e1] ${className}`}>
        <div className="absolute inset-[4cqw] flex flex-col items-center justify-center rounded-[5cqw] border border-dashed border-black/15">
          <svg viewBox="0 0 24 24" className="h-[14cqw] w-[14cqw] text-black/25" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <p className="mt-[3cqw] text-[6cqw] font-semibold text-black/30">{number}</p>
          <span className="mt-[2cqw] h-[2.4cqw] w-[2.4cqw] rotate-45 rounded-[0.5cqw]" style={{ background: r.gem }} />
        </div>
      </div>
    );
  }

  if (face === "back") {
    return (
      <div className={`@container relative aspect-[5/7] overflow-hidden rounded-[7cqw] bg-primary ${className}`}>
        <div className="absolute inset-[4cqw] flex flex-col items-center justify-center rounded-[5cqw] border border-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/images/logos/coh_logo_full.png")} alt="cup of hope coffee" className="w-[42cqw] mix-blend-multiply" draggable={false} />
          <p className="mt-[8cqw] font-script text-[8cqw] leading-none">Card of Hope</p>
          <p className="mt-[2cqw] text-[3.4cqw] font-medium tracking-[0.3em] text-black/60">{number} / {total}</p>
        </div>
      </div>
    );
  }

  const script = card.style === "script";
  const paper = (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-[7cqw] p-[7cqw] text-[#1d1b18]"
      style={{
        background: `radial-gradient(120% 70% at 100% 100%, ${p.wash} 0%, transparent 60%), linear-gradient(180deg, #fffdf8 35%, ${p.wash} 140%)`,
      }}
    >
      <CardArt motif={card.motif} color={p.accent} className="pointer-events-none absolute -bottom-[6cqw] -right-[8cqw] h-[58cqw] w-[58cqw] opacity-30" />

      <div className="flex items-center gap-[2cqw]">
        <span className="font-script text-[5.2cqw] italic text-black/60">reminder for you</span>
        <span className="h-px flex-1 bg-black/20" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/images/logos/coh_logo.png")} alt="" className="h-[8cqw] w-[8cqw] mix-blend-multiply" draggable={false} />
      </div>

      <div className="relative mt-[7cqw] flex-1">
        <p
          className={script ? "font-script leading-[1.15]" : "font-semibold leading-[1.3] tracking-[-0.01em]"}
          style={{ fontSize: sizeFor(card.en.message, script) }}
        >
          <Message text={card.en.message} />
        </p>
        {!compact && (
          <p className="mt-[4cqw] text-[3.5cqw] italic leading-[1.45] text-black/55">{card.id.message.replace(/\*/g, "")}</p>
        )}
      </div>

      {!compact && (
        <div className="relative mt-[3cqw] flex items-end justify-between">
          <span className="flex items-center gap-[1.6cqw] text-[2.9cqw] font-medium uppercase tracking-[0.14em] text-black/45">
            <span className="h-[2.2cqw] w-[2.2cqw] rotate-45 rounded-[0.4cqw]" style={{ background: r.gem }} />
            {number} · {card.series}
          </span>
          <span className="font-script text-[5cqw] leading-none text-black/70">with love,</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`@container relative aspect-[5/7] rounded-[7cqw] shadow-[0_2px_4px_rgb(0_0_0/0.06),0_12px_30px_-8px_rgb(60_40_10/0.25)] ${className}`}
      style={r.frame ? { background: r.frame, padding: "1.6cqw" } : { background: "#fffdf8" }}
    >
      <div className="relative h-full w-full">
        {paper}
        {card.rarity !== "common" && <div className={`card-sheen pointer-events-none absolute inset-0 rounded-[7cqw] ${card.rarity === "legendary" ? "card-holo" : ""}`} />}
      </div>
    </div>
  );
}
