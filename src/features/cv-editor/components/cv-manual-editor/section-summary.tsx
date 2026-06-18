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
      className="w-full resize-none rounded-xl border border-line bg-panel-hover px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none"
    />
  );
}
