import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { ArrowRightIcon, CalendarIcon, ClockIcon, PinIcon } from "./Icons";

export function EventMeta({ event }: { event: Event }) {
  return (
    <ul className="space-y-1 text-[15px] text-neutral-600">
      <li className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary-400" />{event.date}</li>
      <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-primary-400" />{event.time}</li>
      <li className="flex items-center gap-2"><PinIcon className="h-4 w-4 text-primary-400" />{event.location}</li>
    </ul>
  );
}

export default function EventCard({ event, locale, dict, image }: { event: Event; locale: Locale; dict: Dictionary; image?: string }) {
  return (
    <article className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6">
      <div className="relative aspect-[2/1] overflow-hidden rounded-xl">
        <Image src={image ?? event.image} alt={event[locale].title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
      </div>
      <h3 className="mt-5 min-h-[3rem] font-semibold leading-snug">{event[locale].title}</h3>
      <div className="mt-6"><EventMeta event={event} /></div>
      <Link
        href={`/${locale}/events/${event.slug}`}
        className="mt-6 flex items-center justify-center gap-2 rounded-full border border-neutral-300 py-2 text-[15px] font-medium text-primary-700 transition-colors hover:border-primary-600"
      >
        {dict.cta.view_event} <ArrowRightIcon />
      </Link>
    </article>
  );
}
