import type { Metadata } from "next";
import UnderDevelopment from "@/components/UnderDevelopment";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.services_title, description: m.services_description, alternates: { canonical: `/${locale}/services` } };
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <UnderDevelopment text={getDictionary(locale).under_development} />;
}
