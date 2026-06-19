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
      title={text}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden border border-line bg-panel-subtle font-medium text-text-muted normal-case tracking-normal",
        LABEL_BADGE_SIZE_CLASS_NAMES[size],
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            LABEL_BADGE_ICON_SIZE_CLASS_NAMES[size],
            "shrink-0 text-text-faint",
          )}
        />
      )}
      <span className="min-w-0 truncate">{text}</span>
    </span>
  );
}
