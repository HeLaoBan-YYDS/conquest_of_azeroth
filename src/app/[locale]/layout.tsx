import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { StickySidebarAd } from "@/components/ads/sticky-sidebar-ad";
import { StickyTopAd } from "@/components/ads/sticky-top-ad";
import { JsonLd, SiteFooter, SiteHeader } from "@/components/site";
import { getLocalizedUrl, routing } from "@/i18n/routing";
import en from "@/locales/en.json";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://conquest-of-azeroth-1.wiki";
const gameName = "Conquest of Azeroth";
const defaultSiteName = `${gameName} Wiki`;
const organizationSameAs = [
  "https://ascension.gg/en",
  "https://ascension.gg/en/features/new-wow-classes-coa",
  "https://ascension.gg/en/news/conquest-of-azeroth",
  "https://ascension.gg/en/download",
  "https://ascension.gg/en/status",
  "https://discord.gg/customwow",
  "https://www.youtube.com/@ascensiongg",
  "https://db.ascension.gg/",
  "https://www.reddit.com/r/ProjectAscension/",
  "https://x.com/Ascensionfeed",
];
const stickyTopAdKey = process.env.NEXT_PUBLIC_AD_MOBILE_320X50?.trim();
const stickySidebarAdKey = process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600?.trim();

type Messages = typeof en;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await getMessages({ locale })) as Messages;
  const siteName = messages.site.name || defaultSiteName;
  const siteDescription = messages.site.description;
  const image = `${siteUrl}/images/hero.webp`;
  const url = getLocalizedUrl(siteUrl, locale, "/");
  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteName, template: "%s" },
    description: siteDescription,
    openGraph: { type: "website", locale, url, siteName, title: siteName, description: siteDescription, images: [{ url: image, width: 1280, height: 720, alt: siteName }] },
    twitter: { card: "summary_large_image", title: siteName, description: siteDescription, images: [image] },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = (await getMessages()) as Messages;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": messages.site.name,
    "url": siteUrl,
    "logo": `${siteUrl}/android-chrome-512x512.png`,
    "image": `${siteUrl}/images/hero.webp`,
    "sameAs": organizationSameAs,
  };

  return (
    <html lang={locale} className={`${inter.variable}`} suppressHydrationWarning>
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-GBF02C3ST1" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-GBF02C3ST1');
        `}
      </Script>
      <Script id="microsoft-clarity">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xbu3tsvvt5");
        `}
      </Script>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
            <JsonLd data={organization} />
            <SiteHeader locale={locale} />
            <StickyTopAd adKey={stickyTopAdKey} />
            <StickySidebarAd adKey={stickySidebarAdKey} />
            <div className={stickySidebarAdKey ? "lg:pl-[152px] 2xl:pl-0" : undefined}>
              {children}
              <SiteFooter locale={locale} />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
