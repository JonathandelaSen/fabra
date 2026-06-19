"use client";

import type { LucideIcon } from "lucide-react";
import { FeatureEmptyState } from "@/frontend/components/shared/feature-empty-state";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/frontend/components/shared/action-buttons";
import { Plus } from "lucide-react";

interface WorkJournalEmptyStateProps {
  icon: LucideIcon;
  text: string;
  actionLabel?: string;
  onCreate?: () => void;
}

export function WorkJournalEmptyState({
  icon,
  text,
  actionLabel,
  onCreate,
}: WorkJournalEmptyStateProps) {
  return (
    <FeatureEmptyState
      icon={icon}
      title={text}
      action={
        onCreate && actionLabel ? (
          <IconTextButton
            icon={Plus}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
            onClick={onCreate}
          >
            {actionLabel}
          </IconTextButton>
        ) : undefined
      }
    />
  );
}
