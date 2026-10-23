"use client";

import { useEffect, useState } from "react";
import type { DrawResult } from "@/lib/collection";
import type { Dictionary, Locale } from "@/i18n";
import { asset } from "@/lib/asset";
import HopeCard, { RARITY_STYLE } from "./HopeCard";

type Stage = "sealed" | "tearing" | "rising" | "revealed";

/**
 * Pack opening: tap the sealed foil pack, it tears open, the card rises face-down and flips.
 * `draw` is only called when the pack is opened, so closing early never spends the daily card.
 */
export default function PackOpening({ draw, total, locale, dict, title, onClose, onViewCollection }: {
  draw: () => DrawResult | null;
  total: number;
  locale: Locale;
  dict: Dictionary;
  title: string;
  onClose: () => void;
  onViewCollection?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [result, setResult] = useState<DrawResult | null>(null);
  const t = dict.cards;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const open = () => {
    if (stage !== "sealed") return;
    const r = draw();
    if (!r) return onClose();
    setResult(r);
    navigator.vibrate?.(30);
    setStage("tearing");
    setTimeout(() => setStage("rising"), 650);
    setTimeout(() => {
      setStage("revealed");
      navigator.vibrate?.([20, 40, 60]);
    }, 1500);
  };

  const rarity = result ? RARITY_STYLE[result.card.rarity] : null;
  const glow = rarity?.gem ?? "#fbdc08";

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden bg-[#14120f]/95 px-6 text-white backdrop-blur-md animate-fade-in" role="dialog" aria-modal aria-label={t.daily_pack}>
      <button onClick={onClose} aria-label={t.close} className="absolute right-5 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /></svg>
      </button>

      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>

      <div className="relative flex h-[min(110vw,470px)] w-[min(72vw,300px)] items-center justify-center">
        {/* rarity glow */}
        {stage === "revealed" && (
          <div className="pack-burst absolute inset-[-30%] rounded-full" style={{ background: `radial-gradient(circle, ${glow}66 0%, ${glow}22 35%, transparent 65%)` }} />
        )}
        {stage === "revealed" &&
          Array.from({ length: 14 }, (_, i) => (
            <span
              key={i}
              className="pack-spark absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
              style={{ background: i % 2 ? glow : "#fff", "--a": `${(i / 14) * 360}deg`, animationDelay: `${(i % 5) * 40}ms` } as React.CSSProperties}
            />
          ))}

        {/* the card, rising out of the pack and flipping */}
        {result && stage !== "sealed" && stage !== "tearing" && (
          <div className="absolute inset-x-0" style={{ perspective: 1200 }}>
            <div
              className="relative transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{
                transformStyle: "preserve-3d",
                transform: stage === "revealed" ? "translateY(0) rotateY(0deg) scale(1)" : "translateY(18%) rotateY(180deg) scale(.92)",
              }}
            >
              <div style={{ backfaceVisibility: "hidden" }}>
                <HopeCard card={result.card} total={total} />
              </div>
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <HopeCard card={result.card} total={total} face="back" />
              </div>
            </div>
          </div>
        )}

        {/* the sealed foil pack */}
        {stage !== "revealed" && stage !== "rising" && (
          <button
            onClick={open}
            aria-label={t.tap_to_open}
            className={`pack absolute inset-0 overflow-hidden rounded-[22px] ${stage === "sealed" ? "pack-idle" : "pack-tear"}`}
          >
            <span className="pack-foil absolute inset-0" />
            <span className="pack-top absolute inset-x-0 top-0 h-[14%] border-b-2 border-dashed border-black/20" />
            <span className="relative flex h-full flex-col items-center justify-center text-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/images/logos/coh_logo_full.png")} alt="" className="w-[46%] mix-blend-multiply" draggable={false} />
              <span className="mt-6 font-script text-3xl leading-none">Card of Hope</span>
              <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black/55">{t.daily_pack}</span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-8 min-h-[120px] text-center">
        {stage === "sealed" && <p className="animate-pulse text-sm text-white/70">{t.tap_to_open}</p>}
        {stage === "revealed" && result && (
          <div className="animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: glow }}>
              {result.isNew ? t.new_card : t.rarity[result.card.rarity]} · {t.rarity[result.card.rarity]}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{result.card[locale].title}</h2>
            {!result.isNew && <p className="mt-1 text-sm text-white/60">{t.duplicate}</p>}
            <div className="mt-5 flex justify-center gap-3">
              {onViewCollection && (
                <button onClick={onViewCollection} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black">{t.view_collection}</button>
              )}
              <button onClick={onClose} className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold">{t.close}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
