'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DashboardHeaderProps {
  displayName: string;
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const { t } = useLanguage();

  const getGreetingKey = () => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };

  const greetingWord = t(`dashboard.greeting.${getGreetingKey()}`);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2D3A3A] tracking-tight">
        {greetingWord}, {displayName}
      </h1>
      <p className="text-xs text-[#5A6B6B] mt-0.5">
        {t('dashboard.greeting.subtitle')}
      </p>
    </div>
  );
}
