"use client";

import Image from "next/image";
import { useRef } from "react";
import { SECRET_EVENT } from "./SecretTrigger";

/** Footer logo; 5 quick taps open the admin panel (the touch-screen version of "open sesame"). */
export default function SecretLogo() {
  const taps = useRef<number[]>([]);

  const onTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      window.dispatchEvent(new Event(SECRET_EVENT));
    }
  };

  return (
    <Image
      src="/images/logos/coh_logo_full.png"
      alt="Cup of Hope coffee"
      width={100}
      height={79}
      onClick={onTap}
      className="select-none"
      draggable={false}
    />
  );
}
