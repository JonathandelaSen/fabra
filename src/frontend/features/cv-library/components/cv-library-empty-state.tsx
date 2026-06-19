"use client";

import { FileText, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureEmptyState } from "@/frontend/components/shared/feature-empty-state";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/frontend/components/shared/action-buttons";

interface CVLibraryEmptyStateProps {
  hasCvs: boolean;
  onStartAnalysis?: () => void;
}

export function CVLibraryEmptyState({ hasCvs, onStartAnalysis }: CVLibraryEmptyStateProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <FeatureEmptyState
      icon={FileText}
      title={hasCvs ? t("selectToPreview") : t("noSavedCvs")}
      action={
        !hasCvs && onStartAnalysis ? (
          <IconTextButton
            icon={Plus}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
            onClick={onStartAnalysis}
          >
            {t("uploadAndAnalyze")}
          </IconTextButton>
        ) : undefined
      }
    />
  );
}

