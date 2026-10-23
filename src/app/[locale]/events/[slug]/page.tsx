import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventCard from "@/components/EventCard";
import { ArrowRightIcon, CalendarIcon, ClockIcon, PinIcon } from "@/components/Icons";
import JsonLd from "@/components/JsonLd";
import { eventTimes, events, formatDate, getEvent, googleCalendarUrl, relatedEvents } from "@/data";
import { getDictionary, locales, SITE_URL, WHATSAPP_URL, type Locale } from "@/i18n";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: `${event[locale].title} | Cup of Hope`,
    description: event[locale].body[0],
    alternates: { canonical: `/${locale}/events/${slug}` },
    openGraph: { images: [event.image] },
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { locale, slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();
  const dict = getDictionary(locale);
  const e = event[locale];
  const calendarUrl = event.past ? null : googleCalendarUrl(event, locale);
  const times = eventTimes(event);

  const info = [
    { label: dict.event.location, value: event.location, Icon: PinIcon },
    { label: dict.event.date, value: formatDate(event.date, locale), Icon: CalendarIcon },
    { label: dict.event.time, value: event.time, Icon: ClockIcon },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.body.join(" "),
    image: `${SITE_URL}${event.image}`,
    startDate: times?.start.toISOString() ?? event.date,
    endDate: times?.end.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.location, address: { "@type": "PostalAddress", addressLocality: "Surabaya", addressCountry: "ID" } },
    organizer: { "@type": "Organization", name: "Cup of Hope", url: SITE_URL },
    ...(event.price && { offers: { "@type": "Offer", price: event.price.replace(/\D/g, ""), priceCurrency: "IDR", url: `${SITE_URL}/${locale}/events/${slug}` } }),
  };

  return (
    <>
      <JsonLd data={schema} />
      <section className="mx-auto grid max-w-[1050px] gap-10 px-5 pb-16 pt-20 md:grid-cols-[1fr_318px] md:gap-12 md:px-6 md:pt-36">
        <div>
          <Link href={`/${locale}/events`} className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
            <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" /> {dict.event.back}
          </Link>
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight md:text-5xl md:leading-tight">{e.title}</h1>
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={event.image} alt={e.title} fill priority sizes="(min-width: 768px) 690px, 100vw" className="object-cover" />
          </div>
          <div className="mt-8 space-y-4 leading-[1.9] text-neutral-800">
            {e.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        <aside className="md:sticky md:top-28 md:self-start">
          <div className="space-y-5 rounded-2xl border border-neutral-200 p-6">
            {info.map(({ label, value, Icon }) => (
              <div key={label}>
                <p className="text-sm text-neutral-500">{label}</p>
                <p className="mt-1 flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 shrink-0 text-primary-400" />{value}</p>
              </div>
            ))}
            {event.price && (
              <div>
                <p className="text-sm text-neutral-500">{dict.event.ticket_price}</p>
                <p className="mt-1 font-semibold">{event.price}</p>
              </div>
            )}
            {e.includes && e.includes.length > 0 && (
              <div>
                <p className="text-sm text-neutral-500">{dict.event.includes}</p>
                <ul className="mt-1 list-inside list-disc space-y-1 font-semibold">
                  {e.includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
          {event.past ? (
            <p className="mt-6 rounded-full bg-neutral-100 py-4 text-center font-semibold text-neutral-500">{dict.event.registration_closed}</p>
          ) : (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block rounded-full bg-primary py-4 text-center font-semibold transition hover:brightness-95"
            >
              {dict.cta.register_now}
            </a>
          )}
          {calendarUrl && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-neutral-300 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-600"
            >
              <CalendarIcon className="h-4 w-4 text-primary-600" /> {dict.event.add_to_calendar}
            </a>
          )}
        </aside>
      </section>

      {/* Phones: keep registration one tap away */}
      {!event.past && (
        <div className="fixed inset-x-0 bottom-[calc(62px+env(safe-area-inset-bottom))] z-40 border-t border-black/[0.06] bg-white/95 px-5 py-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{formatDate(event.date, locale)}</p>
              <p className="truncate text-xs text-black/50">{event.time}{event.price ? ` · ${event.price}` : ""}</p>
            </div>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold">
              {dict.cta.register_now}
            </a>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-[1050px] px-5 pb-40 pt-8 md:px-6 md:py-16">
        <h2 className="text-3xl font-semibold md:text-4xl">{dict.event.related_title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedEvents(slug).map((r) => <EventCard key={r.slug} event={r} locale={locale} dict={dict} />)}
        </div>
      </section>
    </>
  );
}
