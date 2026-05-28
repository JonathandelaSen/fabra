"use client";

import { ChevronRight } from "lucide-react";
import type { CVDocumentListItem } from "../api/cv-library-api";
import { CVLibraryTypeIcon } from "./cv-library-type-icon";
import { CVLibraryTypeBadge } from "./cv-library-type-badge";
import { CVLibraryAnalysisCountBadge } from "./cv-library-analysis-count-badge";

interface CVLibraryListItemProps {
  cv: CVDocumentListItem;
  selected: boolean;
  analysisCount: number;
  onSelect: () => void;
  analysisCountLabel: string;
}

export function CVLibraryListItem({
  cv,
  selected,
  analysisCount,
  onSelect,
  analysisCountLabel,
}: CVLibraryListItemProps) {
  return (
    <div
      onClick={(event) => {
        // Prevenir selección si el usuario interactúa con inputs o botones
        if ((event.target as HTMLElement).closest("button, input")) return;
        onSelect();
      }}
      className={`group relative mb-2 w-full rounded-xl p-3.5 text-left border transition-all duration-200 cursor-pointer ${
        selected
          ? "bg-panel-selected border-action-border text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <CVLibraryTypeIcon cvType={cv.type} selected={selected} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-action-text">
              {cv.name}
            </h3>
            
            <ChevronRight
              className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                selected ? "text-action-text" : "text-zinc-600 group-hover:text-zinc-400"
              }`}
            />
          </div>
          
          <p className="mt-1 truncate text-xs text-zinc-500">
            {cv.filename || "—"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <CVLibraryTypeBadge cvType={cv.type} />
            <CVLibraryAnalysisCountBadge
              analysisCount={analysisCount}
              analysisCountLabel={analysisCountLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
