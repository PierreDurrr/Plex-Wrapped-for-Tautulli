import { translations, type TranslationKey } from "./translations";

export const DEFAULT_LOCALE = "fr";

export function getLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const saved = window.localStorage.getItem("locale");
  if (saved && saved in translations) return saved as keyof typeof translations;
  return DEFAULT_LOCALE;
}

export function setLocale(locale: keyof typeof translations) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("locale", locale);
  window.location.reload();
}

export function t(
  key: TranslationKey,
  values?: Record<string, string | number>,
  locale = getLocale(),
) {
  const bundle = translations[locale as keyof typeof translations] ?? translations.fr;
  let text = bundle[key] ?? translations.fr[key] ?? key;

  if (values) {
    for (const [k, v] of Object.entries(values)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }

  return text;
}

