"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "@/frontend/i18n/messages";
import {
  INTERFACE_LANGUAGE_COOKIE,
  isInterfaceLanguage,
  type InterfaceLanguage,
} from "@/frontend/i18n/config";
import { saveInterfaceLanguage } from "@/frontend/utils/user-preferences";

type InterfaceLanguageContextValue = {
  locale: InterfaceLanguage;
  setInterfaceLanguage: (locale: InterfaceLanguage) => Promise<void>;
};

const InterfaceLanguageContext = createContext<InterfaceLanguageContextValue | null>(null);

function setLanguageCookie(locale: InterfaceLanguage) {
  document.cookie = `${INTERFACE_LANGUAGE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: InterfaceLanguage;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo<InterfaceLanguageContextValue>(
    () => ({
      locale,
      async setInterfaceLanguage(nextLocale) {
        if (!isInterfaceLanguage(nextLocale)) return;
        setLocale(nextLocale);
        document.documentElement.lang = nextLocale;
        setLanguageCookie(nextLocale);
        await saveInterfaceLanguage(nextLocale);
      },
    }),
    [locale],
  );

  return (
    <InterfaceLanguageContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}>
        {children}
      </NextIntlClientProvider>
    </InterfaceLanguageContext.Provider>
  );
}

export function useInterfaceLanguage() {
  const context = useContext(InterfaceLanguageContext);
  if (!context) {
    throw new Error("useInterfaceLanguage must be used inside I18nProvider");
  }
  return context;
}
