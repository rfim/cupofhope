"use client";

import { useRef, useState } from "react";

export const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary/30";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}

export function TextArea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputCls} resize-y leading-relaxed`} />;
}

/** Edits a list of paragraphs as plain text separated by blank lines. */
export function ParagraphsInput({ value, onChange, rows = 8 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [text, setText] = useState(value.join("\n\n"));
  return (
    <TextArea
      rows={rows}
      value={text}
      placeholder="Pisahkan paragraf dengan satu baris kosong."
      onChange={(t) => {
        setText(t);
        onChange(t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean));
      }}
    />
  );
}

/** Edits a list of short items, one per line. */
export function LinesInput({ value, onChange, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <TextArea
      rows={rows}
      value={text}
      placeholder="Satu item per baris"
      onChange={(t) => {
        setText(t);
        onChange(t.split("\n").map((l) => l.trim()).filter(Boolean));
      }}
    />
  );
}

/** Two columns: English and Indonesian versions of the same fields. */
export function Bilingual({ en, id }: { en: React.ReactNode; id: React.ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
        <p className="text-sm font-semibold">🇬🇧 English</p>
        {en}
      </div>
      <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
        <p className="text-sm font-semibold">🇮🇩 Indonesia</p>
        {id}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, labels }: { checked: boolean; onChange: (v: boolean) => void; labels: [string, string] }) {
  return (
    <div className="inline-flex rounded-full border border-neutral-200 p-1 text-sm">
      {labels.map((l, i) => {
        const active = (i === 1) === checked;
        return (
          <button key={l} type="button" onClick={() => onChange(i === 1)} className={`rounded-full px-4 py-1.5 transition ${active ? "bg-primary font-semibold" : "text-neutral-500 hover:text-black"}`}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export type ImagePickerProps = {
  value: string;
  onChange: (path: string) => void;
  library: string[];
  resolve: (path: string) => string;
  onUpload: (file: File) => Promise<string>;
};

export function ImagePicker({ value, onChange, library, resolve, onUpload }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await onUpload(file));
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value && <img src={resolve(value)} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(!open)} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-primary-600">
            Pilih dari galeri
          </button>
          <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-primary-600 disabled:opacity-50">
            {busy ? "Memproses..." : "Unggah baru"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {open && (
        <div className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-neutral-200 p-2 sm:grid-cols-4 md:grid-cols-6">
          {library.map((path) => (
            <button
              key={path}
              type="button"
              title={path}
              onClick={() => {
                onChange(path);
                setOpen(false);
              }}
              className={`aspect-[4/3] overflow-hidden rounded-lg ring-2 transition ${path === value ? "ring-primary-600" : "ring-transparent hover:ring-neutral-300"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolve(path)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
