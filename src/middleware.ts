import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({ ...routing, alternateLinks: false });
const localeHeaderName = "X-NEXT-INTL-LOCALE";
const defaultLocaleRewriteHeader = "X-Default-Locale-Rewrite";

function hasLocalePrefix(pathname: string) {
  const firstSegment = pathname.split("/")[1];
  return routing.locales.some((locale) => locale === firstSegment);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);
  const defaultLocalePrefix = `/${routing.defaultLocale}`;
  const hasDefaultLocalePrefix = pathname === defaultLocalePrefix || pathname.startsWith(`${defaultLocalePrefix}/`);

  if (
    headers.get(defaultLocaleRewriteHeader) === "1" &&
    hasDefaultLocalePrefix
  ) {
    headers.set(localeHeaderName, routing.defaultLocale);
    return NextResponse.next({ request: { headers } });
  }

  if (hasDefaultLocalePrefix) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === defaultLocalePrefix ? "/" : pathname.slice(defaultLocalePrefix.length);

    return NextResponse.redirect(redirectUrl, 308);
  }

  if (!hasLocalePrefix(pathname)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${routing.defaultLocale}${pathname === "/" ? "" : pathname}`;

    headers.set(localeHeaderName, routing.defaultLocale);
    headers.set(defaultLocaleRewriteHeader, "1");

    return NextResponse.rewrite(rewriteUrl, { request: { headers } });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
