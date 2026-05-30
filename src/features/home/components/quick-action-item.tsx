"use client";

import type { LucideIcon } from "lucide-react";

interface QuickActionItemProps {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function QuickActionItem({
  label,
  description,
  icon: Icon,
  onClick,
}: QuickActionItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-colors hover:bg-white/[0.05] hover:border-white/[0.1]"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/10">
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>
      <div className="min-w-0">
        <span className="text-sm font-medium text-zinc-100">{label}</span>
        <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}
