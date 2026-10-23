import type { Metadata } from "next";
import UnderDevelopment from "@/components/UnderDevelopment";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.our_team_title, description: m.our_team_description, alternates: { canonical: `/${locale}/our-team` } };
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <UnderDevelopment text={getDictionary(locale).under_development} />;
}
