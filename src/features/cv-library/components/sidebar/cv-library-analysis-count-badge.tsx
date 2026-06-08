"use client";

import { FileSearch } from "lucide-react";

interface CVLibraryAnalysisCountBadgeProps {
  analysisCount: number;
  analysisCountLabel: string;
}

export function CVLibraryAnalysisCountBadge({
  analysisCount,
  analysisCountLabel,
}: CVLibraryAnalysisCountBadgeProps) {
  if (analysisCount <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded border border-sky-500/15 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-sky-300">
      <FileSearch className="h-2.5 w-2.5" />
      {analysisCountLabel}
    </span>
  );
}
