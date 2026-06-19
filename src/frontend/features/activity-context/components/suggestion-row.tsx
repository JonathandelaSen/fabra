"use client";

import { useTranslations } from "next-intl";
import { Check, EyeOff, Sparkles } from "lucide-react";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";
import type { ActivityContextSuggestion } from "../api/activity-context-api";

interface SuggestionRowProps {
  suggestion: ActivityContextSuggestion;
  isPending: boolean;
  hasReturnTo: boolean;
  onPromote: (suggestion: ActivityContextSuggestion) => void;
  onHide: (suggestion: ActivityContextSuggestion) => void;
}

export function SuggestionRow({
  suggestion,
  isPending,
  hasReturnTo,
  onPromote,
  onHide,
}: SuggestionRowProps) {
  const t = useTranslations("activityContexts");

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-dashed border-line bg-panel-subtle px-4 py-3 transition-colors hover:border-warning-border hover:bg-panel-hover">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning-text">
        <Sparkles className="h-3.5 w-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <span className="truncate text-sm text-text-soft">
          {suggestion.name}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <IconTextButton
          icon={Check}
          loading={isPending}
          tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
          onClick={() => onPromote(suggestion)}
          disabled={isPending}
        >
          {hasReturnTo ? t("selectAndReturn") : t("create")}
        </IconTextButton>
        <ActionIconButton
          icon={EyeOff}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
          onClick={() => onHide(suggestion)}
          disabled={isPending}
          title={t("hide")}
        />
      </div>
    </div>
  );
}
