"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WHATSAPP_URL, type Dictionary, type Locale } from "@/i18n";

export default function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|id)/, "");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === `/${locale}` ? rest === "" || rest === "/" : pathname.startsWith(href));

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/menu`, label: "Menu" },
    { href: `/${locale}/cards`, label: dict.nav.cards },
    { href: `/${locale}/events`, label: dict.nav.events },
    { href: `/${locale}/article`, label: dict.nav.article },
  ];

  const langSwitch = (
    <div className="flex items-center rounded-full bg-black/[0.05] p-0.5 text-[11px] font-semibold md:bg-transparent md:p-0 md:text-xs md:font-normal">
      {(["en", "id"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i === 1 && <span className="hidden px-2 text-neutral-300 md:inline">|</span>}
          <Link
            href={`/${l}${rest}`}
            className={`rounded-full px-2.5 py-1 uppercase md:p-0 ${locale === l ? "bg-white text-black shadow-sm md:bg-transparent md:font-semibold md:shadow-none" : "text-neutral-500"}`}
          >
            {l}
          </Link>
        </span>
      ))}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 md:px-20 md:pt-4">
      {/* Phone: slim app bar (navigation lives in the bottom tab bar) */}
      <div
        className={`flex h-14 items-center justify-between px-5 pt-[env(safe-area-inset-top)] transition-colors duration-300 md:hidden ${scrolled ? "bg-white/85 shadow-[0_1px_0_rgb(0_0_0/0.06)] backdrop-blur-xl" : "bg-transparent"}`}
        style={{ boxSizing: "content-box" }}
      >
        <Link href={`/${locale}`} aria-label="Cup of Hope" className="flex items-center gap-2">
          <Image src="/images/logos/coh_logo.png" alt="" width={28} height={28} priority />
          <span className="text-[15px] font-semibold tracking-tight">cup of hope</span>
        </Link>
        {langSwitch}
      </div>

      {/* Tablet & desktop */}
      <nav className="mx-auto hidden h-[68px] max-w-[1280px] items-center justify-between rounded-full border border-neutral-200 bg-white/95 px-6 backdrop-blur md:flex">
        <Link href={`/${locale}`} aria-label="Cup of Hope" className="shrink-0">
          <Image src="/images/logos/coh_logo.png" alt="Cup of Hope" width={36} height={36} priority />
        </Link>

        <ul className="absolute left-1/2 flex -translate-x-1/2 gap-6 lg:gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`relative whitespace-nowrap text-[15px] font-medium transition-colors hover:text-primary-700 ${isActive(l.href) ? "text-primary-700 after:absolute after:-bottom-1.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary-600" : "text-neutral-800"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {langSwitch}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-neutral-300 px-6 py-2.5 text-[15px] font-medium text-primary-700 transition-colors hover:border-primary-600 lg:inline-block"
          >
            {dict.cta.contact_us}
          </a>
        </div>
      </nav>
    </header>
  );
}
