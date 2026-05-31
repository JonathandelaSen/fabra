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
  [LABEL_BADGE_TONES.SUCCESS]: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  [LABEL_BADGE_TONES.WARNING]: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  [LABEL_BADGE_TONES.DANGER]: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  [LABEL_BADGE_TONES.INFO]: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  [LABEL_BADGE_TONES.TEAL]: "border-teal-500/25 bg-teal-500/10 text-teal-400",
  [LABEL_BADGE_TONES.INDIGO]:
    "border-transparent bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/20",
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
