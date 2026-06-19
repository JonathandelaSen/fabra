"use client";

import { FileDown, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/components/shared/confirm-provider";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { Button } from "@/components/ui/button";
import type { Analysis } from "@/lib/analysis-types";
import { exportAnalysisReport } from "./analysis-report-export";

interface CVAnalysisHeaderActionsProps {
  selectedAnalysis: Analysis | null;
  showAnalysisActions: boolean;
  isDeleting: boolean;
  onNewAnalysis: () => void;
  onDeleteAnalysis: (id: string) => Promise<void>;
}

function parseArray(value: string | null) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function CVAnalysisHeaderActions({
  selectedAnalysis,
  showAnalysisActions,
  isDeleting,
  onNewAnalysis,
  onDeleteAnalysis,
}: CVAnalysisHeaderActionsProps) {
  const listT = useTranslations("analysisFlow.lists");
  const detailT = useTranslations("analysisDetail");
  const commonT = useTranslations("common.actions");
  const confirm = useConfirm();
  const { locale } = useInterfaceLanguage();

  const handleExport = () => {
    if (!selectedAnalysis || selectedAnalysis.ai_score === null) return;

    exportAnalysisReport({
      analysis: {
        ...selectedAnalysis,
        ai_score: selectedAnalysis.ai_score,
        ai_feedback: selectedAnalysis.ai_feedback ?? "",
        ai_model: selectedAnalysis.ai_model ?? "",
        ai_analyzed_at: selectedAnalysis.ai_analyzed_at ?? "",
        cv: selectedAnalysis.cv ?? null,
      },
      dateLocale: locale === "es" ? "es-ES" : "en-US",
      keywords: parseArray(selectedAnalysis.ai_keywords),
      improvements: parseArray(selectedAnalysis.ai_improvements),
      t: detailT,
    });
  };

  const handleDelete = async () => {
    if (!selectedAnalysis) return;
    if (!(await confirm({ title: detailT("alerts.confirmDelete") }))) return;
    await onDeleteAnalysis(selectedAnalysis.id);
  };

  return (
    <div className="flex items-center gap-2">
      <FeatureHeaderActionButton
        label={listT("newAnalysis")}
        onClick={onNewAnalysis}
      />
      {showAnalysisActions && (
        <>
          <Button type="button" variant="outline" onClick={handleExport}>
            <FileDown className="mr-1.5 h-4 w-4" />
            {detailT("score.export")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            aria-label={commonT("delete")}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}
