"use client";

import { useEffect, useState } from "react";
import type { Branch } from "@/data";
import type { Dictionary } from "@/i18n";
import { branchStatus } from "@/lib/branches";

/** Small "● Open now · until 21:00" pill. */
export default function BranchStatus({ branch, dict, className = "" }: { branch: Branch; dict: Dictionary; className?: string }) {
  const [s, setS] = useState<ReturnType<typeof branchStatus> | null>(null);
  const t = dict.mobile;

  useEffect(() => {
    const tick = () => setS(branchStatus(branch));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [branch]);

  if (!s) return <span className={`inline-block h-5 w-24 animate-pulse rounded-full bg-black/5 ${className}`} />;

  const color = s.open ? (s.closingSoon ? "#d97706" : "#16a34a") : "#9ca3af";
  const label = s.open ? (s.closingSoon ? t.closing_soon : t.open_now) : t.closed_now;
  const detail = s.open ? `${t.until} ${branch.hours.close}` : `${t.opens} ${branch.hours.open}`;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <span className="relative flex h-2 w-2">
        {s.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: color }} />}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <span className="font-medium" style={{ color }}>{label}</span>
      <span className="text-black/40">· {detail}</span>
    </span>
  );
}
