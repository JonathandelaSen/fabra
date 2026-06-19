"use client";

import { useTranslations } from "next-intl";

interface HeroSectionProps {
  userEmail: string | null;
}

export default function HeroSection({ userEmail }: HeroSectionProps) {
  const t = useTranslations("home");

  const displayName = userEmail ? userEmail.split("@")[0] : null;

  return (
    <div className="space-y-2">
      {displayName && (
        <h1 className="text-2xl font-semibold text-text-main">
          {t("greeting", { name: displayName })}
        </h1>
      )}
      <p className="text-sm text-text-soft max-w-xl leading-relaxed">
        {t("tagline")}
      </p>
    </div>
  );
}
