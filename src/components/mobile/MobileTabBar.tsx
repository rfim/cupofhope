"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CupCardIcon from "@/components/cards/CupCardIcon";
import { useCardReady } from "@/components/cards/DailyOrb";
import type { Dictionary, Locale } from "@/i18n";
import { useLongPress } from "@/lib/useLongPress";

const icons = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1Z" />,
  menu: <path d="M5 9h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5ZM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5c-.8 1.2.8 2 0 3.2M12 3.5c-.8 1.2.8 2 0 3.2" />,
  events: <path d="M5 6.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1ZM4 10.5h16M8.5 4v4M15.5 4v4" />,
  stories: <path d="M5 5.5h5.5A2.5 2.5 0 0 1 13 8v11a2 2 0 0 0-2-2H5ZM19 5.5h-3.5A2.5 2.5 0 0 0 13 8v11a2 2 0 0 1 2-2h4Z" />,
};

/** Bottom navigation on phones, with the Cards tab raised in the middle. */
export default function MobileTabBar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const ready = useCardReady();
  const router = useRouter();
  // Easter egg: hold the Cards button for 1.5 s to open the admin PIN pad.
  const hold = useLongPress(() => router.push("/admin/"));
  const t = dict.mobile.tabs;
  const at = (seg: string) => (seg === "" ? /^\/(en|id)\/?$/.test(pathname) : pathname.startsWith(`/${locale}/${seg}`));

  const tab = (seg: string, label: string, icon: React.ReactNode) => {
    const active = at(seg);
    return (
      <Link
        href={`/${locale}${seg ? `/${seg}` : ""}`}
        aria-current={active ? "page" : undefined}
        className={`flex flex-1 flex-col items-center gap-1 pt-2 text-[10px] font-medium transition-colors ${active ? "text-ink" : "text-black/40"}`}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden data-anim="bounce">
          {icon}
        </svg>
        <span>{label}</span>
        <span className={`h-1 w-1 rounded-full bg-primary transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
      </Link>
    );
  };

  const cardsActive = at("cards");

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.06] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex h-[62px] max-w-md items-stretch px-2">
        {tab("", t.home, icons.home)}
        {tab("menu", t.menu, icons.menu)}
        <Link
          href={`/${locale}/cards`}
          aria-current={cardsActive ? "page" : undefined}
          onClick={hold.consumeClick}
          {...hold.handlers}
          draggable={false}
          className="no-callout relative flex flex-1 flex-col items-center text-[10px] font-medium"
        >
          <span
            className={`relative -mt-7 flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-[0_10px_24px_-8px_rgb(224_116_43/0.7)] ring-4 ring-white transition-transform ${cardsActive ? "scale-105" : ""}`}
            style={{ background: "radial-gradient(circle at 32% 28%, #fffbe6 0%, #fde871 30%, #f7b733 70%, #e0742b 100%)" }}
          >
            <CupCardIcon className="h-10 w-10 drop-shadow-[0_2px_3px_rgb(150_80_0/0.35)]" />
            <HoldRing active={hold.holding} />
            {ready && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#e0582b]" aria-label="new" />}
          </span>
          <span className={`mt-1 ${cardsActive ? "text-ink" : "text-black/40"}`}>{t.cards}</span>
        </Link>
        {tab("events", t.events, icons.events)}
        {tab("article", t.stories, icons.stories)}
      </div>
    </nav>
  );
}

/** Thin ring that fills while the button is held (the admin easter egg). */
export function HoldRing({ active, inset = -6 }: { active: boolean; inset?: number }) {
  return (
    <svg className="pointer-events-none absolute -rotate-90 overflow-visible" style={{ inset }} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#1d1b18" strokeWidth="3" strokeLinecap="round" pathLength={100} className={`hold-ring ${active ? "hold-ring-on" : ""}`} />
    </svg>
  );
}
