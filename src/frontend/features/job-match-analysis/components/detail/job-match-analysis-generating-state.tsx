"use client";

import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";
import { Card, CardContent } from "@/frontend/components/ui/card";

interface JobMatchAnalysisGeneratingStateProps {
  onViewExtraction: () => void;
}

export function JobMatchAnalysisGeneratingState({
  onViewExtraction,
}: JobMatchAnalysisGeneratingStateProps) {
  const t = useTranslations("analysisFlow.generating");

  return (
    <div className="flex min-h-[28rem] items-center justify-center px-4 py-10 sm:px-8">
      <Card className="relative w-full max-w-xl overflow-hidden border border-action-border/30 bg-panel/[0.03] py-0 shadow-xl shadow-[var(--ui-action-shadow)]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-action to-transparent"
        />
        <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-12 sm:py-14">
          <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-action-border/25 motion-safe:animate-[ping_2.4s_ease-out_infinite]" />
            <div className="absolute inset-3 rounded-full border border-action-border/40 bg-action-soft/40 motion-safe:animate-pulse" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-action to-action-hover text-text-on-dark shadow-lg shadow-[var(--ui-action-shadow)] motion-safe:animate-pulse">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>

          <div role="status" aria-live="polite" aria-busy="true">
            <h2 className="text-balance text-2xl font-bold text-text-main sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-6 text-text-soft sm:text-base">
              {t("description")}
            </p>
          </div>

          <div className="my-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-panel-control/60">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-action to-action-hover motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]" />
          </div>

          <p className="mb-5 max-w-md text-sm leading-6 text-text-muted">
            {t("backgroundHint")}
          </p>
          <IconTextButton
            icon={FileText}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
            strong
            className="scale-100 transition-[scale] duration-200 hover:scale-105 hover:bg-action motion-reduce:transition-none motion-reduce:hover:scale-100"
            onClick={onViewExtraction}
          >
            {t("viewExtraction")}
          </IconTextButton>
        </CardContent>
      </Card>
    </div>
  );
}
