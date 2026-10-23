"use client";

import { useEffect } from "react";

const INTERACTIVE = 'a, button, [role="button"], [role="option"], label, summary, .tap-card';
const ANIMS = ["pop", "spin", "wiggle", "bounce", "flip"];

/**
 * Site-wide tap feedback. Every interactive element presses in (see `.press` rules in
 * globals.css), and the icon inside it plays a short animation: pop by default, or the one
 * named in its `data-anim` attribute (spin, wiggle, bounce, flip).
 */
export default function TapEffects() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>(INTERACTIVE);
      if (!el || el.matches(":disabled") || el.closest("[data-no-press]")) return;

      const icons = el.querySelectorAll<SVGElement | HTMLElement>("svg, img[data-anim], [data-anim]");
      icons.forEach((icon) => {
        // only icons, not big photos or card artwork
        const box = icon.getBoundingClientRect();
        if (box.width > 64 || box.height > 64) return;
        const kind = icon.getAttribute("data-anim");
        const cls = `icon-${kind && ANIMS.includes(kind) ? kind : "pop"}`;
        icon.classList.remove(cls);
        void (icon as HTMLElement).getBoundingClientRect(); // restart the animation
        icon.classList.add(cls);
        icon.addEventListener("animationend", () => icon.classList.remove(cls), { once: true });
      });

      if (e.pointerType === "touch") navigator.vibrate?.(6);
    };

    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
