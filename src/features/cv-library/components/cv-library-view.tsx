"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { CVLibraryDetail } from "./cv-library-detail";
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
  const routeState = useCVLibraryRouteState();
  const listQuery = useCVDocumentList();
  const detailQuery = useCVDocumentDetail(routeState.cvId);
  const analysesQuery = useAllAnalyses();
  const questionsQuery = useInterviewQuestionsForLibrary();
  const mutations = useCVLibraryMutations();
  const analyses = analysesQuery.data ?? [];
  const interviewQuestions = questionsQuery.data ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockingAnalyses, setBlockingAnalyses] = useState<AnalysisSummary[]>([]);

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
    if (!routeState.cvId && cvs[0]?.id) {
      routeState.replaceCV(cvs[0].id);
    }
  }, [cvs, routeState]);

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
    <div className="flex-1 overflow-hidden bg-[#09090f] p-6 text-zinc-100 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid h-full w-full gap-6 lg:grid-cols-[360px_1fr]"
      >
        <CVLibrarySidebar
          cvs={cvs}
          selectedId={selected?.id ?? null}
          editingId={editingId}
          draftName={draftName}
          loadingId={loadingId}
          analysesByCv={analysesByCv}
          error={error ?? queryError}
          blockingAnalyses={blockingAnalyses}
          onSelect={routeState.selectCV}
          onStartEditing={startEditing}
          onDraftNameChange={setDraftName}
          onSaveName={saveName}
          onCancelEditing={() => setEditingId(null)}
          onDelete={deleteCv}
          onOpenAnalysis={onOpenAnalysis}
        />
        <CVLibraryDetail
          selected={selected}
          cvs={cvs}
          analyses={selectedAnalyses}
          questions={selectedQuestions}
          onOpenAnalysis={onOpenAnalysis}
          onOpenEditor={onOpenEditor}
          onOpenQuestions={onOpenQuestions}
        />
      </motion.div>
    </div>
  );
}
