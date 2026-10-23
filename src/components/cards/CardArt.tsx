import type { Motif } from "@/data";

// Simple line drawings used as a faint watermark on each card.
const PATHS: Record<Motif, string> = {
  sun: "M50 34a16 16 0 1 1 0 32a16 16 0 1 1 0-32M50 12v10M50 78v10M12 50h10M78 50h10M23 23l7 7M70 70l7 7M77 23l-7 7M30 70l-7 7",
  heart: "M50 80C26 64 16 50 16 37c0-10 8-18 18-18c7 0 12 4 16 10c4-6 9-10 16-10c10 0 18 8 18 18c0 13-10 27-34 43Z",
  leaf: "M22 78C22 42 44 20 80 18c0 36-22 60-58 60ZM22 78L60 40",
  cup: "M22 42h46v14a20 20 0 0 1-20 20h-6a20 20 0 0 1-20-20ZM68 48h6a8 8 0 0 1 0 16h-8M36 20c-3 5 3 8 0 14M50 18c-3 5 3 8 0 14",
  star: "M50 14l10 24l26 2l-20 17l6 25l-22-14l-22 14l6-25l-20-17l26-2Z",
  wave: "M10 44c10-10 20-10 30 0s20 10 30 0s20-10 30 0M10 62c10-10 20-10 30 0s20 10 30 0s20-10 30 0",
  mountain: "M8 80l28-42l14 20l12-16l30 38ZM62 28a6 6 0 1 1 0 .1",
  home: "M18 48L50 20l32 28M26 42v38h48V42M42 80V60h16v20",
  door: "M28 84V40a22 22 0 0 1 44 0v44ZM28 84h44M58 60h.1",
  drop: "M50 14C38 34 28 46 28 60a22 22 0 0 0 44 0C72 46 62 34 50 14Z",
  spark: "M50 12c3 22 12 32 34 38c-22 3-31 13-34 38c-3-25-12-35-34-38c22-6 31-16 34-38Z",
  flower: "M50 40a10 10 0 1 1 0 .1M50 30c-8-14 8-22 0 0M50 30c8-14-8-22 0 0M60 46c14-6 18 12 0 4M40 46c-14-6-18 12 0 4M44 58c-8 12 6 18 6 6M56 58c8 12-6 18-6 6M50 60v26",
};

export default function CardArt({ motif, color, className = "" }: { motif: Motif; color: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[motif]} />
    </svg>
  );
}

export const MOTIFS = Object.keys(PATHS) as Motif[];
