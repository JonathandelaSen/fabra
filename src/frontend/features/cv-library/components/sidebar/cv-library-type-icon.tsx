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
          ? "bg-action-soft text-action-text"
          : "bg-panel-control/50 text-text-muted group-hover:bg-panel-control/80 group-hover:text-text-soft"
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
