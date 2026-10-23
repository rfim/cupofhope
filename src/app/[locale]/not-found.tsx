import Link from "next/link";
import { getDictionary } from "@/i18n";

export default function NotFound() {
  const dict = getDictionary("en");
  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center px-6 pt-28 text-center">
      <h1 className="text-4xl font-bold md:text-5xl">{dict.error_title}</h1>
      <p className="mt-4 max-w-md text-neutral-600">{dict.error_subtitle}</p>
      <Link href="/en" className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold">{dict.error_button}</Link>
    </section>
  );
}
