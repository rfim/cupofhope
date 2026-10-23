"use client";

import { useEffect, useRef, useState } from "react";
import type { HopeCard as Card } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { SITE_URL } from "@/i18n";
import { asset } from "@/lib/asset";
import HopeCard, { RARITY_STYLE } from "./HopeCard";

type Props = {
  card: Card;
  total: number;
  locale: Locale;
  dict: Dictionary;
  collectedOn?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function CardViewer({ card, total, locale, dict, collectedOn, onClose, onPrev, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const t = dict.cards;

  useEffect(() => setFlipped(false), [card.number]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === " ") setFlipped((f) => !f);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  // Gyroscope tilt on phones (iOS asks permission on first tap).
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      setTilt({ rx: Math.max(-14, Math.min(14, (e.beta - 40) * 0.45)), ry: Math.max(-16, Math.min(16, e.gamma * 0.5)), active: true });
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  const requestMotion = () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    D?.requestPermission?.().catch(() => {});
  };

  const onMove = (e: React.PointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 22, ry: px * 26, active: true });
  };

  const onDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
    requestMotion();
  };

  const onUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (e.pointerType === "mouse") setTilt((t) => ({ ...t, active: true }));
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y)) return dx < 0 ? onNext?.() : onPrev?.();
    if (Math.abs(dx) < 8) setFlipped((f) => !f);
  };

  const share = async () => {
    const text = `“${card.en.message.replace(/\*/g, "")}”\n\nCard of Hope #${card.number} · Cup of Hope`;
    const url = `${SITE_URL}/${locale}/cards`;
    try {
      if (navigator.share) await navigator.share({ title: "Card of Hope", text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("✓");
      }
    } catch {
      /* cancelled */
    }
  };

  const sheenX = `${50 + tilt.ry * 3}%`;
  const rarity = RARITY_STYLE[card.rarity];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#14120f]/92 text-white backdrop-blur-md animate-fade-in" role="dialog" aria-modal aria-label={card[locale].title}>
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          #{String(card.number).padStart(2, "0")} / {total}
        </p>
        <button onClick={onClose} aria-label={t.close} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-8" style={{ perspective: 1200 }}>
        <div
          ref={stage}
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerLeave={() => setTilt({ rx: 0, ry: 0, active: false })}
          className={`w-[min(78vw,340px)] touch-none ${tilt.active ? "card-tilting" : ""}`}
          style={
            {
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry + (flipped ? 180 : 0)}deg)`,
              transition: "transform 0.6s cubic-bezier(.2,.8,.2,1)",
              transformStyle: "preserve-3d",
              "--sheen-x": sheenX,
              "--holo-x": `${50 + tilt.ry * 4}%`,
              "--holo-y": `${50 + tilt.rx * 4}%`,
            } as React.CSSProperties
          }
        >
          <div style={{ backfaceVisibility: "hidden" }}>
            <HopeCard card={card} total={total} />
          </div>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <HopeCard card={card} total={total} face="back" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: rarity.gem }}>
          <span className="h-2 w-2 rotate-45 rounded-[2px]" style={{ background: rarity.gem }} />
          {t.rarity[card.rarity]} · {card.series}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{card[locale].title}</h2>
        <p className="mt-1 text-sm text-white/50">
          {collectedOn ? `${t.collected_on} ${new Date(collectedOn).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })} · ` : ""}
          {t.tap_flip}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {onPrev && (
            <button onClick={onPrev} aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
          <button onClick={share} className="flex h-12 items-center gap-2 rounded-full bg-primary px-7 font-semibold text-black">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden data-anim="bounce"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t.share}
          </button>
          {onNext && (
            <button onClick={onNext} aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </div>
        <a href={asset(`/${locale}/cards/`)} className="sr-only">{t.view_collection}</a>
      </div>
    </div>
  );
}
