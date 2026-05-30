"use client";

import { useTranslations } from "next-intl";

interface SectionSummaryProps {
  summary: string;
  onChange: (summary: string) => void;
}

export function SectionSummary({ summary, onChange }: SectionSummaryProps) {
  const t = useTranslations("cvEditor.manual");

  return (
    <textarea
      value={summary}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t("summaryPlaceholder")}
      rows={5}
      className="w-full resize-none rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/30 focus:outline-none"
    />
  );
}
