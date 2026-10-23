"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Testimonial = { quote: string; story: string; name: string; origin: string; image: string };

const DOTS = 4;

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const slides = Array.from({ length: DOTS }, (_, i) => items[i % items.length]);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % DOTS), 6000);
    return () => clearInterval(id);
  }, []);

  const t = slides[active];

  return (
    <div className="flex gap-6">
      <figure key={active} className="flex-1 rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_8px_30px_rgb(0_0_0/0.04)] transition-opacity duration-500">
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
      <div className="hidden flex-col items-center justify-between py-1 md:flex">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
            className={`rounded-full transition-all ${i === active ? "h-4 w-4 bg-primary" : "h-2.5 w-2.5 bg-neutral-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
