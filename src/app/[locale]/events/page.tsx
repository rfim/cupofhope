import type { Metadata } from "next";
import ConnectCta from "@/components/ConnectCta";
import EventsTabs from "@/components/EventsTabs";
import { pastEvents, upcomingEvents } from "@/data";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.events_title, description: m.events_description, alternates: { canonical: `/${locale}/events` } };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <>
      <section className="mx-auto max-w-[900px] px-6 pb-20 pt-40 text-center md:pb-36 md:pt-52">
        <h1 className="text-4xl font-semibold md:text-5xl">{dict.events_page.title}</h1>
        <p className="mx-auto mt-5 max-w-[580px] text-lg leading-relaxed text-neutral-600">{dict.events_page.subtitle}</p>
      </section>
      <section className="mx-auto max-w-[940px] px-6">
        <EventsTabs upcoming={upcomingEvents} past={pastEvents} locale={locale} dict={dict} />
      </section>
      <ConnectCta dict={dict} />
    </>
  );
}
