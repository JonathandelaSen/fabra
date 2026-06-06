"use client";

import { useEffect, useMemo, useState } from "react";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { useTranslations } from "next-intl";
import type { InterviewQuestionSummary } from "../types";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { useIsDesktopLayout } from "@/components/shared/use-is-desktop-layout";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
import {
  useCreateCVAnalysis,
  useDeleteCVAnalysis,
  useScoreCVAnalysis,
  useUploadCVForAnalysis,
  type CreateCVAnalysisInput,
  type ScoreCVAnalysisInput,
} from "../hooks/use-cv-analysis-mutations";
import {
  useCVAnalysesList,
  useCVAnalysisCVOptions,
  useCVAnalysisDetail,
  useCVAnalysisInterviewQuestions,
} from "../hooks/use-cv-analysis-queries";
import { useCVAnalysisRouteState } from "../hooks/use-cv-analysis-route-state";
import CVAnalysesListView from "./cv-analyses-list-view";
import { CVAnalysisDetailPanel } from "./cv-analysis-detail-panel";
import {
  shouldAutoSelectCVAnalysis,
  shouldShowCVAnalysisMainLoader,
} from "./cv-analysis-loading-state";
import NewAnalysisFlow from "./new-analysis-flow";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface CVAnalysisViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onOpenQuestions: (options?: {
    cvId?: string | null;
    analysisId?: string | null;
  }) => void;
}

export default function CVAnalysisView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
  onOpenQuestions,
}: CVAnalysisViewProps) {
  const t = useTranslations("analysisFlow.appShell");
  const listT = useTranslations("analysisFlow.lists");
  const route = useCVAnalysisRouteState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    route.analysisId,
  );
  const analysesQuery = useCVAnalysesList();
  const cvOptionsQuery = useCVAnalysisCVOptions();
  const detailQuery = useCVAnalysisDetail(selectedAnalysisId);
  const interviewQuestionsQuery = useCVAnalysisInterviewQuestions(
    selectedAnalysisId,
  );
  const createAnalysis = useCreateCVAnalysis();
  const uploadCV = useUploadCVForAnalysis();
  const scoreAnalysis = useScoreCVAnalysis();
  const deleteAnalysis = useDeleteCVAnalysis();

  const analyses = useMemo(() => analysesQuery.data ?? [], [analysesQuery.data]);
  const filteredAnalyses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return analyses;
    return analyses.filter((analysis) => {
      const title = analysis.title || analysis.filename.replace(/\.pdf$/i, "");
      return title.toLowerCase().includes(query);
    });
  }, [analyses, searchQuery]);
  const selectedAnalysis = detailQuery.data ?? null;
  const selectedIdInCurrentList =
    filteredAnalyses.find((analysis) => analysis.id === selectedAnalysisId)?.id ?? null;
  const isResolvingList = analysesQuery.isFetching;
  const isListPending = analysesQuery.isPending;
  const isDetailPending = detailQuery.isPending;
  const isDesktopLayout = useIsDesktopLayout();

  useEffect(() => {
    if (
      isDesktopLayout &&
      route.pathname === "/cv-analysis" &&
      shouldAutoSelectCVAnalysis({
        analysisCount: analyses.length,
        isListPending,
        mode: route.mode,
        selectedAnalysisId: route.analysisId,
      })
    ) {
      setSelectedAnalysisId(analyses[0].id);
      route.replaceDetail(analyses[0].id);
    }
  }, [analyses, isDesktopLayout, isListPending, route]);

  useEffect(() => {
    setSelectedAnalysisId(route.analysisId);
  }, [route.analysisId]);

  const handleCreateCV = async (file: File, name: string) => {
    const cv = await uploadCV.mutateAsync({ file, name });
    return cv.id;
  };

  const handleCreateAnalysis = async (input: CreateCVAnalysisInput) => {
    const analysis = await createAnalysis.mutateAsync({
      model: aiModel,
      ...input,
    });
    return analysis.id;
  };

  const handleScoreAnalysis = async (
    id: string,
    input: ScoreCVAnalysisInput,
  ) => {
    await scoreAnalysis.mutateAsync({ id, input });
  };

  const handleDelete = async (id: string) => {
    const currentIndex = analyses.findIndex((analysis) => analysis.id === id);
    const nextAnalysis =
      analyses[currentIndex + 1] ?? analyses[currentIndex - 1] ?? null;
    await deleteAnalysis.mutateAsync(id);
    if (selectedAnalysisId === id) {
      if (nextAnalysis) {
        setSelectedAnalysisId(nextAnalysis.id);
        route.replaceDetail(nextAnalysis.id);
      } else {
        setSelectedAnalysisId(null);
        route.goToList();
      }
    }
  }

  return (
    <FeatureScreenShell
      title={listT("cvTitle")}
      mobileBackActive={route.mode === "detail" || route.mode === "new"}
      onMobileBack={route.goToList}
      actions={
        <FeatureHeaderActionButton
          label={listT("newAnalysis")}
          onClick={route.goToNew}
        />
      }
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={
          route.mode === "detail" || route.mode === "new"
            ? true
            : route.mode === "list"
              ? false
              : undefined
        }
        sidebar={
          <CVAnalysesListView
            analyses={filteredAnalyses}
            selectedId={selectedIdInCurrentList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isResolvingList}
            onSelect={(id) => {
              setSelectedAnalysisId(id);
              route.goToDetail(id);
            }}
            onDelete={(id) => void handleDelete(id)}
          />
        }
        mainClassName="overflow-hidden"
      >
        {route.mode === "new" ? (
          <NewAnalysisFlow
            cvs={cvOptionsQuery.data ?? []}
            onCreateCV={handleCreateCV}
            onCreateAnalysis={handleCreateAnalysis}
            onAnalysisCreated={(analysisId) => {
              setSelectedAnalysisId(analysisId);
              route.goToDetail(analysisId);
            }}
          />
        ) : shouldShowCVAnalysisMainLoader({
          analysisCount: filteredAnalyses.length,
          isDetailPending,
          isListPending,
          mode: route.mode,
          selectedAnalysisId,
        }) ? (
          <div className="h-full overflow-y-auto p-6">
            <AnalysisDetailSkeleton />
          </div>
        ) : !selectedAnalysis ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            {t("empty")}
          </div>
        ) : (
          <CVAnalysisDetailPanel
            selectedAnalysis={selectedAnalysis}
            route={route}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            hasAIApiKey={hasAIApiKey}
            interviewQuestions={
              (interviewQuestionsQuery.data ?? []) as InterviewQuestionSummary[]
            }
            onDelete={handleDelete}
            onOpenSettings={onOpenSettings}
            onOpenQuestions={onOpenQuestions}
            onRefetchAnalysis={() => void detailQuery.refetch()}
            onRefetchQuestions={() => void interviewQuestionsQuery.refetch()}
            onScoreAnalysis={handleScoreAnalysis}
          />
        )}
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
