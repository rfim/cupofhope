import { WHATSAPP_URL, type Dictionary } from "@/i18n";
import { asset } from "@/lib/asset";

export default function ConnectCta({ dict }: { dict: Dictionary }) {
  return (
    <section className="px-4 py-16 md:py-24">
      <div
        className="relative mx-auto flex max-w-[1040px] flex-col items-center overflow-hidden rounded-[40px] bg-cover bg-center px-6 py-14 text-center text-white md:py-16"
        style={{ backgroundImage: `url(${asset("/images/pages/events/event-cta.png")})` }}
      >
        <div className="absolute inset-0 bg-[#1f2a33]/80" />
        <div className="relative">
          <h2 className="text-3xl font-bold md:text-[42px]">{dict.connect.title}</h2>
          <p className="mx-auto mt-6 max-w-[540px] leading-relaxed md:text-lg">{dict.connect.body}</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-black transition hover:brightness-95 md:px-10 md:py-3.5"
          >
            {dict.cta.get_involved}
          </a>
        </div>
      </div>
    </section>
  );
}
