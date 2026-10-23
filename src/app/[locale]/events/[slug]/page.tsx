import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import EventCard from "@/components/EventCard";
import { CalendarIcon, ClockIcon, PinIcon } from "@/components/Icons";
import { events, getEvent, relatedEvents } from "@/data";
import { getDictionary, locales, WHATSAPP_URL, type Locale } from "@/i18n";

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

  const info = [
    { label: dict.event.location, value: event.location, Icon: PinIcon },
    { label: dict.event.date, value: event.date, Icon: CalendarIcon },
    { label: dict.event.time, value: event.time, Icon: ClockIcon },
  ];

  return (
    <>
      <section className="mx-auto grid max-w-[1050px] gap-10 px-6 pb-16 pt-36 md:grid-cols-[1fr_318px] md:gap-12">
        <div>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{e.title}</h1>
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
                <p className="mt-1 flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-primary-400" />{value}</p>
              </div>
            ))}
            {event.price && (
              <div>
                <p className="text-sm text-neutral-500">{dict.event.ticket_price}</p>
                <p className="mt-1 font-semibold">{event.price}</p>
              </div>
            )}
            {e.includes && (
              <div>
                <p className="text-sm text-neutral-500">{dict.event.includes}</p>
                <ul className="mt-1 list-inside list-disc space-y-1 font-semibold">
                  {e.includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded-full bg-primary py-4 text-center font-semibold transition hover:brightness-95"
          >
            {dict.cta.register_now}
          </a>
        </aside>
      </section>

      <section className="mx-auto max-w-[1050px] px-6 py-16">
        <h2 className="text-3xl font-semibold md:text-4xl">{dict.event.related_title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedEvents(slug).map((r) => <EventCard key={r.slug} event={r} locale={locale} dict={dict} />)}
        </div>
      </section>
    </>
  );
}
