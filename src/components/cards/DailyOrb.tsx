"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HoldRing } from "@/components/mobile/MobileTabBar";
import { useLongPress } from "@/lib/useLongPress";
import { cards } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { asset } from "@/lib/asset";
import { canDrawToday, claimWelcome, drawDaily, loadCollection, msUntilNextDraw, useCollection } from "@/lib/collection";
import CupCardIcon from "./CupCardIcon";
import PackOpening from "./PackOpening";

function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
}

/** The orb: a progress ring around a glowing sphere. Tap to open today's pack. */
export default function DailyOrb({ locale, dict, size = 132 }: { locale: Locale; dict: Dictionary; size?: number }) {
  const state = useCollection();
  const [pack, setPack] = useState<"daily" | "welcome" | null>(null);
  const [left, setLeft] = useState(0);
  const t = dict.cards;
  const router = useRouter();
  // Easter egg: hold the orb for 1.5 s to open the admin PIN pad.
  const hold = useLongPress(() => router.push("/admin/"));

  useEffect(() => {
    const tick = () => setLeft(msUntilNextDraw());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const owned = state ? Object.keys(state.owned).length : 0;
  const isNew = state != null && !state.welcomed && owned === 0;
  const ready = state != null && (isNew || canDrawToday(state));
  const progress = cards.length ? owned / cards.length : 0;
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={(e) => !hold.consumeClick(e) && ready && setPack(isNew ? "welcome" : "daily")}
        {...hold.handlers}
        aria-disabled={!ready}
        aria-label={ready ? t.open_pack : `${t.next_pack} ${countdown(left)}`}
        className="no-callout group relative aria-disabled:cursor-default"
        style={{ width: size, height: size }}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={2} className="text-black/10" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#1d1b18"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={`${circ * progress} ${circ}`}
            className="transition-[stroke-dasharray] duration-1000"
          />
        </svg>
        <HoldRing active={hold.holding} inset={2} />
        <span
          className={`orb absolute inset-[12px] rounded-full ${ready ? "orb-ready" : ""} ${ready ? "" : "orb-idle"}`}
          style={{ background: "radial-gradient(circle at 32% 28%, #fffbe6 0%, #fde871 28%, #f7b733 62%, #e0742b 100%)" }}
        />
        <span className="absolute inset-0 flex flex-col items-center justify-center text-[#3b2a06]">
          {ready ? (
            <CupCardIcon className="h-12 w-12 drop-shadow-[0_2px_3px_rgb(90_50_0/0.35)] transition-transform group-active:scale-90" back="rgb(59 42 6 / 0.35)" />
          ) : (
            <>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-70">{t.next_pack}</span>
              <span className="mt-0.5 text-base font-semibold tabular-nums">{countdown(left)}</span>
            </>
          )}
        </span>
      </button>
      <p className="mt-4 text-sm font-medium">{ready ? (isNew ? t.welcome : t.open_pack) : t.come_back}</p>
      <p className="mt-0.5 text-xs text-black/45">
        {owned} / {cards.length} {t.collected}
      </p>

      {pack && (
        <PackOpening
          draw={() => (pack === "welcome" ? claimWelcome() : drawDaily())}
          total={cards.length}
          locale={locale}
          dict={dict}
          title={pack === "welcome" ? t.welcome : t.daily_pack}
          onClose={() => setPack(null)}
          onViewCollection={() => {
            setPack(null);
            if (!location.pathname.includes("/cards")) location.href = asset(`/${locale}/cards/`);
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

/** True when today's (or the welcome) card hasn't been opened yet. Used for the tab-bar badge. */
export function useCardReady() {
  const state = useCollection();
  if (!state) return false;
  return (!state.welcomed && !Object.keys(state.owned).length) || canDrawToday(loadCollection());
}
