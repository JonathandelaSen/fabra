import type { LucideIcon } from "lucide-react";
import {
  LABEL_BADGE_ICON_SIZE_CLASS_NAMES,
  LABEL_BADGE_SIZE_CLASS_NAMES,
  LABEL_BADGE_SIZES,
  type LabelBadgeSize,
} from "@/components/shared/label-badge";
import { cn } from "@/lib/utils";

interface IconLabelBadgeProps {
  icon?: LucideIcon;
  size?: LabelBadgeSize;
  text: string;
  className?: string;
}

export function IconLabelBadge({
  icon: Icon,
  size = LABEL_BADGE_SIZES.SM,
  text,
  className,
}: IconLabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 border border-white/[0.05] bg-white/[0.03] font-medium text-zinc-400 normal-case tracking-normal",
        LABEL_BADGE_SIZE_CLASS_NAMES[size],
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(LABEL_BADGE_ICON_SIZE_CLASS_NAMES[size], "text-zinc-500")}
        />
      )}
      {text}
    </span>
  );
}
