"use client";

import type { LucideIcon } from "lucide-react";

interface WorkJournalEmptyStateProps {
  icon: LucideIcon;
  text: string;
}

export function WorkJournalEmptyState({ icon: Icon, text }: WorkJournalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-zinc-600">
      <Icon className="h-8 w-8 stroke-1 text-zinc-700" />
      <p className="text-sm font-light tracking-wide">{text}</p>
    </div>
  );
}
