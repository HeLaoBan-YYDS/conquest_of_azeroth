import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { JsonLd, WikiSidebar } from "@/components/site";
import { getAllContent, getDynamicNavigation, type ContentItem, CONTENT_TYPES } from "@/lib/content";
import { getLanguageAlternates, getLocalizedPath, getLocalizedUrl, type Locale } from "@/i18n/routing";
import en from "@/locales/en.json";
import HomePageClient from "./HomePageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://conquest-of-azeroth-1.wiki";
const officialLinks = [
  "https://ascension.gg/en",
  "https://ascension.gg/en/features/new-wow-classes-coa",
  "https://ascension.gg/en/news/conquest-of-azeroth",
  "https://ascension.gg/en/download",
  "https://ascension.gg/en/status",
  "https://discord.gg/customwow",
  "https://www.youtube.com/@ascensiongg",
  "https://www.youtube.com/watch?v=pIPOCauIHKw",
  "https://db.ascension.gg/",
  "https://www.reddit.com/r/ProjectAscension/",
  "https://x.com/Ascensionfeed",
];

type Messages = typeof en;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await getMessages({ locale })) as Messages;
  const title = messages.home.meta.title;
  const description = messages.home.meta.description;
  const image = `${siteUrl}/images/hero.webp`;
  return {
    title,
    description,
    alternates: { canonical: getLocalizedPath(locale, "/"), languages: getLanguageAlternates("/") },
    openGraph: { title, description, url: getLocalizedUrl(siteUrl, locale, "/"), siteName: messages.site.name, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  const messages = (await getMessages({ locale })) as Messages;
  const navGroups = getDynamicNavigation(loc);
  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: messages.site.name,
    alternateName: messages.site.shortName,
    url: siteUrl,
    description: messages.site.description,
    inLanguage: locale,
    sameAs: officialLinks,
  };

  // 动态加载所有 content 目录下的文章
  const allArticles: ContentItem[] = [];
  for (const contentType of CONTENT_TYPES) {
    const items = await getAllContent(contentType, loc);
    allArticles.push(...items);
  }

  // 取最近更新的 8 篇文章（按 date 倒序）
  const recentArticles = [...allArticles]
    .sort((a, b) => {
      const dateA = a.metadata.lastModified || a.metadata.date;
      const dateB = b.metadata.lastModified || b.metadata.date;
      return dateB.localeCompare(dateA);
    })
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl min-w-0 px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={webSite} />
      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <HomePageClient home={messages.home} locale={locale} articles={allArticles} recentArticles={recentArticles} />
        <WikiSidebar locale={locale} navGroups={navGroups} />
      </div>
    </main>
  );
}
