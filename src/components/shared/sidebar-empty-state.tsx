import type { LucideIcon } from "lucide-react";

interface SidebarEmptyStateProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

export function SidebarEmptyState({
  icon: Icon,
  message,
  className = "",
}: SidebarEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-24 text-zinc-600 ${className}`}
    >
      <Icon className="h-8 w-8 stroke-1 text-zinc-700" />
      <p className="text-sm font-light tracking-wide">{message}</p>
    </div>
  );
}
