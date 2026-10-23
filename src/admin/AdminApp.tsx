"use client";

import { useEffect, useState } from "react";
import type { Content } from "@/data";
import { isUnlocked, lock } from "./auth";
import Dashboard from "./Dashboard";
import PinGate from "./PinGate";

export default function AdminApp({ initial, library }: { initial: Content; library: string[] }) {
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");

  useEffect(() => setState(isUnlocked() ? "open" : "locked"), []);

  if (state === "loading") return <div className="min-h-svh bg-[#0d0c0c]" />;
  if (state === "locked") return <PinGate pinHash={initial.settings.pinHash} onUnlock={() => setState("open")} />;
  return (
    <Dashboard
      initial={initial}
      library={library}
      onLogout={() => {
        lock();
        setState("locked");
      }}
    />
  );
}
