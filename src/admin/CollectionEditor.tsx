"use client";

import { useMemo, useState } from "react";
import { inputCls } from "./fields";

type Props<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  /** Stable key for an item (slug, or index-based for testimonials). */
  keyOf: (item: T, index: number) => string;
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  badge?: (item: T) => string | null;
  thumb?: (item: T) => string;
  create: () => T;
  addLabel: string;
  filters?: { label: string; test: (item: T) => boolean }[];
  renderForm: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
};

export default function CollectionEditor<T>({ items, onChange, keyOf, title, subtitle, badge, thumb, create, addLabel, filters, renderForm }: Props<T>) {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => (!filters || filters[filter].test(item)) && (!q || title(item).toLowerCase().includes(q)));
  }, [items, query, filter, filters, title]);

  const current = items[selected];

  const update = (patch: Partial<T>) => onChange(items.map((it, i) => (i === selected ? { ...it, ...patch } : it)));

  const add = () => {
    onChange([create(), ...items]);
    setSelected(0);
    setFilter(0);
    setQuery("");
  };

  const remove = () => {
    if (!current || !confirm(`Hapus "${title(current)}"? Perubahan baru permanen setelah dipublikasikan.`)) return;
    onChange(items.filter((_, i) => i !== selected));
    setSelected(Math.max(0, selected - 1));
  };

  const duplicate = () => {
    if (!current) return;
    const copy = structuredClone(current);
    onChange([...items.slice(0, selected + 1), copy, ...items.slice(selected + 1)]);
    setSelected(selected + 1);
  };

  const move = (dir: -1 | 1) => {
    const to = selected + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[selected], next[to]] = [next[to], next[selected]];
    onChange(next);
    setSelected(to);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-3">
        <button onClick={add} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold transition hover:brightness-95">
          + {addLabel}
        </button>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari..." className={inputCls} />
        {filters && (
          <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 text-xs">
            {filters.map((f, i) => (
              <button key={f.label} onClick={() => setFilter(i)} className={`flex-1 rounded-lg py-1.5 transition ${i === filter ? "bg-white font-semibold shadow-sm" : "text-neutral-500"}`}>
                {f.label} ({items.filter(f.test).length})
              </button>
            ))}
          </div>
        )}
        <ul className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
          {visible.map(({ item, index }) => (
            <li key={keyOf(item, index) + index}>
              <button
                onClick={() => setSelected(index)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${index === selected ? "border-primary-600 bg-primary/10" : "border-transparent hover:bg-neutral-100"}`}
              >
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(item)} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{title(item) || "(tanpa judul)"}</span>
                  {subtitle && <span className="block truncate text-xs text-neutral-500">{subtitle(item)}</span>}
                </span>
                {badge?.(item) && <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium uppercase">{badge(item)}</span>}
              </button>
            </li>
          ))}
          {!visible.length && <li className="py-8 text-center text-sm text-neutral-400">Tidak ada data.</li>}
        </ul>
      </aside>

      <section className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-5 md:p-7">
        {current ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-5">
              <h2 className="text-xl font-semibold">{title(current) || "(tanpa judul)"}</h2>
              <div className="flex flex-wrap gap-2 text-sm">
                <button onClick={() => move(-1)} disabled={selected === 0} className="rounded-full border border-neutral-200 px-3 py-1.5 disabled:opacity-30" title="Pindah ke atas">↑</button>
                <button onClick={() => move(1)} disabled={selected === items.length - 1} className="rounded-full border border-neutral-200 px-3 py-1.5 disabled:opacity-30" title="Pindah ke bawah">↓</button>
                <button onClick={duplicate} className="rounded-full border border-neutral-200 px-4 py-1.5 hover:border-neutral-400">Duplikat</button>
                <button onClick={remove} className="rounded-full border border-red-200 px-4 py-1.5 text-red-600 hover:bg-red-50">Hapus</button>
              </div>
            </div>
            {/* key resets uncontrolled textareas when switching items */}
            <div key={selected + ":" + keyOf(current, selected)} className="space-y-5">
              {renderForm(current, update)}
            </div>
          </>
        ) : (
          <p className="py-20 text-center text-neutral-400">Pilih item di kiri, atau tambahkan yang baru.</p>
        )}
      </section>
    </div>
  );
}
