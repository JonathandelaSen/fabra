import type { ComponentProps, ElementType } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const LABEL_BADGE_TONES = {
  NEUTRAL: "neutral",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
  TEAL: "teal",
  INDIGO: "indigo",
} as const;

export type LabelBadgeTone =
  (typeof LABEL_BADGE_TONES)[keyof typeof LABEL_BADGE_TONES];

export const LABEL_BADGE_SIZES = {
  XS: "xs",
  SM: "sm",
  MD: "md",
} as const;

export type LabelBadgeSize =
  (typeof LABEL_BADGE_SIZES)[keyof typeof LABEL_BADGE_SIZES];

const TONE_CLASS_NAMES = {
  [LABEL_BADGE_TONES.NEUTRAL]: "border-line-default bg-panel-subtle text-text-soft",
  [LABEL_BADGE_TONES.SUCCESS]: "border-success-border bg-success-soft text-success-text",
  [LABEL_BADGE_TONES.WARNING]: "border-warning-border bg-warning-soft text-warning-text",
  [LABEL_BADGE_TONES.DANGER]: "border-danger-border bg-danger-soft text-danger-text",
  [LABEL_BADGE_TONES.INFO]: "border-info-border bg-info-soft text-info-text",
  [LABEL_BADGE_TONES.TEAL]: "border-accent-teal-border bg-accent-teal-soft text-accent-teal-text",
  [LABEL_BADGE_TONES.INDIGO]:
    "border-transparent bg-action-soft text-action-text ring-1 ring-inset ring-action-border",
} satisfies Record<LabelBadgeTone, string>;

export const LABEL_BADGE_SIZE_CLASS_NAMES = {
  [LABEL_BADGE_SIZES.XS]: "h-auto rounded-md px-2 py-0.5 text-xs",
  [LABEL_BADGE_SIZES.SM]: "h-auto rounded-md px-2.5 py-1 text-sm",
  [LABEL_BADGE_SIZES.MD]: "h-auto rounded-md px-3 py-1.5 text-md",
} satisfies Record<LabelBadgeSize, string>;

export const LABEL_BADGE_ICON_SIZE_CLASS_NAMES = {
  [LABEL_BADGE_SIZES.XS]: "h-2.5 w-2.5",
  [LABEL_BADGE_SIZES.SM]: "h-2.5 w-2.5",
  [LABEL_BADGE_SIZES.MD]: "h-3.5 w-3.5",
} satisfies Record<LabelBadgeSize, string>;

export interface LabelBadgeProps extends Omit<ComponentProps<typeof Badge>, "variant"> {
  icon?: ElementType<{ className?: string }>;
  label?: string;
  size?: LabelBadgeSize;
  tone?: LabelBadgeTone;
  strong?: boolean;
}

export function LabelBadge({
  children,
  className,
  icon: Icon,
  label,
  size = LABEL_BADGE_SIZES.SM,
  tone = LABEL_BADGE_TONES.NEUTRAL,
  strong = false,
  ...props
}: LabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "min-w-0 max-w-full shrink gap-1 overflow-hidden normal-case tracking-normal",
        strong ? "font-semibold" : "font-medium",
        TONE_CLASS_NAMES[tone],
        LABEL_BADGE_SIZE_CLASS_NAMES[size],
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(LABEL_BADGE_ICON_SIZE_CLASS_NAMES[size], "shrink-0")}
        />
      )}
      <span className="min-w-0 truncate">{children ?? label}</span>
    </Badge>
  );
}
