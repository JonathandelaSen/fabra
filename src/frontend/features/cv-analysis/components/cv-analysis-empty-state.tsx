"use client";

import { FileSearch, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import { FeatureEmptyState } from "@/components/shared/feature-empty-state";

interface CVAnalysisEmptyStateProps {
  onCreate: () => void;
}

export function CVAnalysisEmptyState({
  onCreate,
}: CVAnalysisEmptyStateProps) {
  const t = useTranslations("analysisFlow.appShell");
  const listT = useTranslations("analysisFlow.lists");

  return (
    <FeatureEmptyState
      icon={FileSearch}
      title={t("empty")}
      action={
        <IconTextButton
          icon={Plus}
          tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
          onClick={onCreate}
        >
          {listT("newAnalysis")}
        </IconTextButton>
      }
    />
  );
}
