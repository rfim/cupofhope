import Image from "next/image";
import Link from "next/link";
import { excerpt, formatDate, readingMinutes, type Article } from "@/data";
import type { Dictionary, Locale } from "@/i18n";
import { ArrowRightIcon, CalendarIcon } from "./Icons";

export default function ArticleCard({ article, locale, dict }: { article: Article; locale: Locale; dict: Dictionary }) {
  const a = article[locale];
  return (
    <Link
      href={`/${locale}/article/${article.slug}`}
      className="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0_0_0/0.06)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image src={article.image} alt={a.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
        <CalendarIcon className="h-4 w-4 text-primary-400" />
        {formatDate(article.date, locale)}
        <span aria-hidden>·</span>
        {readingMinutes(a.body)} {dict.article.min_read}
      </p>
      <h3 className="mt-2 text-lg font-semibold leading-snug">{a.title}</h3>
      <p className="mt-4 line-clamp-3 leading-relaxed text-neutral-600">{excerpt(a.body[0] ?? "")}</p>
      <span className="mt-auto flex items-center gap-2 pt-6 font-medium text-primary-600 group-hover:text-primary-700">
        {dict.articles_page.read_more} <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
