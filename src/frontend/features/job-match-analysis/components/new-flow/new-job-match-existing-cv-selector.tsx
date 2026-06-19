"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, FileText } from "lucide-react";
import type { CVDocumentSummaryResponse } from "@/app/api/cvs/responses";

export function NewJobMatchExistingCVSelector({
  cvs,
  selectedCvId,
  onSelectedCvIdChange,
}: {
  cvs: CVDocumentSummaryResponse[];
  selectedCvId: string;
  onSelectedCvIdChange: (id: string) => void;
}) {
  const t = useTranslations("analysisFlow.newOffer");
  const selectedCv = useMemo(
    () => cvs.find((cv) => cv.id === selectedCvId) ?? null,
    [cvs, selectedCvId],
  );

  return (
    <section className="rounded-xl border border-line bg-panel/[0.02] p-5">
      <label className="mb-2 flex items-center gap-2 text-sm text-text-muted">
        <FileText className="h-4 w-4" />
        {t("cvLabel")}
      </label>
      <div className="relative">
        <select
          value={selectedCvId}
          onChange={(event) => onSelectedCvIdChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-field px-4 text-sm text-text-main focus:border-action-border/40 focus:outline-none"
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.name} - {cv.filename ?? t("noFilename")}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 rotate-90 text-text-muted" />
      </div>
      {selectedCv && (
        <p className="mt-2 text-xs text-text-faint">
          {selectedCv.type === "template"
            ? t("templateVersion")
            : t("originalPdfName", {
                filename: selectedCv.filename ?? t("noFilename"),
              })}
        </p>
      )}
    </section>
  );
}
