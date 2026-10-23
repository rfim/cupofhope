"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Press-and-hold detection. Returns pointer handlers to spread on an element, whether a hold
 * is in progress (for a progress ring), and `consumeClick` to swallow the click that follows
 * a completed hold.
 */
export function useLongPress(onLongPress: () => void, ms = 1500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const [holding, setHolding] = useState(false);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    fired.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    setHolding(true);
    timer.current = setTimeout(() => {
      fired.current = true;
      setHolding(false);
      navigator.vibrate?.([30, 50, 80]);
      onLongPress();
    }, ms);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (timer.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 12) cancel();
  };

  /** Call from onClick: returns true (and blocks the click) right after a completed hold. */
  const consumeClick = (e: React.MouseEvent) => {
    if (!fired.current) return false;
    e.preventDefault();
    e.stopPropagation();
    fired.current = false;
    return true;
  };

  return {
    holding,
    consumeClick,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  };
}
