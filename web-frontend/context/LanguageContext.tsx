'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

const dictionaries: Record<Locale, Record<string, any>> = {
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

function getNestedTranslation(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
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
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync with localStorage on client mount if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('counsconnect_locale') as Locale | null;
      if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
        if (stored !== locale) {
          setLocaleState(stored);
        }
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('counsconnect_locale', newLocale);
      document.cookie = `counsconnect_locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
    } catch {
      // Ignore persistence errors
    }
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      // Try current locale
      let text = getNestedTranslation(dictionaries[locale], key);
      // Fallback to English
      if (text === undefined && locale !== 'en') {
        text = getNestedTranslation(dictionaries.en, key);
      }
      // If still not found, return key
      if (text === undefined) {
        return key;
      }
      // Interpolate parameters {param}
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text?.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return text;
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, languages: SUPPORTED_LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
