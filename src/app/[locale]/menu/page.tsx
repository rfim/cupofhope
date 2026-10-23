import type { Metadata } from "next";
import MenuBrowser from "@/components/menu/MenuBrowser";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.menu_title, description: m.menu_description, alternates: { canonical: `/${locale}/menu` } };
}

export default async function MenuPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <MenuBrowser locale={locale} dict={getDictionary(locale)} />;
}
