import Image from "next/image";
import Link from "next/link";
import { formatDate, type Event } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { ArrowRightIcon, CalendarIcon, ClockIcon, PinIcon } from "./Icons";

export function EventMeta({ event, locale }: { event: Event; locale: Locale }) {
  return (
    <ul className="space-y-1 text-[15px] text-neutral-600">
      <li className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 shrink-0 text-primary-400" />{formatDate(event.date, locale)}</li>
      <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 shrink-0 text-primary-400" />{event.time}</li>
      <li className="flex items-center gap-2"><PinIcon className="h-4 w-4 shrink-0 text-primary-400" />{event.location}</li>
    </ul>
  );
}

export default function EventCard({ event, locale, dict, image }: { event: Event; locale: Locale; dict: Dictionary; image?: string }) {
  return (
    <article className="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0_0_0/0.06)]">
      <div className="relative aspect-[2/1] overflow-hidden rounded-xl">
        <Image
          src={image ?? event.image}
          alt={event[locale].title}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className={`object-cover transition duration-500 group-hover:scale-105 ${event.past ? "grayscale-[35%]" : ""}`}
        />
        {event.past && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">{dict.event.ended}</span>
        )}
      </div>
      <h3 className="mt-5 min-h-[3rem] font-semibold leading-snug">{event[locale].title}</h3>
      <div className="mt-6 flex-1"><EventMeta event={event} locale={locale} /></div>
      <Link
        href={`/${locale}/events/${event.slug}`}
        className="mt-6 flex items-center justify-center gap-2 rounded-full border border-neutral-300 py-2 text-[15px] font-medium text-primary-700 transition-colors hover:border-primary-600 hover:bg-primary/10"
      >
        {dict.cta.view_event} <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
