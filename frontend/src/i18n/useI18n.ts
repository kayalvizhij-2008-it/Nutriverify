import { useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { t as translate, Locale } from './index';

/**
 * Hook providing translation function and current locale.
 * Usage: const { t, locale } = useI18n();
 *        <p>{t('dashboard.welcome')}</p>
 *        <p>{t('dashboard.welcome').replace('{name}', user.fullName)}</p>
 */
export function useI18n() {
  const { language, setLanguage } = useAuth();
  const locale = (language || 'en') as Locale;

  const t = useCallback(
    (key: string): string => translate(locale, key),
    [locale]
  );

  return { t, locale, setLanguage };
}
