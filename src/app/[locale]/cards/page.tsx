import type { Metadata } from "next";
import CardsCollection from "@/components/cards/CardsCollection";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.cards_title, description: m.cards_description, alternates: { canonical: `/${locale}/cards` } };
}

export default async function CardsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <CardsCollection locale={locale} dict={getDictionary(locale)} />;
}
