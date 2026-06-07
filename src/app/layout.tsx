import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nProvider } from "@/components/shared/i18n-provider";
import { FrontendQueryClientProvider } from "@/frontend/query/query-client-provider";
import { getMessages } from "@/i18n/messages";
import { resolveInterfaceLanguage } from "@/i18n/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveInterfaceLanguage();
  const messages = getMessages(locale);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveInterfaceLanguage();
  const themeScript = `
try {
  var theme = window.localStorage.getItem("fabra.theme") || window.localStorage.getItem("ats-cv-ai-checker.theme");
  if (theme !== "light" && theme !== "dark") theme = "dark";
  document.documentElement.classList.remove(theme === "light" ? "dark" : "light");
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  var colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) colorSchemeMeta.setAttribute("content", theme);
} catch (_) {}
`;

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full font-sans">
        <I18nProvider initialLocale={locale}>
          <FrontendQueryClientProvider>{children}</FrontendQueryClientProvider>
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
