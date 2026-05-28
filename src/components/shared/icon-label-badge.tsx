import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconLabelBadgeProps {
  icon: LucideIcon;
  text: string;
  className?: string;
}

export function IconLabelBadge({
  icon: Icon,
  text,
  className,
}: IconLabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-400",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 text-zinc-500" />
      {text}
    </span>
  );
}
