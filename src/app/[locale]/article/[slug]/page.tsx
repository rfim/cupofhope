import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { CalendarIcon } from "@/components/Icons";
import { articles, getArticle, relatedArticles } from "@/data";
import { getDictionary, locales, type Locale } from "@/i18n";

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
    description: article[locale].body[0].slice(0, 160),
    alternates: { canonical: `/${locale}/article/${slug}` },
    openGraph: { type: "article", images: [article.image] },
  };
}

export default async function ArticleDetailPage({ params }: Params) {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const dict = getDictionary(locale);
  const a = article[locale];

  return (
    <>
      <article className="mx-auto max-w-[750px] px-6 pb-10 pt-36">
        <p className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <CalendarIcon className="h-4 w-4 text-primary-400" />{article.date}
        </p>
        <h1 className="mx-auto mt-4 max-w-[680px] text-center text-3xl font-semibold leading-tight md:text-[44px]">{a.title}</h1>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={article.image} alt={a.title} fill priority sizes="(min-width: 768px) 700px, 100vw" className="object-cover" />
        </div>
        <div className="mt-12 space-y-6 text-[15px] leading-[1.85] text-neutral-800">
          {a.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
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
