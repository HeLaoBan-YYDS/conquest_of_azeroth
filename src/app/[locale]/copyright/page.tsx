import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { getLanguageAlternates, getLocalizedPath, getLocalizedUrl } from "@/i18n/routing";
import en from "@/locales/en.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://conquest-of-azeroth-1.wiki";
type Messages = typeof en;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await getMessages({ locale })) as Messages;
  const title = messages.legal.copyright.title;
  const description = messages.legal.copyright.description;
  const pathname = "/copyright";
  return {
    title,
    description,
    alternates: { canonical: getLocalizedPath(locale, pathname), languages: getLanguageAlternates(pathname) },
    openGraph: { title, description, url: getLocalizedUrl(siteUrl, locale, pathname), siteName: messages.site.name },
    twitter: { card: "summary", title, description },
  };
}

export default async function CopyrightPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = (await getMessages({ locale })) as Messages;
  const { title, content } = messages.legal.copyright;

  return (
    <LegalPage title={title}>
      {content.map((paragraph, idx) => (
        <p key={idx}>{paragraph}</p>
      ))}
    </LegalPage>
  );
}
