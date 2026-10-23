import Image from "next/image";
import Link from "next/link";
import { excerpt, type Article } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { ArrowRightIcon, CalendarIcon } from "./Icons";

export default function ArticleCard({ article, locale, dict }: { article: Article; locale: Locale; dict: Dictionary }) {
  const a = article[locale];
  return (
    <article className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image src={article.image} alt={a.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
        <CalendarIcon className="h-4 w-4 text-primary-400" />{article.date}
      </p>
      <h3 className="mt-2 text-lg font-semibold leading-snug">{a.title}</h3>
      <p className="mt-4 line-clamp-3 leading-relaxed text-neutral-600">{excerpt(a.body[0])}</p>
      <Link href={`/${locale}/article/${article.slug}`} className="mt-6 flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700">
        {dict.articles_page.read_more} <ArrowRightIcon />
      </Link>
    </article>
  );
}
