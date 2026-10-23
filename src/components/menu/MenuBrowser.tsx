"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { menu, settings, type MenuCategory, type MenuItem, type MenuTag } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import BranchStatus from "@/components/mobile/BranchStatus";
import { orderText, useOrder, type OrderLine } from "./useOrder";

type Item = MenuItem & { category: string };

const TAG_ICON: Record<MenuTag, string> = { rec: "👍", spicy: "🌶", oat: "🌿", new: "✦" };

function Tags({ tags, dict }: { tags?: MenuTag[]; dict: Dictionary }) {
  if (!tags?.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t === "new" ? "bg-[#e0582b] text-white" : "bg-black/[0.05] text-black/60"}`}>
          {TAG_ICON[t]} {dict.menu.tags[t]}
        </span>
      ))}
    </span>
  );
}

function Thumb({ item, cat, className = "" }: { item: MenuItem; cat: MenuCategory; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-[#f4f1ea] ${className}`}>
      {item.image ? (
        <Image src={item.image} alt={item.name} fill sizes="(min-width: 768px) 400px, 90vw" className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[1.6em] font-semibold tracking-tight text-black/20" aria-hidden>
          {item.name.replace(/^(Ice|Hot)\s+/i, "").charAt(0)}
        </span>
      )}
    </div>
  );
}

