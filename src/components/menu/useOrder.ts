"use client";

// The visitor's order list (show it to the barista, or send it on WhatsApp). Saved in localStorage.

import { useCallback, useEffect, useState } from "react";

export type OrderLine = { id: string; name: string; price: number; variant?: string; qty: number };

const KEY = "coh_order_v1";
const EVENT = "coh:order";

const keyOf = (l: Pick<OrderLine, "id" | "variant">) => `${l.id}|${l.variant ?? ""}`;

function read(): OrderLine[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(lines: OrderLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: lines }));
}

export function useOrder() {
  const [lines, setLines] = useState<OrderLine[]>([]);

  useEffect(() => {
    setLines(read());
    const on = (e: Event) => setLines((e as CustomEvent<OrderLine[]>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  const add = useCallback((line: Omit<OrderLine, "qty">, qty = 1) => {
    const cur = read();
    const i = cur.findIndex((l) => keyOf(l) === keyOf(line));
    if (i >= 0) cur[i] = { ...cur[i], qty: cur[i].qty + qty };
    else cur.push({ ...line, qty });
    write(cur);
  }, []);

  const setQty = useCallback((line: OrderLine, qty: number) => {
    write(read().flatMap((l) => (keyOf(l) === keyOf(line) ? (qty > 0 ? [{ ...l, qty }] : []) : [l])));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.price, 0);

  return { lines, add, setQty, clear, count, total };
}

export function orderText(lines: OrderLine[], total: number) {
  return [
    "Cup of Hope order",
    ...lines.map((l) => `${l.qty}× ${l.name}${l.variant ? ` (${l.variant})` : ""} — ${l.qty * l.price}k`),
    `Total: ${total}k`,
  ].join("\n");
}
