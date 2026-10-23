"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PHRASE = "opensesame";
export const SECRET_EVENT = "coh:open-sesame";

/**
 * Easter egg: typing "open sesame" anywhere on the site (outside form fields)
 * opens the admin panel. On touch devices, tapping the footer logo 5 times does the same.
 */
export default function SecretTrigger() {
  const router = useRouter();

  useEffect(() => {
    let buffer = "";
    const open = () => router.push("/admin/");

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === " ") return; // "open sesame" and "opensesame" both work
      buffer = (buffer + e.key.toLowerCase()).slice(-PHRASE.length);
      if (buffer === PHRASE) {
        buffer = "";
        open();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener(SECRET_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SECRET_EVENT, open);
    };
  }, [router]);

  return null;
}
