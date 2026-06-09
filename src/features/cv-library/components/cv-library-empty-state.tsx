"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureEmptyState } from "@/components/shared/feature-empty-state";

export function CVLibraryEmptyState() {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <FeatureEmptyState
      icon={FileText}
      title={t("selectToPreview")}
    />
  );
}

