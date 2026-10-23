import Image from "next/image";
import Link from "next/link";
import DailyOrb from "@/components/cards/DailyOrb";
import MyCardsFan from "@/components/cards/MyCardsFan";
import { articles, formatDate, formatPrice, menuItems, settings, upcomingEvents } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { mapsUrl } from "@/lib/branches";
import BranchStatus from "./BranchStatus";
import Greeting from "./Greeting";

function SectionHead({ title, href, more }: { title: string; href?: string; more?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between px-5">
      <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
      {href && more && (
        <Link href={href} className="text-sm text-black/45">
          {more} →
        </Link>
      )}
    </div>
  );
}

export default function MobileHome({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const m = dict.mobile;
  const picks = menuItems.filter((i) => i.tags?.includes("rec") && i.image).slice(0, 8);

  return (
    <div className="pb-28 pt-[calc(56px+env(safe-area-inset-top))] md:hidden">
      {/* Hero */}
      <section className="px-5 pt-6">
        <Greeting dict={dict} />
        <h1 className="mt-1 text-[44px] font-semibold leading-[1.02] tracking-[-0.03em]">
          Build Home,
          <br />
          <span className="text-black/30">Bring Hope</span>
        </h1>
      </section>

      {/* Cards */}
      <section className="mt-2 overflow-hidden">
        <MyCardsFan locale={locale} dict={dict} />
        <div className="-mt-2">
          <DailyOrb locale={locale} dict={dict} size={112} />
        </div>
      </section>

      {/* Branches */}
      <section className="mt-12 px-5">
        <div className="divide-y divide-black/[0.06] rounded-[28px] bg-cream">
          {settings.branches.map((b) => (
            <div key={b.name} className="flex items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Cup of Hope {b.name}</p>
                <p className="mt-0.5 truncate text-xs text-black/50">{b.address}</p>
                <BranchStatus branch={b} dict={dict} className="mt-2" />
              </div>
              <a href={mapsUrl(b)} target="_blank" rel="noopener noreferrer" aria-label={`${m.directions} ${b.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden data-anim="bounce">
                  <path d="m4 11 16-7-7 16-2-7Z" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Menu picks */}
      <section className="mt-12">
        <SectionHead title={m.menu_title} href={`/${locale}/menu`} more={dict.cards.see_all} />
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {picks.map((item) => (
            <li key={item.id} className="w-[38%] shrink-0 snap-start">
              <Link href={`/${locale}/menu#${item.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-[22px] bg-cream">
                  <Image src={item.image!} alt={item.name} fill sizes="40vw" className="object-cover" />
                </div>
                <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
                <p className="text-sm text-black/45">{formatPrice(item.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Events */}
      {upcomingEvents.length > 0 && (
        <section className="mt-12">
          <SectionHead title={m.events_title} href={`/${locale}/events`} more={dict.cards.see_all} />
          <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
            {upcomingEvents.slice(0, 6).map((e) => (
              <li key={e.slug} className="w-[78%] shrink-0 snap-start">
                <Link href={`/${locale}/events/${e.slug}`} className="block overflow-hidden rounded-[26px] bg-cream">
                  <div className="relative aspect-[16/9]">
                    <Image src={e.image} alt="" fill sizes="80vw" className="object-cover" />
                    <span className="absolute left-3 top-3 rounded-2xl bg-white/95 px-3 py-1.5 text-center leading-none">
                      <span className="block text-lg font-semibold">{new Date(`${e.date}T00:00:00Z`).getUTCDate()}</span>
                      <span className="block text-[10px] uppercase tracking-wider text-black/50">
                        {new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${e.date}T00:00:00Z`))}
                      </span>
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 font-semibold">{e[locale].title}</p>
                    <p className="mt-1 text-xs text-black/50">{e.time} · {e.location}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Our story */}
      <section className="mt-12 px-5">
        <Link href={`/${locale}/about`} className="relative block overflow-hidden rounded-[28px]">
          <div className="relative aspect-[4/3]">
            <Image src="/images/pages/home/mission-intro.png" alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="font-script text-xl text-white/80">{m.our_story}</p>
            <p className="mt-1 text-lg font-semibold leading-snug">{m.our_story_body}</p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">{m.read_story} →</span>
          </div>
        </Link>
      </section>

      {/* Stories */}
      <section className="mt-12">
        <SectionHead title={m.stories_title} href={`/${locale}/article`} more={dict.cards.see_all} />
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {articles.slice(0, 6).map((a) => (
            <li key={a.slug} className="w-[64%] shrink-0 snap-start">
              <Link href={`/${locale}/article/${a.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                  <Image src={a.image} alt="" fill sizes="65vw" className="object-cover" />
                </div>
                <p className="mt-2 text-xs text-black/45">{formatDate(a.date, locale)}</p>
                <p className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug">{a[locale].title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Connect */}
      <section className="mt-12 px-5">
        <div className="rounded-[28px] bg-ink p-6 text-white">
          <p className="text-xl font-semibold">{dict.connect.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{dict.connect.body}</p>
          <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black">
            {m.chat}
          </a>
        </div>
      </section>
    </div>
  );
}
