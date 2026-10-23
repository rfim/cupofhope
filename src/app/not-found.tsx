import { getDictionary } from "@/i18n";
import { asset } from "@/lib/asset";
import "./globals.css";

export default function NotFound() {
  const dict = getDictionary("en");
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">{dict.error_title}</h1>
        <p className="mt-4 max-w-md text-neutral-600">{dict.error_subtitle}</p>
        <a href={asset("/en/")} className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold">{dict.error_button}</a>
      </body>
    </html>
  );
}
