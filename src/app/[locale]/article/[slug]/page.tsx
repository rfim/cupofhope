import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { ArrowRightIcon, CalendarIcon } from "@/components/Icons";
import JsonLd from "@/components/JsonLd";
import ShareButtons from "@/components/ShareButtons";
import { articles, formatDate, getArticle, readingMinutes, relatedArticles } from "@/data";
import { getDictionary, locales, SITE_URL, type Locale } from "@/i18n";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article[locale].title} | Cup of Hope`,
    description: (article[locale].body[0] ?? "").slice(0, 160),
    alternates: { canonical: `/${locale}/article/${slug}` },
    openGraph: { type: "article", publishedTime: article.date, images: [article.image] },
  };
}

export default async function ArticleDetailPage({ params }: Params) {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const dict = getDictionary(locale);
  const a = article[locale];
  const url = `${SITE_URL}/${locale}/article/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    image: `${SITE_URL}${article.image}`,
    datePublished: article.date,
    inLanguage: locale,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Cup of Hope" },
    publisher: { "@type": "Organization", name: "Cup of Hope", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logos/coh_logo.png` } },
  };

  return (
    <>
      <JsonLd data={schema} />
      <article className="mx-auto max-w-[750px] px-6 pb-10 pt-32 md:pt-36">
        <Link href={`/${locale}/article`} className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" /> {dict.article.back}
        </Link>
        <p className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <CalendarIcon className="h-4 w-4 text-primary-400" />
          {formatDate(article.date, locale)}
          <span aria-hidden>·</span>
          {readingMinutes(a.body)} {dict.article.min_read}
        </p>
        <h1 className="mx-auto mt-4 max-w-[680px] text-center text-3xl font-semibold leading-tight md:text-[44px]">{a.title}</h1>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={article.image} alt={a.title} fill priority sizes="(min-width: 768px) 700px, 100vw" className="object-cover" />
        </div>
        <div className="mt-12 space-y-6 text-[15px] leading-[1.85] text-neutral-800 md:text-base">
          {a.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <ShareButtons url={url} title={a.title} label={dict.article.share} />
      </article>

      <section className="mx-auto max-w-[1060px] px-6 py-16">
        <h2 className="text-3xl font-semibold">{dict.article.related_title}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {relatedArticles(slug).map((r) => <ArticleCard key={r.slug} article={r} locale={locale} dict={dict} />)}
        </div>
      </section>
    </>
  );
}
