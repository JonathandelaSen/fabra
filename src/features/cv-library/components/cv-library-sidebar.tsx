"use client";

import { FileSearch, FileText, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import type { CVDocumentListItem } from "../api/cv-library-api";
import { CVLibraryListItem } from "./cv-library-list-item";

interface CVLibrarySidebarProps {
  cvs: CVDocumentListItem[];
  selectedId: string | null;
  editingId: string | null;
  draftName: string;
  loadingId: string | null;
  analysesByCv: Map<string, AnalysisSummary[]>;
  error: string | null;
  blockingAnalyses: AnalysisSummary[];
  onSelect: (id: string) => void;
  onStartEditing: (cv: CVDocumentListItem) => void;
  onDraftNameChange: (name: string) => void;
  onSaveName: (id: string) => void;
  onCancelEditing: () => void;
  onDelete: (id: string) => void;
  onOpenAnalysis: (id: string) => void;
}

export function CVLibrarySidebar({
  cvs,
  selectedId,
  editingId,
  draftName,
  loadingId,
  analysesByCv,
  error,
  blockingAnalyses,
  onSelect,
  onStartEditing,
  onDraftNameChange,
  onSaveName,
  onCancelEditing,
  onDelete,
  onOpenAnalysis,
}: CVLibrarySidebarProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <section className="flex min-h-0 flex-col">
      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <p>{error}</p>
          {blockingAnalyses.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-rose-500/20 pt-3">
              <p className="text-xs font-semibold text-rose-200">
                {t("associatedAnalyses")}
              </p>
              {blockingAnalyses.map((analysis) => (
                <a
                  key={analysis.id}
                  href={
                    analysis.analysis_mode === "job_match"
                      ? `/job-analyses/${encodeURIComponent(analysis.id)}`
                      : `/cv-analysis/${encodeURIComponent(analysis.id)}`
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenAnalysis(analysis.id);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0a0a12]/70 px-3 py-2 text-left text-xs text-zinc-300 transition-colors hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-100"
                >
                  <FileSearch className="h-3.5 w-3.5 shrink-0 text-rose-300" />
                  <span className="min-w-0 flex-1 truncate">
                    {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
        {cvs.length === 0 ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center text-center text-zinc-600">
            <FileText className="mb-3 h-8 w-8" />
            <p className="text-sm">{t("noSavedCvs")}</p>
          </div>
        ) : (
          cvs.map((cv) => {
            const analysisCount = analysesByCv.get(cv.id)?.length ?? 0;
            return (
              <CVLibraryListItem
                key={cv.id}
                cv={cv}
                selected={selectedId === cv.id}
                analysisCount={analysisCount}
                editing={editingId === cv.id}
                draftName={draftName}
                saving={loadingId === cv.id}
                onSelect={() => onSelect(cv.id)}
                onStartEditing={() => onStartEditing(cv)}
                onDraftNameChange={onDraftNameChange}
                onSaveName={() => onSaveName(cv.id)}
                onCancelEditing={onCancelEditing}
                onDelete={() => onDelete(cv.id)}
                analysisCountLabel={t("analysisCount", { count: analysisCount })}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
