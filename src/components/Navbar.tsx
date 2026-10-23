"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WHATSAPP_URL, type Dictionary, type Locale } from "@/i18n";
import { CloseIcon, MenuIcon } from "./Icons";

export default function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rest = pathname.replace(/^\/(en|id)/, "");

  const isActive = (href: string) => (href === `/${locale}` ? rest === "" || rest === "/" : pathname.startsWith(href));

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/events`, label: dict.nav.events },
    { href: `/${locale}/article`, label: dict.nav.article },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-20">
      <nav className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between rounded-full border border-neutral-200 bg-white/95 px-6 backdrop-blur">
        <Link href={`/${locale}`} aria-label="Cup of Hope" className="shrink-0">
          <Image src="/images/logos/coh_logo.png" alt="Cup of Hope" width={36} height={36} priority />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`relative text-[15px] font-medium transition-colors hover:text-primary-700 ${isActive(l.href) ? "text-primary-700 after:absolute after:-bottom-1.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary-600" : "text-neutral-800"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href={`/en${rest}`} className={locale === "en" ? "font-semibold text-black" : "text-neutral-500"}>EN</Link>
            <span className="text-neutral-300">|</span>
            <Link href={`/id${rest}`} className={locale === "id" ? "font-semibold text-black" : "text-neutral-500"}>ID</Link>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-neutral-300 px-6 py-2.5 text-[15px] font-medium text-primary-700 transition-colors hover:border-primary-600 md:inline-block"
          >
            {dict.cta.contact_us}
          </a>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-[1280px] rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg md:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className={`text-base font-medium ${isActive(l.href) ? "text-primary-700" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded-full border border-neutral-300 py-2.5 text-center font-medium text-primary-700"
          >
            {dict.cta.contact_us}
          </a>
        </div>
      )}
    </header>
  );
}
