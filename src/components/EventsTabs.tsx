"use client";

import { useState } from "react";
import type { Event } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import EventCard from "./EventCard";

const PAGE_SIZE = 6;

export default function EventsTabs({ upcoming, past, locale, dict }: { upcoming: Event[]; past: Event[]; locale: Locale; dict: Dictionary }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [shown, setShown] = useState(PAGE_SIZE);
  const list = tab === "upcoming" ? upcoming : past;

  const select = (next: typeof tab) => {
    setTab(next);
    setShown(PAGE_SIZE);
  };

  return (
    <>
      <div className="mx-auto flex w-fit rounded-full border border-neutral-200 p-1.5">
        {(["upcoming", "past"] as const).map((key) => (
          <button
            key={key}
            onClick={() => select(key)}
            className={`rounded-full px-8 py-2 text-sm transition-colors ${tab === key ? "bg-primary font-semibold" : "text-neutral-600 hover:text-black"}`}
          >
            {key === "upcoming" ? dict.events_page.tab_upcoming : dict.events_page.tab_past}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {list.slice(0, shown).map((e) => (
          <EventCard key={e.slug} event={e} locale={locale} dict={dict} />
        ))}
      </div>

      {shown < list.length && (
        <div className="mt-12 text-center">
          <button onClick={() => setShown(shown + PAGE_SIZE)} className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold">
            {dict.cta.load_more}
          </button>
        </div>
      )}
    </>
  );
}
