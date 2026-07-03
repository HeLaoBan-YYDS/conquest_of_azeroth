import type { MetadataRoute } from "next";
import { getLocalizedUrl, routing } from "@/i18n/routing";
import { getAllContentPaths } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://conquest-of-azeroth-1.wiki";
  const lastModified = new Date();
  const contentTypeStaticPaths = [
    "/guide",
    "/release",
    "/access",
    "/classes",
    "/builds",
    "/rankings",
    "/addons",
    "/community",
  ];
  const staticPaths = [
    "/",
    ...contentTypeStaticPaths,
    "/privacy-policy",
    "/terms-of-service",
    "/copyright",
    "/about",
  ];

  const contentPaths = await getAllContentPaths("en");
  const dynamicPaths = contentPaths.map((item) => `/${[item.contentType, ...item.slug].join("/")}`);
  const paths = [...staticPaths, ...dynamicPaths];
  const contentTypePaths = new Set(contentTypeStaticPaths);

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: getLocalizedUrl(siteUrl, locale, path),
      lastModified,
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1 : contentTypePaths.has(path) ? 0.8 : 0.6,
    })),
  );
}
