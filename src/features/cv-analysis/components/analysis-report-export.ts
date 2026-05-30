import { formatDisplayDate } from "@/lib/date-format";

interface ExportAnalysisReportParams {
  analysis: {
    ai_score: number;
    ai_feedback: string;
    ai_model: string;
    ai_analyzed_at: string;
    job_description: string | null;
    id: string;
    cv: {
      id: string;
      name: string;
      type?: string;
    } | null;
    title: string;
    filename: string;
  };
  dateLocale: string;
  keywords: string[];
  improvements: string[];
  jobKeywords: string[];
  cvKeywords: string[];
  missingKeywords: string[];
  t: (key: string) => string;
}

export function exportAnalysisReport({
  analysis,
  dateLocale,
  keywords,
  improvements,
  jobKeywords,
  cvKeywords,
  missingKeywords,
  t,
}: ExportAnalysisReportParams) {
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
${t("export.date")}: ${formatDisplayDate(analysis.ai_analyzed_at, { locale: dateLocale, variant: "dateTime" })}
${t("export.model")}: ${analysis.ai_model}

${t("export.score")}: ${analysis.ai_score}/100

${t("export.feedback")}:
${analysis.ai_feedback}

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

${analysis.job_description ? `${t("export.jobDescription")}:\n${analysis.job_description}` : ""}
    `.trim();

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ATS_Report_${analysis.ai_analyzed_at.replace(/[:.]/g, "-")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
