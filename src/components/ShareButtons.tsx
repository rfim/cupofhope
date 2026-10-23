"use client";

import { useState } from "react";

export default function ShareButtons({ url, title, label }: { url: string; title: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${text}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${text}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Link", url);
    }
  };

  const pill = "rounded-full border border-neutral-300 px-4 py-1.5 text-sm transition-colors hover:border-primary-600";

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-8">
      <span className="mr-1 text-sm font-medium">{label}</span>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={pill}>{l.name}</a>
      ))}
      <button onClick={copy} className={pill}>{copied ? "✓" : "Copy link"}</button>
    </div>
  );
}
