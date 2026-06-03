"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import type { AnalysisSummary } from "@/lib/analysis-types";
import type { CVDocumentListItem } from "../api/cv-library-api";
import { useCVLibraryMutations } from "../hooks/use-cv-library-mutations";
import {
  useAllAnalyses,
  useCVDocumentDetail,
  useCVDocumentList,
  useInterviewQuestionsForLibrary,
} from "../hooks/use-cv-library-queries";
import { useCVLibraryRouteState } from "../hooks/use-cv-library-route-state";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { CVLibraryDetail } from "./cv-library-detail";
import { CVLibraryImportPanel } from "./cv-library-import-panel";
import { CVLibrarySidebar } from "./cv-library-sidebar";
import { CVLibrarySkeleton } from "./cv-library-skeleton";

interface CVLibraryViewProps {
  onOpenAnalysis: (id: string) => void;
  onOpenEditor: (cvId: string) => void;
  onOpenQuestions: (cvId: string) => void;
}

function groupAnalysesByCv(analyses: AnalysisSummary[]) {
  const grouped = new Map<string, AnalysisSummary[]>();
  for (const analysis of analyses) {
    if (!analysis.cv_id) continue;
    grouped.set(analysis.cv_id, [...(grouped.get(analysis.cv_id) ?? []), analysis]);
  }
  return grouped;
}

function selectedAfterDelete(items: CVDocumentListItem[], deletedId: string) {
  const index = items.findIndex((item) => item.id === deletedId);
  const next = items[index + 1] ?? items[index - 1] ?? null;
  return next?.id ?? null;
}

export default function CVLibraryView({
  onOpenAnalysis,
  onOpenEditor,
  onOpenQuestions,
}: CVLibraryViewProps) {
  const t = useTranslations("analysisFlow.cvLibrary");
  const navT = useTranslations("navigation");
  const routeState = useCVLibraryRouteState();
  const listQuery = useCVDocumentList();
  const detailQuery = useCVDocumentDetail(routeState.cvId);
  const analysesQuery = useAllAnalyses();
  const questionsQuery = useInterviewQuestionsForLibrary();
  const mutations = useCVLibraryMutations();
  const autoSelectedCvIdRef = useRef<string | null>(null);
  const analyses = analysesQuery.data ?? [];
  const interviewQuestions = questionsQuery.data ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockingAnalyses, setBlockingAnalyses] = useState<AnalysisSummary[]>([]);
  const [showImport, setShowImport] = useState(false);

  const cvs = listQuery.data ?? [];
  const analysesByCv = useMemo(() => groupAnalysesByCv(analyses), [analyses]);
  const selectedFromList = cvs.find((cv) => cv.id === routeState.cvId) ?? null;
  const selected = detailQuery.data ?? selectedFromList;
  const selectedAnalyses = selected
    ? analysesByCv.get(selected.id) ?? []
    : [];
  const selectedQuestions = selected
    ? interviewQuestions.filter((question) => question.cvId === selected.id)
    : [];
  const queryError = listQuery.error
    ? getErrorMessage(listQuery.error)
    : detailQuery.error
      ? getErrorMessage(detailQuery.error)
      : null;

  useEffect(() => {
    const firstCvId = cvs[0]?.id ?? null;
    if (
      routeState.pathname === "/cvs" &&
      !routeState.cvId &&
      firstCvId &&
      autoSelectedCvIdRef.current !== firstCvId
    ) {
      autoSelectedCvIdRef.current = firstCvId;
      routeState.replaceCV(firstCvId);
    }
  }, [cvs, routeState.cvId, routeState.pathname, routeState.replaceCV]);

  const startEditing = (cv: CVDocumentListItem) => {
    setEditingId(cv.id);
    setDraftName(cv.name);
    setError(null);
  };

  const saveName = async (id: string) => {
    const nextName = draftName.trim();
    if (!nextName) return;
    setLoadingId(id);
    setError(null);
    setBlockingAnalyses([]);
    setEditingId(null);
    try {
      await mutations.renameCV.mutateAsync({ id, name: nextName });
    } catch (err: unknown) {
      setEditingId(id);
      setError(getErrorMessage(err) || t("renameFailed"));
    } finally {
      setLoadingId(null);
    }
  };

  const deleteCv = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return;

    const nextSelection = selectedAfterDelete(cvs, id);
    setLoadingId(id);
    setError(null);
    setBlockingAnalyses([]);
    routeState.replaceCV(nextSelection);
    try {
      await mutations.deleteCV.mutateAsync(id);
    } catch (err: unknown) {
      routeState.replaceCV(id);
      setError(getErrorMessage(err) || t("deleteFailed"));
    } finally {
      setLoadingId(null);
    }
  };

  if (listQuery.isLoading) {
    return <CVLibrarySkeleton />;
  }

  return (
    <FeatureScreenShell
      title={navT("cvLibrary")}
      bodyClassName="overflow-hidden"
    >
      <div className="grid h-full w-full gap-6 lg:grid-cols-[320px_1fr]">
        <CVLibrarySidebar
          cvs={cvs}
          selectedId={selected?.id ?? null}
          analysesByCv={analysesByCv}
          error={error ?? queryError}
          blockingAnalyses={blockingAnalyses}
          onSelect={(id) => { setShowImport(false); routeState.selectCV(id); }}
          onOpenAnalysis={onOpenAnalysis}
          onImportJsonResume={() => setShowImport(true)}
        />
        {showImport ? (
          <CVLibraryImportPanel onClose={() => setShowImport(false)} />
        ) : (
          <CVLibraryDetail
            selected={selected}
            cvs={cvs}
            analyses={selectedAnalyses}
            questions={selectedQuestions}
            editing={selected ? editingId === selected.id : false}
            draftName={draftName}
            saving={selected ? loadingId === selected.id : false}
            onStartEditing={() => selected && startEditing(selected)}
            onDraftNameChange={setDraftName}
            onSaveName={() => selected && saveName(selected.id)}
            onCancelEditing={() => setEditingId(null)}
            onDelete={() => selected && deleteCv(selected.id)}
            onOpenAnalysis={onOpenAnalysis}
            onOpenEditor={onOpenEditor}
            onOpenQuestions={onOpenQuestions}
          />
        )}
      </div>
    </FeatureScreenShell>
  );
}
