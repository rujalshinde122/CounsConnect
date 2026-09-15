'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import en from '@/messages/en.json';
import hi from '@/messages/hi.json';
import mr from '@/messages/mr.json';

export type Locale = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: Locale;
  label: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en,
  hi,
  mr,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  languages: LanguageOption[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedTranslation(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale = 'en' }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('counsconnect_locale') as Locale | null;
        if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
          return stored;
        }
      } catch {
        // Ignore localStorage read errors
      }
    }
    return initialLocale;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.setAttribute('data-locale', locale);
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('counsconnect_locale', newLocale);
      document.cookie = `counsconnect_locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
        document.documentElement.setAttribute('data-locale', newLocale);
      }
    } catch {
      // Ignore persistence errors
    }
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const activeDict = dictionaries[locale] || dictionaries.en;
      let text = getNestedTranslation(activeDict, key);

      // Fallback to English if translation is missing
      if (!text && locale !== 'en') {
        text = getNestedTranslation(dictionaries.en, key);
      }

      // Final fallback to key itself
      if (!text) {
        return key;
      }

      // Interpolate parameters like {count}, {name}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return text;
    };
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      languages: SUPPORTED_LANGUAGES,
      t,
    }),
    [locale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
