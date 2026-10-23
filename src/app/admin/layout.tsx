import type { Metadata } from "next";
import { asset } from "@/lib/asset";
import { caveat, lufga } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | Cup of Hope",
  robots: { index: false, follow: false },
  icons: { icon: asset("/images/logos/coh_logo.png") },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${lufga.variable} ${caveat.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
