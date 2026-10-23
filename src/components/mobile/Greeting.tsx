"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";

/** "Good morning ☀︎" based on the visitor's local time. */
export default function Greeting({ dict }: { dict: Dictionary }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    const m = dict.mobile;
    setText(h < 11 ? `${m.morning} ☀︎` : h < 15 ? `${m.afternoon} ☕` : h < 18 ? `${m.late_afternoon} ☕` : `${m.evening} ☾`);
  }, [dict]);
  return <p className="h-6 text-[15px] text-black/50">{text}</p>;
}
