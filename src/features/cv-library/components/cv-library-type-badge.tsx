"use client";

import { useTranslations } from "next-intl";
import { LabelBadge } from "@/components/shared/label-badge";

interface CVLibraryTypeBadgeProps {
  cvType: string;
}

export function CVLibraryTypeBadge({ cvType }: CVLibraryTypeBadgeProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <LabelBadge tone={cvType === "template" ? "teal" : "neutral"} size="xs" className="uppercase" strong>
      {cvType === "template" ? t("typeTemplate") : t("typeOriginal")}
    </LabelBadge>
  );
}