export default function MenuBrowser({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.menu;
  const order = useOrder();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(menu.categories[0]?.id);
  const [sheet, setSheet] = useState<Item | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const chips = useRef<HTMLDivElement>(null);
  const sections = useRef<Record<string, HTMLElement | null>>({});

  const all: Item[] = useMemo(() => menu.categories.flatMap((c) => c.groups.flatMap((g) => g.items.map((i) => ({ ...i, category: c.id })))), []);
  const catOf = (id: string) => menu.categories.find((c) => c.id === id)!;
  const q = query.trim().toLowerCase();
  const results = q ? all.filter((i) => i.name.toLowerCase().includes(q) || i.desc?.[locale].toLowerCase().includes(q)) : [];
  const picks = all.filter((i) => i.tags?.includes("rec") && i.image);

  // Open an item linked from elsewhere: /menu#ice-butterscotch
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const item = all.find((i) => i.id === id);
    if (item) setSheet(item);
  }, [all]);

  // Scroll-spy for the category chips
  useEffect(() => {
    if (q) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    Object.values(sections.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [q]);

  useEffect(() => {
    chips.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const jump = (id: string) => {
    setQuery("");
    const el = document.getElementById(`cat-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 118, behavior: "smooth" });
  };

  const quickAdd = (item: Item) => {
    if (item.variants?.length) return setSheet(item);
    order.add({ id: item.id, name: item.name, price: item.price });
    navigator.vibrate?.(15);
  };

  const row = (item: Item) => {
    const cat = catOf(item.category);
    return (
      <li key={item.id} id={item.id}>
        <div className="flex items-center gap-4 py-3.5">
          <button onClick={() => setSheet(item)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
            <Thumb item={item} cat={cat} className="h-[72px] w-[72px] rounded-2xl text-[26px]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium">{item.name}</span>
              {item.desc && <span className="mt-0.5 line-clamp-1 block text-xs text-black/45">{item.desc[locale]}</span>}
              <span className="mt-1.5 flex items-center gap-2">
                <span className="text-sm font-semibold">{item.price}k</span>
                <Tags tags={item.tags} dict={dict} />
              </span>
            </span>
          </button>
          <button
            onClick={() => quickAdd(item)}
            disabled={item.soldOut}
            aria-label={`${t.add} ${item.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg leading-none transition hover:bg-black hover:text-white disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden data-anim="spin"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-[880px] pb-40 pt-[calc(64px+env(safe-area-inset-top))] md:pt-32">
      <header className="px-5">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] md:text-6xl">{t.title}</h1>
        <p className="mt-2 font-script text-xl text-black/50">{t.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
          {settings.branches.map((b) => (
            <span key={b.name} className="flex items-center gap-2 text-xs">
              <span className="font-medium">{b.name}</span>
              <BranchStatus branch={b} dict={dict} />
            </span>
          ))}
        </div>
      </header>

      {/* sticky search + chips */}
      <div className="sticky top-[calc(56px+env(safe-area-inset-top))] z-30 mt-5 bg-white/90 pb-3 pt-2 backdrop-blur-xl md:top-[92px]">
        <div className="px-5">
          <label className="flex items-center gap-2 rounded-full bg-[#f4f1ea] px-4 py-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/40" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/35" type="search" />
          </label>
        </div>
        {!q && (
          <div ref={chips} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
            {menu.categories.map((c) => (
              <button
                key={c.id}
                data-cat={c.id}
                onClick={() => jump(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${active === c.id ? "bg-ink text-white" : "bg-[#f4f1ea] text-black/60"}`}
              >
                {locale === "id" ? c.id_name : c.en}
              </button>
            ))}
          </div>
        )}
      </div>

      {q ? (
        <section className="px-5">
          {results.length ? <ul className="divide-y divide-black/[0.06]">{results.map(row)}</ul> : <p className="py-16 text-center text-sm text-black/40">{t.no_results} “{query}”</p>}
        </section>
      ) : (
        <>
          {/* Student treats */}
          <section className="mt-3 px-5">
            <div className="overflow-hidden rounded-[28px] bg-primary p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50">Promo</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{menu.promo[locale].title}</p>
                  <p className="mt-1 text-sm text-black/60">{menu.promo[locale].body}</p>
                </div>
                <span className="shrink-0 rounded-full bg-ink px-3 py-2 text-sm font-semibold text-white">{menu.promo.price}k</span>
              </div>
              <ul className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
                {menu.promo.images.map((src, i) => (
                  <li key={src} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/50">
                    <Image src={src} alt={menu.promo.items[i] ?? ""} fill sizes="80px" className="object-cover" />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Picks */}
          <section className="mt-8">
            <h2 className="px-5 text-lg font-semibold">{t.picks}</h2>
            <ul className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
              {picks.map((item) => (
                <li key={item.id} className="w-[42%] shrink-0 snap-start sm:w-48">
                  <button onClick={() => setSheet(item)} className="block w-full text-left">
                    <Thumb item={item} cat={catOf(item.category)} className="aspect-square w-full rounded-[22px] text-5xl" />
                    <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-black/45">{item.price}k</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {menu.categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} ref={(el) => { sections.current[cat.id] = el; }} className="mt-10 scroll-mt-32 px-5">
              <h2 className="text-[26px] font-semibold tracking-tight">{locale === "id" ? cat.id_name : cat.en}</h2>
              {cat.groups.map((g) => (
                <div key={g.en} className="mt-4">
                  {cat.groups.length > 1 && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{locale === "id" ? g.id_name : g.en}</p>}
                  {g.note && <p className="mt-1 text-xs text-black/45">{g.note[locale]}</p>}
                  <ul className="mt-1 divide-y divide-black/[0.06] md:grid md:grid-cols-2 md:gap-x-8 md:divide-y-0">{g.items.map((i) => row({ ...i, category: cat.id }))}</ul>
                </div>
              ))}
              {cat.addons && (
                <p className="mt-3 rounded-2xl bg-[#f4f1ea] px-4 py-3 text-xs text-black/55">
                  <span className="font-semibold text-black/70">{t.addons}</span> · {cat.addons}
                </p>
              )}
            </section>
          ))}
          <p className="mt-10 px-5 text-center text-xs text-black/40">{t.note}<br />{t.closed_sunday}</p>
        </>
      )}

      {/* Floating order bar */}
      {order.count > 0 && !orderOpen && (
        <div className="fixed inset-x-0 bottom-[calc(74px+env(safe-area-inset-bottom))] z-40 px-4 md:bottom-6">
          <button onClick={() => setOrderOpen(true)} className="animate-fade-in mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-ink py-3 pl-5 pr-3 text-white shadow-[0_16px_40px_-12px_rgb(0_0_0/0.5)]">
            <span className="text-sm">
              <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-black">{order.count}</span>
              {t.order_title}
            </span>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">{order.total}k →</span>
          </button>
        </div>
      )}

      {sheet && <ItemSheet item={sheet} cat={catOf(sheet.category)} dict={dict} locale={locale} onClose={() => { setSheet(null); history.replaceState(null, "", location.pathname); }} onAdd={(variant, qty) => { order.add({ id: sheet.id, name: sheet.name, price: sheet.price, variant }, qty); setSheet(null); }} />}
      {orderOpen && <OrderSheet dict={dict} order={order} onClose={() => setOrderOpen(false)} />}
    </div>
  );
}

function Sheet({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center" role="dialog" aria-modal aria-label={label}>
      <button className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div
        className="sheet-up relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[32px] bg-white pb-[env(safe-area-inset-bottom)] md:rounded-[32px]"
        style={{ transform: drag ? `translateY(${drag}px)` : undefined, transition: start.current == null ? "transform .3s" : "none" }}
      >
        <div
          className="sticky top-0 z-10 flex justify-center pb-2 pt-3"
          onPointerDown={(e) => {
            start.current = e.clientY;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => start.current != null && setDrag(Math.max(0, e.clientY - start.current))}
          onPointerUp={() => {
            if (drag > 90) onClose();
            start.current = null;
            setDrag(0);
          }}
        >
          <span className="h-1.5 w-10 rounded-full bg-black/15" />
        </div>
        {children}
      </div>
    </div>
  );
}

function ItemSheet({ item, cat, dict, locale, onClose, onAdd }: { item: Item; cat: MenuCategory; dict: Dictionary; locale: Locale; onClose: () => void; onAdd: (variant: string | undefined, qty: number) => void }) {
  const t = dict.menu;
  const [variant, setVariant] = useState(item.variants?.[0]);
  const [qty, setQty] = useState(1);

  return (
    <Sheet onClose={onClose} label={item.name}>
      <div className="px-6 pb-6">
        {item.image && <Thumb item={item} cat={cat} className="aspect-square w-full rounded-[28px]" />}
        <div className={`${item.image ? "mt-5" : "mt-2"} flex items-start justify-between gap-4`}>
          <h3 className="text-2xl font-semibold tracking-tight">{item.name}</h3>
          <p className="shrink-0 text-xl font-semibold">{item.price}k</p>
        </div>
        <div className="mt-2"><Tags tags={item.tags} dict={dict} /></div>
        {item.desc && <p className="mt-3 leading-relaxed text-black/60">{item.desc[locale]}</p>}

        {item.variants && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{t.variant}</p>
            <div className="mt-2 flex gap-2">
              {item.variants.map((v) => (
                <button key={v} onClick={() => setVariant(v)} className={`rounded-full px-5 py-2 text-sm capitalize transition-colors ${variant === v ? "bg-ink text-white" : "bg-[#f4f1ea] text-black/60"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
        {cat.addons && <p className="mt-4 text-xs text-black/45"><span className="font-semibold">{t.addons}</span> · {cat.addons}</p>}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-full bg-[#f4f1ea]">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-12 text-xl" aria-label="−">−</button>
            <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="h-12 w-12 text-xl" aria-label="+">+</button>
          </div>
          <button onClick={() => onAdd(variant, qty)} disabled={item.soldOut} className="h-12 flex-1 rounded-full bg-ink font-semibold text-white disabled:opacity-40">
            {item.soldOut ? t.sold_out : `${t.add} · ${item.price * qty}k`}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function OrderSheet({ dict, order, onClose }: { dict: Dictionary; order: ReturnType<typeof useOrder>; onClose: () => void }) {
  const t = dict.menu;
  const [copied, setCopied] = useState(false);
  const text = orderText(order.lines, order.total);
  const wa = settings.whatsappNumber?.replace(/\D/g, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <Sheet onClose={onClose} label={t.order_title}>
      <div className="px-6 pb-6">
        <h3 className="text-2xl font-semibold tracking-tight">{t.order_title}</h3>
        <p className="mt-1 text-sm text-black/50">{t.order_hint}</p>
        {order.lines.length ? (
          <ul className="mt-5 divide-y divide-black/[0.06]">
            {order.lines.map((l: OrderLine) => (
              <li key={`${l.id}|${l.variant}`} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{l.name}</span>
                  <span className="text-xs capitalize text-black/45">{l.variant ? `${l.variant} · ` : ""}{l.price}k</span>
                </span>
                <span className="flex items-center rounded-full bg-[#f4f1ea]">
                  <button onClick={() => order.setQty(l, l.qty - 1)} className="h-9 w-9" aria-label="−">−</button>
                  <span className="w-5 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                  <button onClick={() => order.setQty(l, l.qty + 1)} className="h-9 w-9" aria-label="+">+</button>
                </span>
                <span className="w-12 text-right text-sm font-semibold tabular-nums">{l.qty * l.price}k</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-sm text-black/40">{t.order_empty}</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="text-black/60">{t.order_total}</span>
          <span className="text-2xl font-semibold">{order.total}k</span>
        </div>
        <div className="mt-6 grid gap-2">
          {wa && (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-full bg-[#25d366] font-semibold text-white">
              {t.order_send}
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={copy} className="h-12 rounded-full bg-ink font-semibold text-white">{copied ? "✓" : t.order_copy}</button>
            <button onClick={() => { order.clear(); onClose(); }} className="h-12 rounded-full bg-[#f4f1ea] font-semibold text-black/60">{t.order_clear}</button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
