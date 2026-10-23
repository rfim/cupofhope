import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const preferred = request.headers.get("accept-language")?.toLowerCase().startsWith("id") ? "id" : defaultLocale;
  request.nextUrl.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|images|favicon.ico|robots.txt|sitemap.xml).*)"],
};
