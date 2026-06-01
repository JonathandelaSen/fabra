"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
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
  onImportJsonResume?: () => void;
}

export function CVLibrarySidebar({
  cvs,
  selectedId,
  analysesByCv,
  error,
  blockingAnalyses,
  onSelect,
  onOpenAnalysis,
  onImportJsonResume,
}: CVLibrarySidebarProps) {
  const t = useTranslations("analysisFlow.cvLibrary");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCvs = cvs.filter(
    (cv) =>
      cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.filename && cv.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sidebarHeader = (
    <div className="space-y-3">
      {(error || blockingAnalyses.length > 0) && (
        <CVLibrarySidebarError
          error={error}
          blockingAnalyses={blockingAnalyses}
          onOpenAnalysis={onOpenAnalysis}
        />
      )}

      <div className="flex items-center gap-2">
        {cvs.length > 0 && (
          <CVLibrarySearchInput
            searchQuery={searchQuery}
            onChange={setSearchQuery}
            inputRef={searchInputRef}
          />
        )}
        {onImportJsonResume && (
          <button
            onClick={onImportJsonResume}
            title={t("importJsonResume")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

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
