"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Item = { name: string; image: string; quote: string; story: string; origin: string };

export default function Testimonials({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [items.length, paused]);

  if (!items.length) return null;
  const t = items[active % items.length];

  return (
    <div className="flex gap-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <figure key={active} className="animate-fade-in flex-1 rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_8px_30px_rgb(0_0_0/0.04)]">
        <blockquote className="text-lg italic leading-relaxed md:text-xl">“{t.quote}”</blockquote>
        <p className="mt-6 leading-relaxed text-neutral-700">{t.story}</p>
        <figcaption className="mt-8 flex items-center gap-4 border-t border-neutral-200 pt-6">
          <Image src={t.image} alt={t.name} width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-neutral-500">{t.origin}</p>
          </div>
        </figcaption>
      </figure>
      {items.length > 1 && (
        <div className="flex flex-col items-center justify-center gap-10 py-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={item.name}
              aria-current={i === active}
              className={`rounded-full transition-all ${i === active ? "h-4 w-4 bg-primary" : "h-2.5 w-2.5 bg-neutral-300 hover:bg-neutral-400"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
