import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import Script from "next/script";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getDictionary, isLocale, locales, SITE_URL } from "@/i18n";
import { asset } from "@/lib/asset";
import "../globals.css";

const lufga = localFont({
  src: [
    { path: "../fonts/LufgaRegular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/LufgaItalic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/LufgaMedium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/LufgaSemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/LufgaBold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-lufga",
  display: "swap",
});

const GA_ID = "G-GH1LD8PFHQ";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).metadata;
  return {
    metadataBase: new URL(SITE_URL),
    title: m.home_title,
    description: m.home_description,
    icons: { icon: asset("/images/logos/coh_logo.png"), apple: asset("/images/logos/coh_logo.png") },
    manifest: asset("/images/favicon/site.webmanifest"),
    appleWebApp: { title: "Cup of Hope" },
    openGraph: {
      siteName: "Cup of Hope",
      locale: locale === "id" ? "id_ID" : "en_US",
      type: "website",
      images: ["/images/pages/about/cafe_photo_example.webp"],
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={lufga.variable}>
      <body className="font-sans">
        <Navbar locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
