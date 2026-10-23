import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/mobile/MobileTabBar";
import TapEffects from "@/components/TapEffects";
import Navbar from "@/components/Navbar";
import SecretTrigger from "@/components/SecretTrigger";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getDictionary, isLocale, locales, SITE_URL } from "@/i18n";
import { asset } from "@/lib/asset";
import { caveat, lufga } from "../fonts";
import "../globals.css";

const GA_ID = "G-GH1LD8PFHQ";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getDictionary(locale).metadata;
  return {
    metadataBase: new URL(SITE_URL),
    alternates: { languages: { en: "/en", id: "/id", "x-default": "/en" } },
    title: m.home_title,
    description: m.home_description,
    icons: { icon: asset("/images/logos/coh_logo.png"), apple: asset("/images/logos/coh_logo.png") },
    manifest: asset("/images/favicon/site.webmanifest"),
    appleWebApp: { title: "Cup of Hope", capable: true, statusBarStyle: "default" },
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
    <html lang={locale} className={`${lufga.variable} ${caveat.variable}`}>
      <body className="font-sans">
        <Navbar locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
        <WhatsAppButton label={dict.whatsapp_float} />
        <MobileTabBar locale={locale} dict={dict} />
        <SecretTrigger />
        <TapEffects />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
