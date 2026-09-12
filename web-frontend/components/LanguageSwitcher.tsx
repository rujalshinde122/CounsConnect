'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Locale } from '@/context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'navbar' | 'auth' | 'compact';
}

export default function LanguageSwitcher({ className, variant = 'navbar' }: LanguageSwitcherProps) {
  const { locale, setLocale, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = languages.find((l) => l.code === locale) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none',
          variant === 'auth'
            ? 'bg-white/90 hover:bg-white text-[#2D3A3A] border border-[#E2E0D6] shadow-sm backdrop-blur-xs'
            : 'bg-white hover:bg-white/90 text-[#2D3A3A] border border-[#E2E0D6] shadow-2xs hover:border-[#588B8B]/40'
        )}
      >
        <Globe className="w-3.5 h-3.5 text-[#588B8B] shrink-0" />
        <span className="font-semibold">{activeLang.native}</span>
        {variant !== 'compact' && (
          <span className="text-[10px] text-[#5A6B6B] hidden sm:inline">
            ({activeLang.label})
          </span>
        )}
        <ChevronDown className={cn('w-3 h-3 text-[#5A6B6B] transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-[#E2E0D6] shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] font-semibold text-[#889898] uppercase tracking-wider border-b border-[#E2E0D6]/50 mb-1">
            Choose Language / भाषा निवडा
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left',
                  isSelected
                    ? 'bg-[#588B8B]/10 text-[#2D3A3A] font-semibold'
                    : 'text-[#2D3A3A] hover:bg-[#F6F5EE]'
                )}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-[#2D3A3A]">{lang.native}</span>
                  <span className="text-[10px] text-[#5A6B6B]">{lang.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#588B8B] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
