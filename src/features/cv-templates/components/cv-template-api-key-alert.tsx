"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";

interface CVTemplateApiKeyAlertProps {
  hasAIApiKey: boolean;
  selectedCvId: string;
  onOpenSettings: () => void;
}

export function CVTemplateApiKeyAlert({
  hasAIApiKey,
  selectedCvId,
  onOpenSettings,
}: CVTemplateApiKeyAlertProps) {
  const t = useTranslations("analysisFlow.templates");

  if (hasAIApiKey || !selectedCvId) {
    return null;
  }

  return (
    <AlertBanner tone={ALERT_BANNER_TONES.WARNING} icon={KeyRound}>
      <p className="text-xs leading-relaxed">{t("missingApiKey")}</p>
      <IconTextButton
        icon={KeyRound}
        tone={ICON_TEXT_BUTTON_TONES.WARNING}
        strong
        className="mt-2"
        onClick={onOpenSettings}
      >
        {t("configureNow")}
      </IconTextButton>
    </AlertBanner>
  );
}
