import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ConnectCta from "@/components/ConnectCta";
import EventCard from "@/components/EventCard";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import { settings, testimonials, upcomingEvents } from "@/data";
import { getDictionary, SITE_URL, type Locale } from "@/i18n";

const eventImages = ["/images/pages/home/mission1.jpg", "/images/pages/home/mission2.jpg", "/images/pages/home/mission3.jpg"];

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.home_title, description: m.home_description, alternates: { canonical: `/${locale}` } };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const h = dict.home;

  const cafe = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "Cup of Hope",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/images/logos/coh_logo.png`,
    image: `${SITE_URL}/images/pages/about/cafe_photo_example.webp`,
    description: dict.metadata.home_description,
    address: { "@type": "PostalAddress", addressLocality: "Surabaya", addressCountry: "ID" },
    email: settings.email,
  };

  return (
    <>
      <JsonLd data={cafe} />
      <section className="bg-grid mx-auto flex min-h-[560px] max-w-[1120px] flex-col items-center justify-center px-6 pb-16 pt-36 text-center md:min-h-[760px]">
        <h1 className="animate-fade-in text-5xl font-semibold leading-[1.1] md:text-[72px]">
          {h.hero_title[0]}<br />{h.hero_title[1]}
        </h1>
        <p className="animate-fade-in mt-8 max-w-[500px] leading-relaxed text-neutral-800 [animation-delay:150ms]">{h.hero_subtitle}</p>
      </section>

      <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-6 py-10 md:grid-cols-2 md:gap-20">
        <Reveal>
          <h2 className="text-4xl font-semibold md:text-5xl">{h.about_title}</h2>
          <p className="mt-6 leading-relaxed text-neutral-800">{h.about_body}</p>
          <Link href={`/${locale}/about`} className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold">
            {dict.cta.view_full_story}
          </Link>
        </Reveal>
        <Reveal delay={150} className="relative aspect-[3/2] overflow-hidden rounded-3xl">
          <Image src="/images/pages/home/mission-intro.png" alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-[1120px] items-start gap-10 px-6 py-24 md:grid-cols-[1fr_1.15fr] md:gap-16 md:py-32">
        <div className="md:pt-4">
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            {h.card_title.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
          <p className="mt-10 max-w-[400px] leading-relaxed text-neutral-800">{h.card_body}</p>
        </div>
        <Reveal delay={150}>
          <Testimonials items={testimonials.map((t) => ({ name: t.name, image: t.image, ...t[locale] }))} />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1120px] px-6 py-10">
        <h2 className="text-center text-4xl font-semibold md:text-5xl">{h.events_title}</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {upcomingEvents.slice(0, 3).map((e, i) => (
            <Reveal key={e.slug} delay={i * 120} className="flex">
              <EventCard event={e} locale={locale} dict={dict} image={eventImages[i]} />
            </Reveal>
          ))}
        </div>
      </section>

      <ConnectCta dict={dict} />
    </>
  );
}
