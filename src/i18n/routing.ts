import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported locales.
 *
 * To add a new language you must update THREE places that have to stay in sync:
 *   1. The `locales` array below.
 *   2. The static imports + `messagesMap` in `src/i18n/request.ts`.
 *   3. The matching JSON file in `src/locales/<locale>.json`.
 */
export const routing = defineRouting({
  locales: ["en", "es", "pt-br", "fr"],
  defaultLocale: "en",
  // English is the default locale and should live at `/`, not `/en`.
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

function normalizePathname(pathname: string) {
  if (!pathname) return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getLocalizedPath(locale: string, pathname: string = "/") {
  const normalizedPathname = normalizePathname(pathname);
  if (locale === routing.defaultLocale) return normalizedPathname;

  return `/${locale}${normalizedPathname === "/" ? "" : normalizedPathname}`;
}

export function getLocalizedUrl(siteUrl: string, locale: string, pathname: string = "/") {
  const origin = siteUrl.replace(/\/$/, "");
  const path = getLocalizedPath(locale, pathname);
  return `${origin}${path === "/" ? "" : path}`;
}

export function getLanguageAlternates(pathname: string) {
  return {
    "x-default": getLocalizedPath(routing.defaultLocale, pathname),
    ...Object.fromEntries(routing.locales.map((locale) => [locale, getLocalizedPath(locale, pathname)])),
  };
}
