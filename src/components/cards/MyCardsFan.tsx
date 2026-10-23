"use client";

import { useMemo, useState } from "react";
import { cards } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { useCollection } from "@/lib/collection";
import CardFan from "./CardFan";
import CardViewer from "./CardViewer";

/** The visitor's own cards fanned out, padded with locked cards so the hand always looks full. */
export default function MyCardsFan({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const state = useCollection();
  const [open, setOpen] = useState<number | null>(null);

  const slots = useMemo(() => {
    const owned = state?.owned ?? {};
    const mine = cards.filter((c) => owned[c.number]).sort((a, b) => (owned[b.number] ?? "").localeCompare(owned[a.number] ?? ""));
    const locked = cards.filter((c) => !owned[c.number]).slice(0, Math.max(2, 5 - mine.length));
    // newest card in the middle of the hand
    return [...locked.slice(0, Math.ceil(locked.length / 2)).map((card) => ({ card, locked: true })), ...mine.map((card) => ({ card, locked: false })), ...locked.slice(Math.ceil(locked.length / 2)).map((card) => ({ card, locked: true }))];
  }, [state]);

  const firstMine = slots.findIndex((s) => !s.locked);
  const center = firstMine >= 0 ? firstMine : Math.floor(slots.length / 2);
  const current = open != null ? cards.find((c) => c.number === open) : null;

  return (
    <>
      <CardFan slots={slots} total={cards.length} initial={center} onOpen={(c) => setOpen(c.number)} />
      {current && <CardViewer card={current} total={cards.length} locale={locale} dict={dict} collectedOn={state?.owned[current.number]} onClose={() => setOpen(null)} />}
    </>
  );
}
