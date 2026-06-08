"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { formatDisplayDate } from "@/lib/date-format";
import type { JobMatchAnalysisDetail } from "../api/job-match-analysis-api";

interface UseJobMatchAnalysisExportParams {
  analysis: JobMatchAnalysisDetail | null;
}

function parseArray(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function downloadTextFile({ filename, text }: { filename: string; text: string }) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function useJobMatchAnalysisExport({
  analysis,
}: UseJobMatchAnalysisExportParams) {
  const t = useTranslations("analysisDetail");
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return useCallback(() => {
    if (!analysis) return;

    const keywords = parseArray(analysis.aiKeywords);
    const improvements = parseArray(analysis.aiImprovements);
    const jobKeywords = parseArray(analysis.jobKeywords);
    const cvKeywords = parseArray(analysis.cvKeywords);
    const missingKeywords = parseArray(analysis.missingKeywords);
    const cvName = analysis.cv?.name ?? analysis.filename;
    const cvUrl = analysis.cv
      ? `${window.location.origin}/api/cvs/${analysis.cv.id}/${analysis.cv.type === "template" ? "template-pdf" : "pdf"}`
      : null;
    const report = `
${t("export.title")}
-----------------------
${t("export.file")}: ${analysis.filename}
${t("export.name")}: ${analysis.title}
${t("export.cvUsed")}: ${cvName}
${cvUrl ? `${t("export.cvLink")}: ${cvUrl}` : ""}
${t("export.analysisId")}: ${analysis.id}
${t("export.date")}: ${formatDisplayDate(analysis.aiAnalyzedAt, { locale: dateLocale, variant: "dateTime" })}
${t("export.model")}: ${analysis.aiModel}

${t("export.score")}: ${analysis.aiScore}/100

${t("export.feedback")}:
${analysis.aiFeedback}

${t("export.detectedKeywords")}:
${keywords.join(", ") || t("export.none")}

${t("export.jobKeywords")}:
${jobKeywords.join(", ") || t("export.none")}

${t("export.cvKeywords")}:
${cvKeywords.join(", ") || t("export.none")}

${t("export.missingKeywords")}:
${missingKeywords.join(", ") || t("export.none")}

${t("export.improvements")}:
${improvements.map((imp) => `- ${imp}`).join("\n") || t("export.noSuggestions")}

${analysis.jobDescription ? `${t("export.jobDescription")}:\n${analysis.jobDescription}` : ""}
    `.trim();

    downloadTextFile({
      filename: `ATS_Report_${(analysis.aiAnalyzedAt ?? "").replace(/[:.]/g, "-")}.txt`,
      text: report,
    });
  }, [
    analysis,
    dateLocale,
    t,
  ]);
}
