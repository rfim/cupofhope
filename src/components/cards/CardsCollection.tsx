"use client";

import { useMemo, useState } from "react";
import { cards, RARITIES, type HopeCard as Card, type Rarity } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { redeemCode, useCollection } from "@/lib/collection";
import CardViewer from "./CardViewer";
import DailyOrb from "./DailyOrb";
import HopeCard, { RARITY_STYLE } from "./HopeCard";

type Filter = "all" | "owned" | Rarity;

export default function CardsCollection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const state = useCollection();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const t = dict.cards;

  const owned = state?.owned ?? {};
  const ownedCount = Object.keys(owned).length;
  const list = useMemo(
    () =>
      cards
        .filter((c) => (filter === "all" ? true : filter === "owned" ? owned[c.number] : c.rarity === filter))
        .sort((a, b) => Number(!!owned[b.number]) - Number(!!owned[a.number]) || a.number - b.number),
    [filter, owned],
  );
  const ownedList = list.filter((c) => owned[c.number]);
  const current = open != null ? cards.find((c) => c.number === open) : null;
  const idx = current ? ownedList.findIndex((c) => c.number === current.number) : -1;

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await redeemCode(code);
    if (!r) return setMsg({ ok: false, text: t.redeem_wrong });
    setMsg({ ok: true, text: `${t.redeem_ok} ${r.card[locale].title}` });
    setCode("");
    setOpen(r.card.number);
  };

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: t.filter_all },
    { id: "owned", label: t.filter_owned },
    ...RARITIES.map((r) => ({ id: r, label: t.rarity[r] })),
  ];

  return (
    <div className="mx-auto max-w-[1060px] px-5 pb-16 pt-24 md:pt-36">
      <header className="text-center">
        <p className="font-script text-2xl text-black/50">reminder for you</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight md:text-6xl">{t.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-black/55">{t.intro}</p>
      </header>

      <section className="mx-auto mt-10 grid max-w-3xl items-center gap-8 rounded-[32px] bg-cream p-6 md:grid-cols-[auto_1fr] md:p-8">
        <DailyOrb locale={locale} dict={dict} />
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">{t.your_cards}</p>
            <p className="text-sm tabular-nums text-black/50">{ownedCount} / {cards.length}</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${(ownedCount / Math.max(1, cards.length)) * 100}%` }} />
          </div>
          <ul className="mt-4 grid grid-cols-4 gap-2 text-center">
            {RARITIES.map((r) => {
              const all = cards.filter((c) => c.rarity === r).length;
              const have = cards.filter((c) => c.rarity === r && owned[c.number]).length;
              return (
                <li key={r} className="rounded-2xl bg-white px-1 py-2.5">
                  <span className="mx-auto block h-2 w-2 rotate-45 rounded-[2px]" style={{ background: RARITY_STYLE[r].gem }} />
                  <p className="mt-1.5 text-sm font-semibold tabular-nums">{have}/{all}</p>
                  <p className="text-[10px] uppercase tracking-wider text-black/45">{t.rarity[r]}</p>
                </li>
              );
            })}
          </ul>
          <form onSubmit={redeem} className="mt-5">
            <p className="text-sm font-medium">{t.redeem_title}</p>
            <p className="text-xs text-black/50">{t.redeem_hint}</p>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setMsg(null);
                }}
                placeholder={t.redeem_placeholder}
                autoCapitalize="characters"
                className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm tracking-widest outline-none focus:border-black/40"
              />
              <button className="rounded-full bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40" disabled={!code.trim()}>
                {t.redeem_button}
              </button>
            </div>
            {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-700" : "text-[#c2410c]"}`}>{msg.text}</p>}
          </form>
        </div>
      </section>

      <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 md:justify-center">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${filter === c.id ? "bg-ink text-white" : "bg-cream text-black/60"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((card: Card) => {
          const have = !!owned[card.number];
          return (
            <li key={card.number}>
              <button
                onClick={() => have && setOpen(card.number)}
                disabled={!have}
                className="tap-card block w-full text-left disabled:cursor-default"
                aria-label={have ? card[locale].title : `${t.locked} #${card.number}`}
              >
                <HopeCard card={card} total={cards.length} locked={!have} compact />
                {have && <p className="mt-2 truncate text-xs font-medium">{card[locale].title}</p>}
              </button>
            </li>
          );
        })}
      </ul>

      {current && (
        <CardViewer
          card={current}
          total={cards.length}
          locale={locale}
          dict={dict}
          collectedOn={owned[current.number]}
          onClose={() => setOpen(null)}
          onPrev={idx > 0 ? () => setOpen(ownedList[idx - 1].number) : undefined}
          onNext={idx >= 0 && idx < ownedList.length - 1 ? () => setOpen(ownedList[idx + 1].number) : undefined}
        />
      )}
    </div>
  );
}
