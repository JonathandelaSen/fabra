"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import EducationalBanner from "./educational-banner";

interface HowAtsWorksEducationBannerProps {
  onClose?: () => void;
}

export default function HowAtsWorksEducationBanner({ onClose }: HowAtsWorksEducationBannerProps) {
  const t = useTranslations("analysisFlow.extraction");

  return (
    <EducationalBanner
      title={t("banner.title")}
      description={t("banner.description")}
      icon={Sparkles}
      onClose={onClose}
    />
  );
}
