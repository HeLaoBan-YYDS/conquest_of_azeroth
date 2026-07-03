import type { Locale } from "@/i18n/routing";

type LocalizedText = Record<Locale, string>;

export type ActiveCode = {
  label: string;
  detail: LocalizedText;
  badge: LocalizedText;
};

export const activeCodesLastVerified = "2026-07-03";

const copyCodeLabel: LocalizedText = {
  en: "Copy code",
  "pt-br": "Copy code",
  es: "Copy code",
  fr: "Copy code",
};

const copiedCodeLabel: LocalizedText = {
  en: "Copied",
  "pt-br": "Copied",
  es: "Copied",
  fr: "Copied",
};

export const ACTIVE_CODES: ActiveCode[] = [
  {
    label: "No active code",
    detail: {
      en: "No officially confirmed Conquest of Azeroth redeem codes are available yet.",
      "pt-br": "No officially confirmed Conquest of Azeroth redeem codes are available yet.",
      es: "No officially confirmed Conquest of Azeroth redeem codes are available yet.",
      fr: "No officially confirmed Conquest of Azeroth redeem codes are available yet.",
    },
    badge: { en: "Unavailable", "pt-br": "Unavailable", es: "Unavailable", fr: "Unavailable" },
  },
  {
    label: "No active code",
    detail: {
      en: "Watch the official Discord and Project Ascension channels for future code announcements.",
      "pt-br": "Watch the official Discord and Project Ascension channels for future code announcements.",
      es: "Watch the official Discord and Project Ascension channels for future code announcements.",
      fr: "Watch the official Discord and Project Ascension channels for future code announcements.",
    },
    badge: { en: "Unavailable", "pt-br": "Unavailable", es: "Unavailable", fr: "Unavailable" },
  },
];

export function getActiveCodes(locale: string) {
  const normalizedLocale = locale as Locale;

  return ACTIVE_CODES.map((code) => ({
    label: code.label,
    detail: code.detail[normalizedLocale] ?? code.detail.en,
    badge: code.badge[normalizedLocale] ?? code.badge.en,
  }));
}

export function getCodeCopyLabels(locale: string) {
  const normalizedLocale = locale as Locale;

  return {
    copy: copyCodeLabel[normalizedLocale] ?? copyCodeLabel.en,
    copied: copiedCodeLabel[normalizedLocale] ?? copiedCodeLabel.en,
  };
}
