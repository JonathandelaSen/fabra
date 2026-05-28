import type { LucideIcon } from "lucide-react";

interface IconLabelBadgeProps {
  icon: LucideIcon;
  text: string;
}

export function IconLabelBadge({ icon: Icon, text }: IconLabelBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-400">
      <Icon className="h-3.5 w-3.5 text-zinc-500" />
      {text}
    </span>
  );
}
