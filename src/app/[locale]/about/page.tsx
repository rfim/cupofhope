import type { Metadata } from "next";
import Image from "next/image";
import ConnectCta from "@/components/ConnectCta";
import Reveal from "@/components/Reveal";
import { settings } from "@/data";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.about_title, description: m.about_description, alternates: { canonical: `/${locale}/about` } };
}

const cardBg = "relative overflow-hidden rounded-[32px] text-white";
const swirl = (
  <svg className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 opacity-20" viewBox="0 0 200 200" fill="none" stroke="#fff" aria-hidden>
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M ${20 + i * 14} 200 C ${60 + i * 14} 120, ${120 + i * 8} 90, 200 ${40 + i * 12}`} strokeWidth="1" />
    ))}
  </svg>
);

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const a = dict.about;

  return (
    <>
      <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden px-6 pb-20 pt-36 text-center text-white md:min-h-[900px]">
        <Image src="/images/pages/about/cafe_photo_example.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative -mt-24 max-w-[780px] md:-mt-64">
          <h1 className="text-5xl font-semibold md:text-[72px]">{a.hero_title}</h1>
          <p className="mt-6 leading-relaxed md:text-lg">{a.hero_body}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-6 py-24 md:py-32">
        <h2 className="text-center text-4xl font-semibold md:text-5xl">{a.vm_title}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-10">
          <Reveal className={`${cardBg} bg-brown-700 p-8 md:p-10`}>
            {swirl}
            <h3 className="text-center text-2xl font-semibold md:text-3xl">{a.build_title}</h3>
            {a.build_body.map((p, i) => <p key={i} className="relative mt-8 text-sm leading-relaxed">{p}</p>)}
          </Reveal>
          <Reveal delay={120} className={`${cardBg} bg-brown-500 p-8 md:p-10`}>
            {swirl}
            <h3 className="text-center text-2xl font-semibold md:text-3xl">{a.hope_title}</h3>
            {a.hope_body.map((p, i) => <p key={i} className={`relative text-sm leading-relaxed ${i === 0 ? "mt-8" : "mt-5"}`}>{p}</p>)}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-6 py-16 md:py-24">
        <h2 className="text-center text-4xl font-semibold md:text-5xl">{a.family_title}</h2>
        <p className="mx-auto mt-6 max-w-[880px] text-center leading-relaxed text-neutral-700">{a.family_intro}</p>

        <div className="mt-16 grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-[5/3] overflow-hidden rounded-3xl">
            <Image src="/images/pages/about/family-story1.png" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="space-y-6 leading-relaxed text-neutral-700">
            {a.family_story1.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        <div className="mt-16 grid items-center gap-10 md:mt-24 md:grid-cols-2 md:gap-12">
          <div className="order-2 space-y-6 leading-relaxed text-neutral-700 md:order-1">
            {a.family_story2.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="relative order-1 aspect-[5/3] overflow-hidden rounded-3xl md:order-2">
            <Image src="/images/pages/about/family-story2.png" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-6 py-24 md:py-32">
        <h2 className="text-center text-4xl font-semibold md:text-5xl">{a.impact_title}</h2>
        <p className="mx-auto mt-6 max-w-[780px] text-center leading-relaxed text-neutral-700">{a.impact_body}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3 md:gap-10">
          {settings.stats.map((s, i) => (
            <Reveal key={i} delay={i * 120} className={`${cardBg} ${["bg-brown-700", "bg-brown-500", "bg-[#6e4206]"][i % 3]} px-6 py-12 text-center`}>
              {swirl}
              <p className="relative text-5xl font-semibold md:text-6xl">{s.value}</p>
              <p className="relative mt-4 text-sm">{s[locale]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <ConnectCta dict={dict} />
    </>
  );
}
