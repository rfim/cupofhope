"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { lockRemaining, tryPin } from "./auth";

const LENGTH = 6;

export default function PinGate({ pinHash, onUnlock }: { pinHash: string; onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const tick = () => setWait(Math.ceil(lockRemaining() / 1000));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const submit = useCallback(
    async (value: string) => {
      setBusy(true);
      const result = await tryPin(value, pinHash);
      setBusy(false);
      if (result === "ok") return onUnlock();
      setPin("");
      setShake(true);
      setTimeout(() => setShake(false), 450);
      setError(result === "locked" ? "Terlalu banyak percobaan. Coba lagi sebentar lagi." : "PIN kamu salah!");
    },
    [pinHash, onUnlock],
  );

  const press = useCallback(
    (digit: string) => {
      if (busy || wait > 0) return;
      setError("");
      setPin((p) => {
        if (p.length >= LENGTH) return p;
        const next = p + digit;
        if (next.length === LENGTH) submit(next);
        return next;
      });
    },
    [busy, wait, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#0d0c0c] px-5 py-10 text-white">
      <div className="w-full max-w-sm text-center">
        <Image src="/images/logos/coh_logo.png" alt="" width={56} height={56} className="mx-auto" />
        <p className="mt-6 text-xs tracking-[0.3em] text-white/50">INTERNAL ADMIN ACCESS</p>
        <h1 className="mt-2 text-2xl font-semibold">Masukkan PIN</h1>

        <div className={`mt-8 flex justify-center gap-3 ${shake ? "animate-shake" : ""}`} aria-label={`${pin.length} dari ${LENGTH} digit`}>
          {Array.from({ length: LENGTH }, (_, i) => (
            <span key={i} className={`h-3.5 w-3.5 rounded-full transition-colors ${i < pin.length ? "bg-primary" : "bg-white/15"}`} />
          ))}
        </div>

        <p className="mt-5 h-5 text-sm text-[#ff8a7a]" role="alert">
          {wait > 0 ? `Terkunci. Coba lagi dalam ${wait} detik.` : error}
        </p>

        <div className="mx-auto mt-6 grid max-w-[264px] grid-cols-3 gap-4">
          {keys.map((k, i) =>
            k === "" ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                type="button"
                disabled={wait > 0 || busy}
                onClick={() => (k === "⌫" ? setPin((p) => p.slice(0, -1)) : press(k))}
                aria-label={k === "⌫" ? "Hapus" : k}
                className="h-[72px] rounded-full bg-white/[0.07] text-2xl font-medium transition hover:bg-white/15 active:scale-95 disabled:opacity-30"
              >
                {k}
              </button>
            ),
          )}
        </div>

        <Link href="/en/" className="mt-10 inline-block text-sm text-white/40 hover:text-white/80">← Kembali ke situs</Link>
      </div>
    </main>
  );
}
