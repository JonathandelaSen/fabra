"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import type { CVDocumentListItem } from "../../api/cv-library-api";
import { CVLibraryListItem } from "./cv-library-list-item";
import { CVLibrarySearchInput } from "./cv-library-search-input";
import { CVLibrarySidebarError } from "./cv-library-sidebar-error";

interface CVLibrarySidebarProps {
  cvs: CVDocumentListItem[];
  selectedId: string | null;
  analysesByCv: Map<string, AnalysisSummary[]>;
  error: string | null;
  onSelect: (id: string) => void;
}

export function CVLibrarySidebar({
  cvs,
  selectedId,
  analysesByCv,
  error,
  onSelect,
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
      {error && <CVLibrarySidebarError error={error} />}

      <div className="flex items-center gap-2">
        {cvs.length > 0 && (
          <CVLibrarySearchInput
            searchQuery={searchQuery}
            onChange={setSearchQuery}
            inputRef={searchInputRef}
          />
        )}
      </div>
    </div>
  );

  return (
    <FeatureSidebarPanel header={sidebarHeader}>
      {cvs.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
            <FileText className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {t("noSavedCvs")}
          </p>
        </div>
      ) : filteredCvs.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
            <Search className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {t("noSavedCvs")}
          </p>
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
