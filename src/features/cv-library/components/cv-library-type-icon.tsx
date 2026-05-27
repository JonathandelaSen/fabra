"use client";

import { FileText, Sparkles } from "lucide-react";

interface CVLibraryTypeIconProps {
  cvType: string;
  selected: boolean;
}

export function CVLibraryTypeIcon({
  cvType,
  selected,
}: CVLibraryTypeIconProps) {
  return (
    <div
      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
        selected
          ? "bg-indigo-500/10 text-indigo-300"
          : "bg-zinc-800/50 text-zinc-500 group-hover:bg-zinc-800/80 group-hover:text-zinc-300"
      }`}
    >
      {cvType === "template" ? (
        <Sparkles className="h-4 w-4" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
    </div>
  );
}
