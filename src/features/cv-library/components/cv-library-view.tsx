"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import type { AnalysisMode, AnalysisSummary } from "@/lib/analysis-types";
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
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { useIsDesktopLayout } from "@/components/shared/use-is-desktop-layout";
import { CVLibraryDetail } from "./detail/cv-library-detail";
import { CVLibraryEmptyState } from "./cv-library-empty-state";
import {
  shouldAutoSelectCVLibraryItem,
  shouldShowCVLibraryDetailLoader,
  shouldShowCVLibraryShellLoader,
} from "./cv-library-loading-state";
import { CVLibrarySidebar } from "./sidebar/cv-library-sidebar";
import { CVLibraryDetailSkeleton, CVLibrarySkeleton } from "./cv-library-skeleton";

interface CVLibraryViewProps {
  onOpenAnalysis: (id: string, mode?: AnalysisMode) => void;
  onOpenEditor: (cvId: string) => void;
  onOpenQuestions: (cvId: string) => void;
  onStartAnalysis: () => void;
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
  onStartAnalysis,
}: CVLibraryViewProps) {
  const t = useTranslations("analysisFlow.cvLibrary");
  const navT = useTranslations("navigation");
  const routeState = useCVLibraryRouteState();
  const [selectedCvId, setSelectedCvId] = useState<string | null>(routeState.cvId);

  useEffect(() => {
    setSelectedCvId(routeState.cvId);
  }, [routeState.cvId]);

  const listQuery = useCVDocumentList();
  const detailQuery = useCVDocumentDetail(selectedCvId);
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

  const cvs = listQuery.data ?? [];
  const analysesByCv = useMemo(() => groupAnalysesByCv(analyses), [analyses]);
  const selectedFromList = cvs.find((cv) => cv.id === selectedCvId) ?? null;
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
  const isListPending = listQuery.isPending;
  const isDetailPending = detailQuery.isPending;
  const isDesktopLayout = useIsDesktopLayout();

  useEffect(() => {
    const firstCvId = cvs[0]?.id ?? null;
    if (
      isDesktopLayout &&
      shouldAutoSelectCVLibraryItem({
        cvCount: cvs.length,
        isListPending,
        pathname: routeState.pathname,
        selectedCvId: routeState.cvId,
      }) &&
      firstCvId &&
      autoSelectedCvIdRef.current !== firstCvId
    ) {
      autoSelectedCvIdRef.current = firstCvId;
      setSelectedCvId(firstCvId);
      routeState.replaceCV(firstCvId);
    }
  }, [cvs, isDesktopLayout, isListPending, routeState.cvId, routeState.pathname, routeState.replaceCV]);

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
    setSelectedCvId(nextSelection);
    routeState.replaceCV(nextSelection);
    try {
      await mutations.deleteCV.mutateAsync(id);
    } catch (err: unknown) {
      setSelectedCvId(id);
      routeState.replaceCV(id);
      setError(getErrorMessage(err) || t("deleteFailed"));
    } finally {
      setLoadingId(null);
    }
  };

  if (
    shouldShowCVLibraryShellLoader({
      cvCount: cvs.length,
      isDetailPending,
      isListPending,
      pathname: routeState.pathname,
      selectedCvId,
    })
  ) {
    return (
      <FeatureScreenShell
        title={navT("cvLibrary")}
        bodyClassName="overflow-hidden"
        actions={
          <FeatureHeaderActionButton
            label={t("uploadAndAnalyze")}
            onClick={onStartAnalysis}
          />
        }
      >
        <CVLibrarySkeleton />
      </FeatureScreenShell>
    );
  }

  return (
    <FeatureScreenShell
      title={navT("cvLibrary")}
      mobileBackActive={Boolean(routeState.cvId)}
      onMobileBack={() => routeState.replaceCV(null)}
      bodyClassName="overflow-hidden"
      actions={
        <FeatureHeaderActionButton
          label={t("uploadAndAnalyze")}
          onClick={onStartAnalysis}
        />
      }
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={routeState.cvId ? true : false}
        sidebar={
          <CVLibrarySidebar
            cvs={cvs}
            selectedId={selectedCvId}
            analysesByCv={analysesByCv}
            error={error ?? queryError}
            blockingAnalyses={blockingAnalyses}
            onSelect={(id) => {
              setSelectedCvId(id);
              routeState.selectCV(id);
            }}
            onOpenAnalysis={onOpenAnalysis}
          />
        }
      >
        {shouldShowCVLibraryDetailLoader({
          cvCount: cvs.length,
          isDetailPending,
          isListPending,
          pathname: routeState.pathname,
          selectedCvId,
        }) ? (
          <CVLibraryDetailSkeleton />
        ) : !selected ? (
          <CVLibraryEmptyState
            hasCvs={cvs.length > 0}
            onStartAnalysis={onStartAnalysis}
          />
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
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
