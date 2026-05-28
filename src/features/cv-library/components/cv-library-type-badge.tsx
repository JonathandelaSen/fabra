"use client";

import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";

interface CVLibraryTypeBadgeProps {
  cvType: string;
}

export function CVLibraryTypeBadge({ cvType }: CVLibraryTypeBadgeProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <StatusBadge
      label={cvType === "template" ? t("typeTemplate") : t("typeOriginal")}
      color={cvType === "template" ? "teal" : "zinc"}
    />
  );
}
