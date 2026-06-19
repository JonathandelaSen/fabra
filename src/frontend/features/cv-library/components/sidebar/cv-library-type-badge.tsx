"use client";

import { useTranslations } from "next-intl";
import { LabelBadge, LABEL_BADGE_TONES } from "@/components/shared/label-badge";

interface CVLibraryTypeBadgeProps {
  cvType: string;
}

export function CVLibraryTypeBadge({ cvType }: CVLibraryTypeBadgeProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <LabelBadge tone={cvType === "template" ? LABEL_BADGE_TONES.TEAL : LABEL_BADGE_TONES.NEUTRAL} size="xs" className="uppercase" strong>
      {cvType === "template" ? t("typeTemplate") : t("typeOriginal")}
    </LabelBadge>
  );
}
