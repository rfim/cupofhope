"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDate, type Article, type Content, type Event, type Testimonial } from "@/data";
import { GITHUB_REPO } from "@/i18n";
import { asset } from "@/lib/asset";
import { getToken, hashPin, setToken } from "./auth";
import CollectionEditor from "./CollectionEditor";
import { Bilingual, Field, ImagePicker, LinesInput, ParagraphsInput, slugify, TextArea, TextInput, Toggle } from "./fields";
import { checkAccess, commitFiles, CONTENT_PATH, currentContentSha, fetchContent, latestDeploy, utf8ToBase64, type DeployRun } from "./github";
import { prepareImage, uploadPath } from "./images";

type Tab = "overview" | "events" | "articles" | "testimonials" | "settings";
type Pending = Record<string, { base64: string; previewUrl: string }>;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Ringkasan", icon: "◎" },
  { id: "events", label: "Acara", icon: "◷" },
  { id: "articles", label: "Artikel", icon: "✎" },
  { id: "testimonials", label: "Testimoni", icon: "❝" },
  { id: "settings", label: "Pengaturan", icon: "⚙" },
];

function uniqueSlug(base: string, taken: string[]) {
  let slug = base || "item";
  for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export default function Dashboard({ initial, library, onLogout }: { initial: Content; library: string[]; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [content, setContent] = useState<Content>(initial);
  const [published, setPublished] = useState(() => JSON.stringify(initial));
  const [sha, setSha] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>({});
  const [token, setTokenState] = useState("");
  const [repoStatus, setRepoStatus] = useState<"none" | "checking" | "ok" | "error">("none");
  const [repoError, setRepoError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string; href?: string } | null>(null);
  const [deploy, setDeploy] = useState<DeployRun | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dirty = JSON.stringify(content) !== published || Object.keys(pending).length > 0;
  const gallery = useMemo(() => [...Object.keys(pending), ...library], [pending, library]);
  const resolve = useCallback((path: string) => pending[path]?.previewUrl ?? asset(path), [pending]);

  const refreshDeploy = useCallback(async (t: string) => {
    try {
      const run = await latestDeploy(t);
      setDeploy(run);
      return run;
    } catch {
      return null;
    }
  }, []);

  const connect = useCallback(
    async (t: string, { reload }: { reload: boolean }) => {
      if (!t) return setRepoStatus("none");
      setRepoStatus("checking");
      setRepoError("");
      try {
        await checkAccess(t);
        if (reload) {
          const remote = await fetchContent<Content>(t);
          setContent(remote.data);
          setPublished(JSON.stringify(remote.data));
          setSha(remote.sha);
        } else {
          setSha(await currentContentSha(t));
        }
        setRepoStatus("ok");
        refreshDeploy(t);
      } catch (e) {
        setRepoStatus("error");
        setRepoError(e instanceof Error ? e.message : "Gagal terhubung ke GitHub.");
      }
    },
    [refreshDeploy],
  );

  useEffect(() => {
    const t = getToken();
    setTokenState(t);
    connect(t, { reload: true });
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connect]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = <K extends keyof Content>(key: K, value: Content[K]) => setContent((c) => ({ ...c, [key]: value }));

  const upload = async (file: File) => {
    const img = await prepareImage(file);
    const path = uploadPath(file.name, img.ext);
    setPending((p) => ({ ...p, [path]: { base64: img.base64, previewUrl: img.previewUrl } }));
    return path;
  };

  const publish = async () => {
    if (!token || repoStatus !== "ok") {
      setTab("settings");
      setToast({ kind: "error", text: "Hubungkan token GitHub dulu di Pengaturan." });
      return;
    }
    setPublishing(true);
    setToast(null);
    try {
      const remoteSha = await currentContentSha(token);
      if (sha && remoteSha !== sha && !confirm("Konten di GitHub sudah berubah sejak panel ini dibuka (mungkin diedit dari perangkat lain). Timpa dengan versi ini?")) {
        setPublishing(false);
        return;
      }
      // Only commit uploads that are still referenced somewhere.
      const json = JSON.stringify(content, null, 2) + "\n";
      const uploads = Object.entries(pending).filter(([path]) => json.includes(path));
      const commit = await commitFiles(
        token,
        [
          { path: CONTENT_PATH, base64: utf8ToBase64(json) },
          ...uploads.map(([path, f]) => ({ path: `public${path}`, base64: f.base64 })),
        ],
        `Update content from admin panel${uploads.length ? ` (+${uploads.length} image${uploads.length > 1 ? "s" : ""})` : ""}`,
      );
      setPublished(JSON.stringify(content));
      setPending({});
      setSha(await currentContentSha(token));
      setToast({ kind: "ok", text: "Tersimpan! Situs sedang dibangun ulang, biasanya live dalam 1–2 menit.", href: commit.html_url });

      if (pollRef.current) clearInterval(pollRef.current);
      let tries = 0;
      pollRef.current = setInterval(async () => {
        const run = await refreshDeploy(token);
        if (++tries > 40 || (run?.head_sha === commit.sha && run.status === "completed")) {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 6000);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Gagal mempublikasikan." });
    } finally {
      setPublishing(false);
    }
  };

  const discard = () => {
    if (!confirm("Buang semua perubahan yang belum dipublikasikan?")) return;
    setContent(JSON.parse(published));
    setPending({});
  };

  const eventSlugs = content.events.map((e) => e.slug);
  const articleSlugs = content.articles.map((a) => a.slug);

  return (
    <div className="min-h-svh bg-[#f7f5f0] text-black">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:px-6">
          <button className="text-2xl lg:hidden" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">☰</button>
          <Image src="/images/logos/coh_logo.png" alt="" width={32} height={32} />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold">Cup of Hope</p>
            <p className="text-[11px] tracking-[0.2em] text-neutral-400">ADMIN PANEL</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {dirty && (
              <>
                <span className="hidden items-center gap-1.5 text-xs text-amber-700 md:flex"><span className="h-2 w-2 rounded-full bg-amber-500" />Belum dipublikasikan</span>
                <button onClick={discard} className="hidden rounded-full px-3 py-2 text-sm text-neutral-500 hover:text-black sm:block">Batalkan</button>
              </>
            )}
            <button
              onClick={publish}
              disabled={!dirty || publishing}
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-300"
            >
              {publishing ? "Mempublikasikan..." : "Publikasikan"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        {/* Sidebar */}
        <nav className={`${navOpen ? "fixed inset-0 z-20 block bg-white px-4 pt-20" : "hidden"} w-56 shrink-0 lg:static lg:block lg:bg-transparent lg:p-0`}>
          <ul className="space-y-1">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => {
                    setTab(t.id);
                    setNavOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition ${tab === t.id ? "bg-white font-semibold shadow-sm" : "text-neutral-600 hover:bg-white/60"}`}
                >
                  <span className="w-4 text-center text-neutral-400">{t.icon}</span>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-1 border-t border-neutral-200 pt-6 text-sm">
            <a href={asset("/en/")} target="_blank" rel="noopener noreferrer" className="block rounded-xl px-4 py-2 text-neutral-600 hover:bg-white/60">↗ Lihat situs</a>
            <button onClick={onLogout} className="block w-full rounded-xl px-4 py-2 text-left text-neutral-600 hover:bg-white/60">⎋ Keluar</button>
          </div>
        </nav>

        <main className="min-w-0 flex-1">
          {toast && (
            <div className={`mb-5 flex items-start justify-between gap-4 rounded-2xl px-5 py-4 text-sm ${toast.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
              <span>
                {toast.text}{" "}
                {toast.href && <a href={toast.href} target="_blank" rel="noopener noreferrer" className="font-medium underline">Lihat commit</a>}
              </span>
              <button onClick={() => setToast(null)} aria-label="Tutup">✕</button>
            </div>
          )}
          {repoStatus !== "ok" && tab !== "settings" && (
            <div className="mb-5 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-800">
              {repoStatus === "checking" ? "Menghubungkan ke GitHub..." : (
                <>
                  Mode baca saja: kamu bisa mengedit, tapi untuk <b>menyimpan</b> perlu token GitHub.{" "}
                  <button onClick={() => setTab("settings")} className="font-medium underline">Hubungkan sekarang</button>
                </>
              )}
            </div>
          )}

          {tab === "overview" && (
            <Overview
              content={content}
              deploy={deploy}
              repoStatus={repoStatus}
              dirty={dirty}
              go={setTab}
              markPast={(slugs) => patch("events", content.events.map((e) => (slugs.includes(e.slug) ? { ...e, past: true } : e)))}
            />
          )}

          {tab === "events" && (
            <CollectionEditor<Event>
              items={content.events}
              onChange={(v) => patch("events", v)}
              keyOf={(e) => e.slug}
              title={(e) => e.en.title}
              subtitle={(e) => `${formatDate(e.date, "id")} · ${e.time}`}
              badge={(e) => (e.past ? "Selesai" : null)}
              thumb={(e) => resolve(e.image)}
              addLabel="Tambah acara"
              filters={[
                { label: "Semua", test: () => true },
                { label: "Mendatang", test: (e) => !e.past },
                { label: "Selesai", test: (e) => e.past },
              ]}
              create={() => ({
                slug: uniqueSlug("acara-baru", eventSlugs),
                past: false,
                image: "/images/pages/events/event-image1.png",
                location: "Cup of Hope Café, Surabaya",
                date: new Date().toISOString().slice(0, 10),
                time: "19.00 - 21.00 WIB",
                en: { title: "New event", body: [""] },
                id: { title: "Acara baru", body: [""] },
              })}
              renderForm={(e, update) => (
                <>
                  <div className="flex flex-wrap items-end gap-5">
                    <Field label="Status">
                      <Toggle checked={e.past} onChange={(past) => update({ past })} labels={["Mendatang", "Selesai"]} />
                    </Field>
                    <a href={asset(`/en/events/${e.slug}/`)} target="_blank" rel="noopener noreferrer" className="pb-2 text-sm text-primary-700 underline">Buka halaman ↗</a>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Field label="Tanggal"><TextInput type="date" value={e.date} onChange={(date) => update({ date })} /></Field>
                    <Field label="Waktu" hint="Contoh: 19.00 - 21.00 WIB"><TextInput value={e.time} onChange={(time) => update({ time })} /></Field>
                    <Field label="Lokasi"><TextInput value={e.location} onChange={(location) => update({ location })} /></Field>
                    <Field label="Harga tiket" hint="Kosongkan jika gratis"><TextInput value={e.price ?? ""} placeholder="130,000 IDR" onChange={(price) => update({ price: price || undefined })} /></Field>
                  </div>
                  <Field label="Gambar">
                    <ImagePicker value={e.image} onChange={(image) => update({ image })} library={gallery} resolve={resolve} onUpload={upload} />
                  </Field>
                  <Bilingual
                    en={
                      <>
                        <Field label="Judul">
                          <TextInput value={e.en.title} onChange={(title) => update({ en: { ...e.en, title } })} />
                        </Field>
                        <Field label="Deskripsi"><ParagraphsInput value={e.en.body} onChange={(body) => update({ en: { ...e.en, body } })} /></Field>
                        <Field label="Termasuk (opsional)"><LinesInput value={e.en.includes ?? []} onChange={(includes) => update({ en: { ...e.en, includes: includes.length ? includes : undefined } })} /></Field>
                      </>
                    }
                    id={
                      <>
                        <Field label="Judul"><TextInput value={e.id.title} onChange={(title) => update({ id: { ...e.id, title } })} /></Field>
                        <Field label="Deskripsi"><ParagraphsInput value={e.id.body} onChange={(body) => update({ id: { ...e.id, body } })} /></Field>
                        <Field label="Termasuk (opsional)"><LinesInput value={e.id.includes ?? []} onChange={(includes) => update({ id: { ...e.id, includes: includes.length ? includes : undefined } })} /></Field>
                      </>
                    }
                  />
                  <SlugField value={e.slug} title={e.en.title} taken={eventSlugs} prefix="/events/" onChange={(slug) => update({ slug })} />
                </>
              )}
            />
          )}

          {tab === "articles" && (
            <CollectionEditor<Article>
              items={content.articles}
              onChange={(v) => patch("articles", v)}
              keyOf={(a) => a.slug}
              title={(a) => a.en.title}
              subtitle={(a) => formatDate(a.date, "id")}
              thumb={(a) => resolve(a.image)}
              addLabel="Tulis artikel"
              create={() => ({
                slug: uniqueSlug("artikel-baru", articleSlugs),
                image: "/images/pages/article/article-image1.png",
                date: new Date().toISOString().slice(0, 10),
                en: { title: "New article", body: [""] },
                id: { title: "Artikel baru", body: [""] },
              })}
              renderForm={(a, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-end">
                    <Field label="Tanggal terbit"><TextInput type="date" value={a.date} onChange={(date) => update({ date })} /></Field>
                    <a href={asset(`/en/article/${a.slug}/`)} target="_blank" rel="noopener noreferrer" className="pb-2 text-sm text-primary-700 underline">Buka halaman ↗</a>
                  </div>
                  <Field label="Gambar utama">
                    <ImagePicker value={a.image} onChange={(image) => update({ image })} library={gallery} resolve={resolve} onUpload={upload} />
                  </Field>
                  <Bilingual
                    en={
                      <>
                        <Field label="Judul"><TextInput value={a.en.title} onChange={(title) => update({ en: { ...a.en, title } })} /></Field>
                        <Field label="Isi artikel"><ParagraphsInput rows={14} value={a.en.body} onChange={(body) => update({ en: { ...a.en, body } })} /></Field>
                      </>
                    }
                    id={
                      <>
                        <Field label="Judul"><TextInput value={a.id.title} onChange={(title) => update({ id: { ...a.id, title } })} /></Field>
                        <Field label="Isi artikel"><ParagraphsInput rows={14} value={a.id.body} onChange={(body) => update({ id: { ...a.id, body } })} /></Field>
                      </>
                    }
                  />
                  <SlugField value={a.slug} title={a.en.title} taken={articleSlugs} prefix="/article/" onChange={(slug) => update({ slug })} />
                </>
              )}
            />
          )}

          {tab === "testimonials" && (
            <CollectionEditor<Testimonial>
              items={content.testimonials}
              onChange={(v) => patch("testimonials", v)}
              keyOf={(t, i) => `${t.name}-${i}`}
              title={(t) => t.name}
              subtitle={(t) => t.en.origin}
              thumb={(t) => resolve(t.image)}
              addLabel="Tambah testimoni"
              create={() => ({
                name: "Nama",
                image: "/images/pages/home/testi1.png",
                en: { quote: "", story: "", origin: "from Surabaya" },
                id: { quote: "", story: "", origin: "dari Surabaya" },
              })}
              renderForm={(t, update) => (
                <>
                  <Field label="Nama"><TextInput value={t.name} onChange={(name) => update({ name })} /></Field>
                  <Field label="Foto">
                    <ImagePicker value={t.image} onChange={(image) => update({ image })} library={gallery} resolve={resolve} onUpload={upload} />
                  </Field>
                  <Bilingual
                    en={
                      <>
                        <Field label="Asal"><TextInput value={t.en.origin} onChange={(origin) => update({ en: { ...t.en, origin } })} /></Field>
                        <Field label="Kutipan (Card of Hope)"><TextArea rows={2} value={t.en.quote} onChange={(quote) => update({ en: { ...t.en, quote } })} /></Field>
                        <Field label="Cerita"><TextArea rows={6} value={t.en.story} onChange={(story) => update({ en: { ...t.en, story } })} /></Field>
                      </>
                    }
                    id={
                      <>
                        <Field label="Asal"><TextInput value={t.id.origin} onChange={(origin) => update({ id: { ...t.id, origin } })} /></Field>
                        <Field label="Kutipan (Kartu Harapan)"><TextArea rows={2} value={t.id.quote} onChange={(quote) => update({ id: { ...t.id, quote } })} /></Field>
                        <Field label="Cerita"><TextArea rows={6} value={t.id.story} onChange={(story) => update({ id: { ...t.id, story } })} /></Field>
                      </>
                    }
                  />
                </>
              )}
            />
          )}

          {tab === "settings" && (
            <Settings
              content={content}
              onChange={(settings) => patch("settings", settings)}
              token={token}
              repoStatus={repoStatus}
              repoError={repoError}
              onToken={(t) => {
                setToken(t);
                setTokenState(t);
                connect(t, { reload: !dirty });
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function SlugField({ value, title, taken, prefix, onChange }: { value: string; title: string; taken: string[]; prefix: string; onChange: (slug: string) => void }) {
  const clash = taken.filter((s) => s === value).length > 1;
  return (
    <Field label="URL (slug)" hint={clash ? undefined : `Alamat halaman: ${prefix}${value}`}>
      <div className="flex gap-2">
        <TextInput value={value} onChange={(v) => onChange(slugify(v))} />
        <button type="button" onClick={() => onChange(uniqueSlug(slugify(title), taken.filter((s) => s !== value)))} className="shrink-0 rounded-xl border border-neutral-200 px-3 text-sm hover:border-neutral-400">
          Dari judul
        </button>
      </div>
      {clash && <span className="mt-1 block text-xs text-red-600">Slug ini sudah dipakai item lain. Ubah supaya unik.</span>}
    </Field>
  );
}

function Overview({ content, deploy, repoStatus, dirty, go, markPast }: { content: Content; deploy: DeployRun | null; repoStatus: string; dirty: boolean; go: (t: Tab) => void; markPast: (slugs: string[]) => void }) {
  const upcoming = content.events.filter((e) => !e.past);
  const today = new Date().toISOString().slice(0, 10);
  const stale = upcoming.filter((e) => e.date < today);
  const cards = [
    { label: "Acara mendatang", value: upcoming.length, tab: "events" as Tab },
    { label: "Acara selesai", value: content.events.length - upcoming.length, tab: "events" as Tab },
    { label: "Artikel", value: content.articles.length, tab: "articles" as Tab },
    { label: "Testimoni", value: content.testimonials.length, tab: "testimonials" as Tab },
  ];
  const deployLabel = !deploy
    ? "—"
    : deploy.status !== "completed"
      ? "⏳ Sedang dibangun..."
      : deploy.conclusion === "success"
        ? "✅ Live"
        : "⚠️ Gagal";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Halo! 👋</h1>
        <p className="mt-1 text-neutral-500">Kelola acara, artikel, dan testimoni Cup of Hope dari sini.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <button key={c.label} onClick={() => go(c.tab)} className="rounded-3xl bg-white p-6 text-left shadow-sm transition hover:shadow-md">
            <p className="text-4xl font-semibold">{c.value}</p>
            <p className="mt-2 text-sm text-neutral-500">{c.label}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Status situs</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">GitHub</dt><dd>{repoStatus === "ok" ? `✅ Terhubung (${GITHUB_REPO})` : "Belum terhubung"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Deploy terakhir</dt><dd>{deployLabel}</dd></div>
            {deploy && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Waktu</dt>
                <dd><a className="underline" href={deploy.html_url} target="_blank" rel="noopener noreferrer">{new Date(deploy.created_at).toLocaleString("id-ID")}</a></dd>
              </div>
            )}
            <div className="flex justify-between gap-4"><dt className="text-neutral-500">Perubahan lokal</dt><dd>{dirty ? "Ada, belum dipublikasikan" : "Tidak ada"}</dd></div>
          </dl>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Perlu perhatian</h2>
          {stale.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {stale.map((e) => (
                <li key={e.slug} className="flex items-center justify-between gap-3">
                  <span className="truncate">{e.en.title} <span className="text-neutral-400">· {formatDate(e.date, "id")}</span></span>
                  <button onClick={() => markPast([e.slug])} className="shrink-0 text-primary-700 underline">Tandai selesai</button>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
                <span>Tanggal acara ini sudah lewat tapi masih tampil di “Acara Mendatang”.</span>
                {stale.length > 1 && <button onClick={() => markPast(stale.map((e) => e.slug))} className="shrink-0 font-medium text-primary-700 underline">Tandai semua</button>}
              </li>
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">Semua rapi ✨</p>
          )}
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 text-sm text-neutral-600 shadow-sm">
        <h2 className="font-semibold text-black">Cara kerja</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          <li>Edit konten di tab Acara, Artikel, atau Testimoni. Perubahan tersimpan sementara di panel ini.</li>
          <li>Klik <b>Publikasikan</b>: semua perubahan dikirim sebagai satu commit ke GitHub.</li>
          <li>GitHub Pages membangun ulang situs otomatis; perubahan live dalam 1–2 menit.</li>
        </ol>
      </div>
    </div>
  );
}

function Settings({ content, onChange, token, repoStatus, repoError, onToken }: {
  content: Content;
  onChange: (s: Content["settings"]) => void;
  token: string;
  repoStatus: string;
  repoError: string;
  onToken: (t: string) => void;
}) {
  const s = content.settings;
  const [draftToken, setDraftToken] = useState(token);
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  useEffect(() => setDraftToken(token), [token]);

  const changePin = async () => {
    if (!/^\d{6}$/.test(pin1)) return setPinMsg("PIN harus 6 digit angka.");
    if (pin1 !== pin2) return setPinMsg("Konfirmasi PIN tidak sama.");
    onChange({ ...s, pinHash: await hashPin(pin1) });
    setPin1("");
    setPin2("");
    setPinMsg("PIN baru siap. Klik Publikasikan untuk menerapkannya.");
  };

  const card = "rounded-3xl bg-white p-6 shadow-sm space-y-4";

  return (
    <div className="max-w-3xl space-y-6">
      <section className={card}>
        <div>
          <h2 className="font-semibold">Koneksi GitHub</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Token dibutuhkan untuk menyimpan perubahan. Token hanya disimpan di browser ini.
          </p>
        </div>
        <Field label="Fine-grained personal access token" hint={`Buat di github.com → Settings → Developer settings → Fine-grained tokens. Repository access: ${GITHUB_REPO}. Permissions: Contents (Read and write), Actions (Read-only).`}>
          <div className="flex gap-2">
            <TextInput type="password" value={draftToken} onChange={setDraftToken} placeholder="github_pat_..." autoComplete="off" />
            <button onClick={() => onToken(draftToken.trim())} className="shrink-0 rounded-xl bg-black px-4 text-sm font-semibold text-white">Simpan</button>
          </div>
        </Field>
        <p className="text-sm">
          {repoStatus === "ok" && <span className="text-emerald-700">✅ Terhubung ke {GITHUB_REPO}</span>}
          {repoStatus === "checking" && <span className="text-neutral-500">Memeriksa...</span>}
          {repoStatus === "error" && <span className="text-red-600">✕ {repoError}</span>}
          {repoStatus === "none" && <span className="text-neutral-500">Belum ada token.</span>}
        </p>
        {token && (
          <button onClick={() => onToken("")} className="text-sm text-red-600 underline">Hapus token dari browser ini</button>
        )}
      </section>

      <section className={card}>
        <h2 className="font-semibold">Kontak</h2>
        <Field label="Link WhatsApp" hint="Dipakai untuk tombol Contact Us, Get Connected, Register Now, dan tombol WhatsApp melayang.">
          <TextInput value={s.whatsappUrl} onChange={(whatsappUrl) => onChange({ ...s, whatsappUrl })} />
        </Field>
        <Field label="Email">
          <TextInput type="email" value={s.email} onChange={(email) => onChange({ ...s, email })} />
        </Field>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Angka dampak (halaman About)</h2>
        {s.stats.map((stat, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[120px_1fr_1fr]">
            <Field label="Angka"><TextInput value={stat.value} onChange={(value) => onChange({ ...s, stats: s.stats.map((x, j) => (j === i ? { ...x, value } : x)) })} /></Field>
            <Field label="Label EN"><TextInput value={stat.en} onChange={(en) => onChange({ ...s, stats: s.stats.map((x, j) => (j === i ? { ...x, en } : x)) })} /></Field>
            <Field label="Label ID"><TextInput value={stat.id} onChange={(id) => onChange({ ...s, stats: s.stats.map((x, j) => (j === i ? { ...x, id } : x)) })} /></Field>
          </div>
        ))}
      </section>

      <section className={card}>
        <div>
          <h2 className="font-semibold">Ganti PIN admin</h2>
          <p className="mt-1 text-sm text-neutral-500">6 digit angka. Berlaku setelah dipublikasikan dan situs selesai dibangun ulang.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="PIN baru"><TextInput type="password" inputMode="numeric" maxLength={6} value={pin1} onChange={(v) => setPin1(v.replace(/\D/g, ""))} /></Field>
          <Field label="Ulangi PIN"><TextInput type="password" inputMode="numeric" maxLength={6} value={pin2} onChange={(v) => setPin2(v.replace(/\D/g, ""))} /></Field>
          <button onClick={changePin} className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:border-black">Ganti PIN</button>
        </div>
        {pinMsg && <p className="text-sm text-neutral-600">{pinMsg}</p>}
      </section>
    </div>
  );
}
