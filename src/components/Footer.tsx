import Link from "next/link";
import { CONTACT_EMAIL, WHATSAPP_URL, type Dictionary, type Locale } from "@/i18n";
import SecretLogo from "./SecretLogo";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  return (
    <footer className="mx-auto max-w-[1066px] px-4 pb-8 pt-16">
      <div className="grid gap-10 md:grid-cols-[1fr_auto_auto] md:gap-24">
        <div className="max-w-[330px]">
          <SecretLogo />
          <p className="mt-8 text-sm leading-relaxed">{f.description}</p>
        </div>
        <div>
          <h3 className="mb-4 font-medium">{f.menu}</h3>
          <ul className="space-y-3 text-sm">
            <li><Link className="hover:underline" href={`/${locale}`}>{f.menu_home}</Link></li>
            <li><Link className="hover:underline" href={`/${locale}/about`}>{f.menu_about}</Link></li>
            <li><Link className="hover:underline" href={`/${locale}/article`}>{f.menu_article}</Link></li>
            <li><Link className="hover:underline" href={`/${locale}/events`}>{f.menu_events}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-medium">{f.faith_mission}</h3>
          <ul className="space-y-3 text-sm">
            <li><Link className="hover:underline" href={`/${locale}/about`}>{f.our_story}</Link></li>
            <li><a className="hover:underline" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{f.get_involved}</a></li>
          </ul>
          <div className="mt-8">
            <h3 className="mb-4 font-medium">{f.contact}</h3>
            <a className="text-sm hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>
      <p className="mt-10 text-xs">© {new Date().getFullYear()} {f.copyright}</p>
    </footer>
  );
}
