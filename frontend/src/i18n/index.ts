import en from './en';
import hi from './hi';
import ta from './ta';

export type Locale = 'en' | 'hi' | 'ta';
export type TranslationKey = keyof typeof en;

const translations: Record<Locale, Record<string, string>> = { en, hi, ta };

export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function getLocaleLabel(locale: Locale): string {
  switch (locale) {
    case 'en': return 'English';
    case 'hi': return 'हिन्दी';
    case 'ta': return 'தமிழ்';
    default: return 'English';
  }
}

export { en, hi, ta };
