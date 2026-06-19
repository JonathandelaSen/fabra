"use client";

import { SidebarListItem } from "@/frontend/components/shared/sidebar-list-item";
import type { CVDocumentListItem } from "../../api/cv-library-api";
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
    <SidebarListItem
      title={cv.name}
      selected={selected}
      onClick={onSelect}
      subtitle={
        <p className="truncate text-xs text-text-muted font-light">
          {cv.filename || "—"}
        </p>
      }
      footer={
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <CVLibraryTypeBadge cvType={cv.type} />
          <CVLibraryAnalysisCountBadge
            analysisCount={analysisCount}
            analysisCountLabel={analysisCountLabel}
          />
        </div>
      }
    />
  );
}
