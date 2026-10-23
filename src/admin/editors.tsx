"use client";

// Admin editors for Cards of Hope, the menu, and branches.

import { useState } from "react";
import type { Branch, Content, HopeCard as Card, MenuItem, MenuTag, Motif, Palette, Rarity } from "@/data";
import { RARITIES } from "@/data";
import { MOTIFS } from "@/components/cards/CardArt";
import HopeCard, { PALETTES } from "@/components/cards/HopeCard";
import { hashCardCode } from "@/lib/collection";
import CollectionEditor from "./CollectionEditor";
import { Bilingual, Field, ImagePicker, inputCls, TextArea, TextInput, Toggle, type ImagePickerProps } from "./fields";

const RARITY_ID: Record<Rarity, string> = { common: "Biasa", rare: "Langka", epic: "Epik", legendary: "Legendaris" };

export function CardsEditor({ content, onChange }: { content: Content; onChange: (cards: Card[]) => void }) {
  const cards = content.cards;
  const [code, setCode] = useState("");

  return (
    <CollectionEditor<Card>
      items={cards}
      onChange={onChange}
      keyOf={(c) => String(c.number)}
      title={(c) => `#${c.number} ${c.en.title}`}
      subtitle={(c) => `${RARITY_ID[c.rarity]} · ${c.series}`}
      badge={(c) => (c.codeHash ? "kode" : null)}
      addLabel="Buat kartu"
      filters={[{ label: "Semua", test: () => true }, ...RARITIES.map((r) => ({ label: RARITY_ID[r], test: (c: Card) => c.rarity === r }))]}
      create={() => ({
        number: Math.max(0, ...cards.map((c) => c.number)) + 1,
        rarity: "common",
        series: "Card of Hope",
        palette: "cream",
        motif: "heart",
        style: "classic",
        en: { title: "New card", message: "Dear, *you are loved.*" },
        id: { title: "Kartu baru", message: "Yang terkasih, *kamu dikasihi.*" },
      })}
      renderForm={(c, update) => (
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Kelangkaan">
                <select value={c.rarity} onChange={(e) => update({ rarity: e.target.value as Rarity })} className={inputCls}>
                  {RARITIES.map((r) => <option key={r} value={r}>{RARITY_ID[r]}</option>)}
                </select>
              </Field>
              <Field label="Seri" hint="Contoh: July Hope, Refill Your Hope">
                <TextInput value={c.series} onChange={(series) => update({ series })} />
              </Field>
              <Field label="Gaya tulisan">
                <Toggle checked={c.style === "script"} onChange={(v) => update({ style: v ? "script" : "classic" })} labels={["Tegas", "Tulisan tangan"]} />
              </Field>
            </div>
            <Field label="Warna">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PALETTES) as Palette[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    title={p}
                    onClick={() => update({ palette: p })}
                    className={`h-9 w-9 rounded-full ring-2 ring-offset-2 transition ${c.palette === p ? "ring-black" : "ring-transparent"}`}
                    style={{ background: `linear-gradient(135deg, #fffdf8 30%, ${PALETTES[p].wash})` }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Ilustrasi">
              <div className="flex flex-wrap gap-2">
                {MOTIFS.map((m) => (
                  <button key={m} type="button" onClick={() => update({ motif: m as Motif })} className={`rounded-full px-3 py-1.5 text-xs capitalize ${c.motif === m ? "bg-black text-white" : "bg-neutral-100"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </Field>
            <Bilingual
              en={
                <>
                  <Field label="Judul (untuk koleksi)"><TextInput value={c.en.title} onChange={(title) => update({ en: { ...c.en, title } })} /></Field>
                  <Field label="Pesan" hint="Apit kata dengan *bintang* untuk warna oranye."><TextArea rows={4} value={c.en.message} onChange={(message) => update({ en: { ...c.en, message } })} /></Field>
                </>
              }
              id={
                <>
                  <Field label="Judul"><TextInput value={c.id.title} onChange={(title) => update({ id: { ...c.id, title } })} /></Field>
                  <Field label="Terjemahan" hint="Tampil kecil di bawah pesan."><TextArea rows={4} value={c.id.message} onChange={(message) => update({ id: { ...c.id, message } })} /></Field>
                </>
              }
            />
            <Field label="Kode buka kartu" hint="Cetak kode ini di kartu fisik. Pengunjung yang memasukkannya langsung mendapat kartu ini. Kode disimpan dalam bentuk acak (hash).">
              <div className="flex flex-wrap items-center gap-2">
                <TextInput value={code} placeholder={c.codeHash ? "Kode aktif · ketik untuk mengganti" : "mis. HOPE-JULY-25"} onChange={(v) => setCode(v.toUpperCase())} />
                <button
                  type="button"
                  disabled={!code.trim()}
                  onClick={async () => {
                    update({ codeHash: await hashCardCode(code) });
                    setCode("");
                  }}
                  className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
                >
                  Pasang kode
                </button>
                {c.codeHash && (
                  <button type="button" onClick={() => update({ codeHash: undefined })} className="text-sm text-red-600 underline">Hapus kode</button>
                )}
              </div>
            </Field>
          </div>
          <div className="xl:sticky xl:top-24 xl:self-start">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Pratinjau</p>
            <HopeCard card={c} total={cards.length} />
          </div>
        </div>
      )}
    />
  );
}

const TAGS: { id: MenuTag; label: string }[] = [
  { id: "rec", label: "👍 Rekomendasi" },
  { id: "spicy", label: "🌶 Pedas" },
  { id: "oat", label: "🌿 Oat" },
  { id: "new", label: "✦ Baru" },
];

export function MenuEditor({ content, onChange, picker }: { content: Content; onChange: (menu: Content["menu"]) => void; picker: Omit<ImagePickerProps, "value" | "onChange"> }) {
  const menu = content.menu;
  const [ci, setCi] = useState(0);
  const [gi, setGi] = useState(0);
  const cat = menu.categories[ci];
  const group = cat?.groups[gi] ?? cat?.groups[0];

  const setItems = (items: MenuItem[]) =>
    onChange({
      ...menu,
      categories: menu.categories.map((c, i) => (i !== ci ? c : { ...c, groups: c.groups.map((g, j) => (j !== gi ? g : { ...g, items })) })),
    });

  const setCat = (patch: Partial<typeof cat>) => onChange({ ...menu, categories: menu.categories.map((c, i) => (i === ci ? { ...c, ...patch } : c)) });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Promo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
          <Field label="Judul"><TextInput value={menu.promo.en.title} onChange={(title) => onChange({ ...menu, promo: { ...menu.promo, en: { ...menu.promo.en, title }, id: { ...menu.promo.id, title } } })} /></Field>
          <Field label="Deskripsi (ID)"><TextInput value={menu.promo.id.body} onChange={(body) => onChange({ ...menu, promo: { ...menu.promo, id: { ...menu.promo.id, body } } })} /></Field>
          <Field label="Harga (k)"><TextInput type="number" value={String(menu.promo.price)} onChange={(v) => onChange({ ...menu, promo: { ...menu.promo, price: Number(v) || 0 } })} /></Field>
        </div>
        <Field label="Deskripsi (EN)"><TextInput value={menu.promo.en.body} onChange={(body) => onChange({ ...menu, promo: { ...menu.promo, en: { ...menu.promo.en, body } } })} /></Field>
      </section>

      <div className="flex flex-wrap gap-2">
        {menu.categories.map((c, i) => (
          <button key={c.id} onClick={() => { setCi(i); setGi(0); }} className={`rounded-full px-4 py-2 text-sm ${i === ci ? "bg-black text-white" : "bg-white shadow-sm"}`}>
            {c.id_name}
          </button>
        ))}
      </div>

      {cat && (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Bagian">
              <select value={gi} onChange={(e) => setGi(Number(e.target.value))} className={inputCls}>
                {cat.groups.map((g, i) => <option key={g.en} value={i}>{g.id_name}</option>)}
              </select>
            </Field>
            <div className="min-w-[260px] flex-1">
              <Field label="Tambahan (add-ons) kategori ini"><TextInput value={cat.addons ?? ""} placeholder="extra shot +5 · oat milk +5" onChange={(addons) => setCat({ addons: addons || undefined })} /></Field>
            </div>
          </div>
          {group && (
            <CollectionEditor<MenuItem>
              key={`${ci}-${gi}`}
              items={group.items}
              onChange={setItems}
              keyOf={(i) => i.id}
              title={(i) => i.name}
              subtitle={(i) => `${i.price}k${i.soldOut ? " · habis" : ""}`}
              badge={(i) => (i.soldOut ? "habis" : i.tags?.includes("new") ? "baru" : null)}
              thumb={(i) => (i.image ? picker.resolve(i.image) : picker.resolve("/images/logos/coh_logo.png"))}
              addLabel="Tambah menu"
              create={() => ({ id: `menu-${Date.now().toString(36)}`, name: "Menu baru", price: 25 })}
              renderForm={(item, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                    <Field label="Nama"><TextInput value={item.name} onChange={(name) => update({ name })} /></Field>
                    <Field label="Harga (ribu)"><TextInput type="number" value={String(item.price)} onChange={(v) => update({ price: Number(v) || 0 })} /></Field>
                  </div>
                  <Field label="Label">
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map((t) => {
                        const on = item.tags?.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              const tags = on ? item.tags!.filter((x) => x !== t.id) : [...(item.tags ?? []), t.id];
                              update({ tags: tags.length ? tags : undefined });
                            }}
                            className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-black text-white" : "bg-neutral-100"}`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <div className="flex flex-wrap items-end gap-6">
                    <Field label="Stok"><Toggle checked={!!item.soldOut} onChange={(soldOut) => update({ soldOut: soldOut || undefined })} labels={["Tersedia", "Habis"]} /></Field>
                    <div className="min-w-[220px] flex-1">
                      <Field label="Pilihan" hint="Pisahkan dengan koma, mis. hot, ice"><TextInput value={(item.variants ?? []).join(", ")} onChange={(v) => { const variants = v.split(",").map((x) => x.trim()).filter(Boolean); update({ variants: variants.length ? variants : undefined }); }} /></Field>
                    </div>
                  </div>
                  <Field label="Foto" hint="Foto produk di latar polos terlihat paling rapi.">
                    <ImagePicker {...picker} value={item.image ?? ""} onChange={(image) => update({ image })} />
                  </Field>
                  <Bilingual
                    en={<Field label="Deskripsi"><TextArea rows={3} value={item.desc?.en ?? ""} onChange={(en) => update({ desc: en || item.desc?.id ? { en, id: item.desc?.id ?? "" } : undefined })} /></Field>}
                    id={<Field label="Deskripsi"><TextArea rows={3} value={item.desc?.id ?? ""} onChange={(id) => update({ desc: id || item.desc?.en ? { en: item.desc?.en ?? "", id } : undefined })} /></Field>}
                  />
                </>
              )}
            />
          )}
        </>
      )}
    </div>
  );
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function BranchesSettings({ content, onChange }: { content: Content; onChange: (s: Content["settings"]) => void }) {
  const s = content.settings;
  const setBranch = (i: number, patch: Partial<Branch>) => onChange({ ...s, branches: s.branches.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  return (
    <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold">Cabang & jam buka</h2>
        <p className="mt-1 text-sm text-neutral-500">Dipakai untuk status “Buka / Tutup” di aplikasi dan tombol petunjuk arah.</p>
      </div>
      {s.branches.map((b, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-neutral-200 p-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr_180px]">
            <Field label="Kota"><TextInput value={b.name} onChange={(name) => setBranch(i, { name })} /></Field>
            <Field label="Alamat"><TextInput value={b.address} onChange={(address) => setBranch(i, { address })} /></Field>
            <Field label="Instagram"><TextInput value={b.instagram ?? ""} placeholder="cupofhope.mlg" onChange={(instagram) => setBranch(i, { instagram })} /></Field>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Hari buka">
              <div className="flex gap-1">
                {DAYS.map((d, day) => {
                  const on = b.hours.days.includes(day);
                  return (
                    <button key={d} type="button" onClick={() => setBranch(i, { hours: { ...b.hours, days: on ? b.hours.days.filter((x) => x !== day) : [...b.hours.days, day].sort() } })} className={`h-9 w-11 rounded-lg text-xs ${on ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Buka"><TextInput type="time" value={b.hours.open} onChange={(open) => setBranch(i, { hours: { ...b.hours, open } })} /></Field>
            <Field label="Tutup"><TextInput type="time" value={b.hours.close} onChange={(close) => setBranch(i, { hours: { ...b.hours, close } })} /></Field>
            <button type="button" onClick={() => confirm(`Hapus cabang ${b.name}?`) && onChange({ ...s, branches: s.branches.filter((_, j) => j !== i) })} className="ml-auto pb-2 text-sm text-red-600 underline">Hapus</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...s, branches: [...s.branches, { name: "Kota", address: "", hours: { days: [1, 2, 3, 4, 5, 6], open: "11:00", close: "21:00" } }] })} className="rounded-full border border-neutral-300 px-4 py-2 text-sm">
        + Tambah cabang
      </button>

      <div className="grid gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">
        <Field label="Nomor WhatsApp untuk pesanan" hint="Opsional, angka saja (mis. 6281234567890). Jika diisi, muncul tombol “Kirim via WhatsApp” di daftar pesanan.">
          <TextInput value={s.whatsappNumber ?? ""} onChange={(v) => onChange({ ...s, whatsappNumber: v.replace(/\D/g, "") })} />
        </Field>
        <Field label="Kartu hadiah selamat datang">
          <select value={s.welcomeCard} onChange={(e) => onChange({ ...s, welcomeCard: Number(e.target.value) })} className={inputCls}>
            {content.cards.map((c) => <option key={c.number} value={c.number}>#{c.number} {c.en.title}</option>)}
          </select>
        </Field>
      </div>
    </section>
  );
}
