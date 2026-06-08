"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, FileText } from "lucide-react";
import type { CVSummary } from "./new-analysis-types";

interface NewAnalysisExistingCVProps {
  cvs: CVSummary[];
  selectedCvId: string;
  onSelectedCvIdChange: (id: string) => void;
}

export default function NewAnalysisExistingCV({
  cvs,
  selectedCvId,
  onSelectedCvIdChange,
}: NewAnalysisExistingCVProps) {
  const t = useTranslations("analysisFlow.newExtraction");

  const selectedCv = useMemo(
    () => cvs.find((cv) => cv.id === selectedCvId) ?? null,
    [cvs, selectedCvId],
  );

  const getCVSourceLabel = (cv: CVSummary) => {
    if (cv.type === "template") return t("template");
    return cv.filename ?? t("originalPdf");
  };

  return (
    <section className="rounded-xl border border-line bg-white/[0.02] p-5">
      <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
        <FileText className="h-4 w-4" />
        CV
      </label>
      <div className="relative">
        <select
          value={selectedCvId}
          onChange={(event) => onSelectedCvIdChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-field px-4 text-sm text-text-main focus:border-indigo-500/40 focus:outline-none"
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.name} · {getCVSourceLabel(cv)}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 rotate-90 text-zinc-500" />
      </div>
      {selectedCv && (
        <p className="mt-2 text-xs text-text-faint">
          {selectedCv.type === "template"
            ? t("templateVersion")
            : t("originalPdfName", { filename: selectedCv.filename ?? t("noFilename") })}
        </p>
      )}
    </section>
  );
}
