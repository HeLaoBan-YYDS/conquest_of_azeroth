import Link from "next/link";
import { ChevronRight, ExternalLink, Menu } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import type { NavGroup } from "@/lib/content";
import { getLocalizedPath } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CollapsibleNavGroup } from "@/components/collapsible-nav-group";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ClientThemeToggle } from "@/components/theme-toggle";

const OFFICIAL_DOWNLOAD_URL = "https://ascension.gg/en/download";
const OFFICIAL_SITE_URL = "https://ascension.gg/en";
const OFFICIAL_STATUS_URL = "https://ascension.gg/en/status";
const DISCORD_URL = "https://discord.gg/customwow";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ascensiongg";
const COMMUNITY_TOOL_URL = "https://db.ascension.gg/";
const OFFICIAL_FEATURES_URL = "https://ascension.gg/en/features/new-wow-classes-coa";
const REDDIT_URL = "https://www.reddit.com/r/ProjectAscension/";
const X_URL = "https://x.com/Ascensionfeed";

export function localizeHref(href: string, locale: string) {
  return getLocalizedPath(locale, href);
}

export async function SiteHeader({ locale }: { locale: string }) {
  const navT = await getTranslations({ locale, namespace: "nav" });
  const sharedT = await getTranslations({ locale, namespace: "shared" });
  const header = (
    <div className="flex items-center justify-between gap-4">
      <Link href={localizeHref("/", locale)} className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--nav-theme-light))] bg-[hsl(var(--nav-theme))] text-sm font-extrabold text-primary-foreground shadow-sm" aria-hidden="true">
          C
        </span>
        <span className="text-sm font-bold tracking-wide text-foreground">Conquest of Azeroth</span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        {NAVIGATION_CONFIG.map((item) => (
          <Link key={item.key} href={localizeHref(item.path, locale)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {navT(item.key)}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <LanguageSwitcher locale={locale} />
        <ThemeToggle label={sharedT("toggleTheme")} />
        <Sheet>
          <SheetTrigger asChild className="md:hidden"><Button variant="outline" size="icon" aria-label={sharedT("menu")}><Menu className="h-4 w-4" /></Button></SheetTrigger>
          <SheetContent className="border-border bg-background text-foreground">
            <div className="mt-8 grid gap-2">
              {NAVIGATION_CONFIG.map((item) => <Link key={item.key} href={localizeHref(item.path, locale)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-muted">{navT(item.key)}</Link>)}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
  return <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl"><div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">{header}</div></header>;
}

function ThemeToggle({ label }: { label: string }) {
  return <ClientThemeToggle label={label} />;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <ChevronRight className="h-4 w-4" />}{item.href ? <Link className="hover:text-foreground" href={item.href}>{item.label}</Link> : <span className="text-foreground">{item.label}</span>}</span>)}</nav>;
}

export async function WikiSidebar({ locale, navGroups, currentPath }: { locale: string; navGroups: NavGroup[]; currentPath?: string }) {
  const t = await getTranslations({ locale, namespace: "shared" });
  const isActive = (href: string) => currentPath === href;

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
      <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{t("wikiNavigation")}</h3>
        <div className="space-y-4">
          {navGroups.map((group) => (
            <CollapsibleNavGroup key={group.slug} title={group.title} icon={<span className="grid h-4 w-4 place-items-center rounded text-[10px] font-bold text-[hsl(var(--nav-theme))]">{group.title[0]}</span>} count={group.count} currentPath={currentPath}>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={localizeHref(link.href, locale)} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${isActive(link.href) ? "bg-[hsl(var(--nav-theme)/0.15)] font-semibold text-[hsl(var(--nav-theme))]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <span className="truncate">{link.label}</span>
                      {link.badge && <Badge variant="secondary" className="ml-auto h-5 border-border px-1.5 text-[10px]">{link.badge}</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleNavGroup>
          ))}
        </div>
      </section>
    </aside>
  );
}

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const site = await getTranslations({ locale, namespace: "site" });
  return (
    <footer className="mt-16 border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-border bg-muted/40 p-5">
          <div className="font-bold text-foreground">{t("aboutTitle")}</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
          <Link href={OFFICIAL_DOWNLOAD_URL} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--nav-theme))]">{t("playGame")} <ExternalLink className="h-4 w-4" /></Link>
        </div>
        <p className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{site("legalNotice")}</p>
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-bold text-foreground">{t("aboutTitle")}</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{t("about")}</p>
          </div>
          <FooterList locale={locale} title={t("quickLinks")} links={[[t("playGame"), OFFICIAL_DOWNLOAD_URL], [t("officialEvent"), OFFICIAL_SITE_URL], [t("officialStatus"), OFFICIAL_STATUS_URL], [t("officialDiscord"), DISCORD_URL], [t("officialYoutube"), YOUTUBE_CHANNEL_URL], [t("officialWiki"), OFFICIAL_FEATURES_URL], [t("officialX"), X_URL], [t("officialReddit"), REDDIT_URL], [t("communityTool"), COMMUNITY_TOOL_URL]]} />
          <FooterList locale={locale} title={t("guides")} links={[[t("guideGuide"), "/guide"], [t("accessGuide"), "/access"], [t("rankingsGuide"), "/rankings"], [t("classesGuide"), "/classes"], [t("buildsGuide"), "/builds"], [t("addonsGuide"), "/addons"], [t("releaseGuide"), "/release"], [t("communityGuide"), "/community"], [t("privacyPolicy"), "/privacy-policy"], [t("termsOfService"), "/terms-of-service"]]} />
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">{t("copyright")}</p>
      </div>
    </footer>
  );
}

function FooterList({ title, links, locale }: { title: string; links: string[][]; locale: string }) {
  return <div><h4 className="font-semibold text-foreground">{title}</h4><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{links.map(([label, href]) => {
    const localizedHref = href.startsWith("/") ? localizeHref(href, locale) : href;
    return <li key={href}><Link className="hover:text-foreground" href={localizedHref}>{label}</Link></li>;
  })}</ul></div>;
}

export function JsonLd({ data }: { data: unknown }) { return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />; }
