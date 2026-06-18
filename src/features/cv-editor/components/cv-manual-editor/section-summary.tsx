"use client";

import { useTranslations } from "next-intl";
import { CVInlineMarkdownField } from "./cv-inline-markdown-field";

interface SectionSummaryProps {
  summary: string;
  onChange: (summary: string) => void;
}

export function SectionSummary({ summary, onChange }: SectionSummaryProps) {
  const t = useTranslations("cvEditor.manual");

  return (
    <CVInlineMarkdownField
      value={summary}
      onChange={onChange}
      placeholder={t("summaryPlaceholder")}
      rows={5}
    />
  );
}
