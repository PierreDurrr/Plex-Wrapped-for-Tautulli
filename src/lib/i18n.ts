import { t, type SupportedLocale, type TranslationKey } from "./translations";

export const DEFAULT_LOCALE: SupportedLocale = "fr";

export function getLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const saved = window.localStorage.getItem("locale");
  return saved === "en" || saved === "fr" ? saved : DEFAULT_LOCALE;
}

export function setLocale(locale: SupportedLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("locale", locale);
  window.location.reload();
}

export function translate(key: TranslationKey, values?: Record<string, string | number>, locale = getLocale()) {
  return t(key, values, locale);
}

export function tr(key: TranslationKey, values?: Record<string, string | number>) {
  return translate(key, values, DEFAULT_LOCALE);
}

export { t, type TranslationKey, type SupportedLocale };
export const i18n = { t: translate, tr };
