"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const ICON_BOX_TONES = {
  NEUTRAL: "neutral",
  ACTION: "action",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
} as const;

export type IconBoxTone =
  (typeof ICON_BOX_TONES)[keyof typeof ICON_BOX_TONES];

interface IconBoxProps {
  icon: LucideIcon;
  tone?: IconBoxTone;
  className?: string;
  iconClassName?: string;
}

const TONE_CLASS_NAMES = {
  [ICON_BOX_TONES.NEUTRAL]:
    "border-transparent bg-panel-control text-text-muted group-hover:bg-panel-active group-hover:text-text-soft",
  [ICON_BOX_TONES.ACTION]: "border-action-border bg-action-soft text-action-text",
  [ICON_BOX_TONES.SUCCESS]: "border-success-border bg-success-soft text-success-text",
  [ICON_BOX_TONES.WARNING]: "border-warning-border bg-warning-soft text-warning-text",
  [ICON_BOX_TONES.DANGER]: "border-danger-border bg-danger-soft text-danger-text",
  [ICON_BOX_TONES.INFO]: "border-info-border bg-info-soft text-info-text",
} satisfies Record<IconBoxTone, string>;

export function IconBox({
  icon: Icon,
  tone = ICON_BOX_TONES.NEUTRAL,
  className,
  iconClassName,
}: IconBoxProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
        TONE_CLASS_NAMES[tone],
        className,
      )}
    >
      <Icon className={cn("h-4 w-4", iconClassName)} />
    </div>
  );
}
