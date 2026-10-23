"use client";

import { useEffect, useRef, useState } from "react";
import type { HopeCard as Card } from "@/data";
import HopeCard from "./HopeCard";

type Slot = { card: Card; locked: boolean };

/**
 * A hand of cards fanned along an arc. Drag sideways to browse; the centre card lifts.
 * Tapping the centre card opens it, tapping a side card brings it to the centre.
 */
export default function CardFan({ slots, total, onOpen, initial = 0 }: { slots: Slot[]; total: number; onOpen: (card: Card) => void; initial?: number }) {
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(170);
  const drag = useRef({ x: 0, start: 0, moved: 0, t: 0, v: 0 });

  useEffect(() => setPos(Math.min(initial, Math.max(0, slots.length - 1))), [initial, slots.length]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardW(Math.min(230, Math.max(140, el.clientWidth * 0.46))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = (v: number) => Math.min(slots.length - 1, Math.max(0, v));
  const step = cardW * 0.62;

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: pos, moved: 0, t: performance.now(), v: 0 };
    setDragging(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - drag.current.x;
    const now = performance.now();
    drag.current.v = (dx - drag.current.moved) / Math.max(1, now - drag.current.t);
    drag.current.t = now;
    drag.current.moved = dx;
    // rubber-band past the ends
    const raw = drag.current.start - dx / step;
    const over = raw < 0 ? raw : raw > slots.length - 1 ? raw - (slots.length - 1) : 0;
    setPos(raw - over * 0.7);
  };

  const onUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const { moved, v } = drag.current;
    if (Math.abs(moved) < 6) {
      // treat as a tap on whichever card is under the finger
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]");
      const i = target ? Number(target.dataset.slot) : Math.round(pos);
      if (i === Math.round(pos) && !slots[i].locked) onOpen(slots[i].card);
      else setPos(i);
      return;
    }
    setPos(clamp(Math.round(pos - v * 4)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setPos((p) => clamp(Math.round(p) + 1));
    if (e.key === "ArrowLeft") setPos((p) => clamp(Math.round(p) - 1));
    if (e.key === "Enter" && !slots[Math.round(pos)]?.locked) onOpen(slots[Math.round(pos)].card);
  };

  return (
    <div
      ref={wrap}
      role="listbox"
      tabIndex={0}
      aria-label="Cards of Hope"
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative mx-auto w-full touch-pan-y select-none outline-none"
      style={{ height: cardW * 1.4 + 56 }}
    >
      {slots.map((slot, i) => {
        const o = i - pos;
        const a = Math.abs(o);
        if (a > 3.2) return null;
        const x = o * step;
        const y = a * a * 9 + (a < 0.5 ? -10 * (1 - a * 2) : 0);
        const rot = o * 9;
        const scale = 1 - Math.min(a, 3) * 0.08;
        return (
          <div
            key={slot.card.number}
            data-slot={i}
            role="option"
            aria-selected={a < 0.5}
            className="absolute left-1/2 top-6 origin-bottom will-change-transform"
            style={{
              width: cardW,
              marginLeft: -cardW / 2,
              zIndex: 100 - Math.round(a * 10),
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.5s cubic-bezier(.2,.8,.2,1)",
              filter: a > 0.5 ? `saturate(${1 - a * 0.12})` : undefined,
            }}
          >
            <HopeCard card={slot.card} total={total} locked={slot.locked} compact={a > 0.5} className="pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
