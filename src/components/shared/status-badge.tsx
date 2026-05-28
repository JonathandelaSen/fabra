import type { LucideIcon } from "lucide-react";

const colorMap = {
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  teal: "border-teal-500/25 bg-teal-500/10 text-teal-400",
  zinc: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
} as const;

const sizeMap = {
  sm: "px-2 py-0.5 text-[9px] rounded-full",
  md: "px-2.5 py-1 text-[11px] rounded-md",
} as const;

interface StatusBadgeProps {
  label: string;
  color: keyof typeof colorMap;
  size?: keyof typeof sizeMap;
  icon?: LucideIcon;
  className?: string;
}

export function StatusBadge({
  label,
  color,
  size = "sm",
  icon: Icon,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 border font-semibold uppercase tracking-wide ${colorMap[color]} ${sizeMap[size]} ${className}`}
    >
      {Icon && (
        <Icon
          className={size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}
        />
      )}
      {label}
    </span>
  );
}
