"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import type { CVDocumentListItem } from "../api/cv-library-api";
import { CVLibraryListItem } from "./cv-library-list-item";
import { CVLibrarySearchInput } from "./cv-library-search-input";
import { CVLibrarySidebarError } from "./cv-library-sidebar-error";

interface CVLibrarySidebarProps {
  cvs: CVDocumentListItem[];
  selectedId: string | null;
  analysesByCv: Map<string, AnalysisSummary[]>;
  error: string | null;
  blockingAnalyses: AnalysisSummary[];
  onSelect: (id: string) => void;
  onOpenAnalysis: (id: string) => void;
}

export function CVLibrarySidebar({
  cvs,
  selectedId,
  analysesByCv,
  error,
  blockingAnalyses,
  onSelect,
  onOpenAnalysis,
}: CVLibrarySidebarProps) {
  const t = useTranslations("analysisFlow.cvLibrary");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCvs = cvs.filter(
    (cv) =>
      cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.filename && cv.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sidebarHeader = (error || cvs.length > 0) ? (
    <div className="space-y-3">
      <CVLibrarySidebarError
        error={error}
        blockingAnalyses={blockingAnalyses}
        onOpenAnalysis={onOpenAnalysis}
      />

      {cvs.length > 0 && (
        <CVLibrarySearchInput
          searchQuery={searchQuery}
          onChange={setSearchQuery}
          inputRef={searchInputRef}
        />
      )}
    </div>
  ) : null;

  return (
    <FeatureSidebarPanel header={sidebarHeader}>
      {cvs.length === 0 ? (
        <div className="flex h-full min-h-56 flex-col items-center justify-center text-center text-zinc-600">
          <FileText className="mb-3 h-8 w-8 text-zinc-500" />
          <p className="text-sm">{t("noSavedCvs")}</p>
        </div>
      ) : filteredCvs.length === 0 ? (
        <div className="flex h-full min-h-56 flex-col items-center justify-center text-center text-zinc-600">
          <Search className="mb-3 h-8 w-8 text-zinc-500" />
          <p className="text-sm">{t("noSavedCvs")}</p>
        </div>
      ) : (
        filteredCvs.map((cv) => {
          const analysisCount = analysesByCv.get(cv.id)?.length ?? 0;
          return (
            <CVLibraryListItem
              key={cv.id}
              cv={cv}
              selected={selectedId === cv.id}
              analysisCount={analysisCount}
              onSelect={() => onSelect(cv.id)}
              analysisCountLabel={t("analysisCount", { count: analysisCount })}
            />
          );
        })
      )}
    </FeatureSidebarPanel>
  );
}
