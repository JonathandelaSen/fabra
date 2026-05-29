"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
      <div className="flex gap-3">
        <KeyRound className="h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="text-xs leading-relaxed text-amber-200">
            {t("missingApiKey")}
          </p>
          <Button
            variant="link"
            className="h-auto p-0 mt-2 text-xs font-bold text-amber-400 hover:text-amber-300"
            onClick={onOpenSettings}
          >
            {t("configureNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
