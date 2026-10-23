import type { Metadata } from "next";
import Image from "next/image";
import ArticleCard from "@/components/ArticleCard";
import { articles } from "@/data";
import { getDictionary, type Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDictionary(locale).metadata;
  return { title: m.articles_title, description: m.articles_description, alternates: { canonical: `/${locale}/article` } };
}

const floaters = [
  { src: "/images/pages/article/hero1.png", className: "left-[8%] top-[90px] w-28 [--r:-18deg]", blur: false },
  { src: "/images/pages/article/hero3.png", className: "left-[48%] top-[110px] w-16 [--r:0deg]", blur: true },
  { src: "/images/pages/article/hero2.png", className: "right-[4%] top-[90px] w-36 [--r:24deg]", blur: true },
  { src: "/images/pages/article/hero6.png", className: "left-[15%] top-[240px] w-14 [--r:0deg]", blur: true },
  { src: "/images/pages/article/hero4.png", className: "right-[4%] top-[330px] w-32 [--r:6deg]", blur: false },
  { src: "/images/pages/article/hero5.png", className: "left-[6%] top-[400px] w-28 [--r:-4deg]", blur: false },
];

export default async function ArticlesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <>
      <section className="relative overflow-hidden px-6 pb-24 pt-44 text-center md:pb-48 md:pt-52">
        {floaters.map((f, i) => (
          <Image
            key={f.src}
            src={f.src}
            alt=""
            width={160}
            height={160}
            className={`animate-float pointer-events-none absolute hidden h-auto md:block ${f.className} ${f.blur ? "blur-[3px]" : ""}`}
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
        <h1 className="relative mx-auto max-w-[620px] text-5xl font-semibold leading-[1.15] md:text-[64px]">{dict.articles_page.title}</h1>
        <p className="relative mx-auto mt-8 max-w-[600px] text-lg leading-relaxed text-neutral-700">{dict.articles_page.subtitle}</p>
      </section>
      <section className="mx-auto grid max-w-[1060px] gap-5 px-6 pb-16 md:grid-cols-3">
        {articles.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} dict={dict} />)}
      </section>
    </>
  );
}
