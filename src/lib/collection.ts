"use client";

// A visitor's Card of Hope collection, kept in this browser's localStorage.
// One free card per day, a welcome card on the first visit, and cards unlocked with the
// code printed on a physical card from the café.

import { useEffect, useState } from "react";
import { cards, settings, type HopeCard, type Rarity } from "@/data";

const KEY = "coh_cards_v1";
const EVENT = "coh:collection";

export type CollectionState = {
  /** card number → ISO date collected */
  owned: Record<number, string>;
  /** local date (YYYY-MM-DD) of the last daily draw */
  lastDraw?: string;
  welcomed?: boolean;
};

const empty: CollectionState = { owned: {} };

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadCollection(): CollectionState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function save(state: CollectionState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode: collection lasts for this page view only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

export function useCollection() {
  const [state, setState] = useState<CollectionState | null>(null);
  useEffect(() => {
    setState(loadCollection());
    const onChange = (e: Event) => setState((e as CustomEvent<CollectionState>).detail ?? loadCollection());
    const onStorage = (e: StorageEvent) => e.key === KEY && setState(loadCollection());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return state;
}

export const canDrawToday = (s: CollectionState) => s.lastDraw !== todayKey();

export function msUntilNextDraw(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

const WEIGHTS: Record<Rarity, number> = { common: 60, rare: 27, epic: 10, legendary: 3 };

function pickRarity(): Rarity {
  let roll = Math.random() * 100;
  for (const r of Object.keys(WEIGHTS) as Rarity[]) {
    if ((roll -= WEIGHTS[r]) < 0) return r;
  }
  return "common";
}

const random = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export type DrawResult = { card: HopeCard; isNew: boolean };

function grant(state: CollectionState, card: HopeCard, patch: Partial<CollectionState> = {}): DrawResult {
  const isNew = !state.owned[card.number];
  save({ ...state, ...patch, owned: isNew ? { ...state.owned, [card.number]: todayKey() } : state.owned });
  return { card, isNew };
}

/** Today's free card. Prefers cards the visitor doesn't own yet. */
export function drawDaily(): DrawResult | null {
  const state = loadCollection();
  if (!canDrawToday(state) || !cards.length) return null;
  const missing = cards.filter((c) => !state.owned[c.number]);
  const rarity = pickRarity();
  const pool = missing.filter((c) => c.rarity === rarity);
  const card = pool.length ? random(pool) : missing.length ? random(missing) : random(cards);
  return grant(state, card, { lastDraw: todayKey() });
}

/** The welcome card, given once on the first visit. */
export function claimWelcome(): DrawResult | null {
  const state = loadCollection();
  if (state.welcomed || Object.keys(state.owned).length) return null;
  const card = cards.find((c) => c.number === settings.welcomeCard) ?? cards[0];
  if (!card) return null;
  return grant(state, card, { welcomed: true });
}

export async function hashCardCode(code: string) {
  const bytes = new TextEncoder().encode(`cupofhope-card:${code.trim().toUpperCase()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Unlocks the card whose printed code matches. */
export async function redeemCode(code: string): Promise<DrawResult | null> {
  if (!code.trim()) return null;
  const hash = await hashCardCode(code);
  const card = cards.find((c) => c.codeHash === hash);
  return card ? grant(loadCollection(), card) : null;
}
