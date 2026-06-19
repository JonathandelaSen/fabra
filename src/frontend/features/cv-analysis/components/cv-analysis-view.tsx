"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FeatureScreenShell } from "@/frontend/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/frontend/components/shared/feature-two-pane-layout";
import { useIsDesktopLayout } from "@/frontend/components/shared/use-is-desktop-layout";
import { AnalysisDetailSkeleton } from "@/frontend/components/shared/skeletons";
import { FeatureDetailTabBar } from "@/frontend/components/shared/feature-detail-tab-bar";
import { FileText, Sparkles } from "lucide-react";
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
} from "../hooks/use-cv-analysis-queries";
import { useCVAnalysisRouteState } from "../hooks/use-cv-analysis-route-state";
import CVAnalysesListView from "./list/cv-analyses-list-view";
import { CVAnalysisDetailPanel } from "./cv-analysis-detail-panel";
import {
  shouldAutoSelectCVAnalysis,
  shouldShowCVAnalysisMainLoader,
} from "./cv-analysis-loading-state";
import NewAnalysisFlow from "./new-flow/new-analysis-flow";
import { CVAnalysisHeaderActions } from "./cv-analysis-header-actions";
import { CVAnalysisEmptyState } from "./cv-analysis-empty-state";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface CVAnalysisViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
}

export default function CVAnalysisView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
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
  };

  const showSelectedAnalysisActions =
    route.mode === "detail" &&
    selectedAnalysis !== null &&
    selectedAnalysis.ai_score !== null;

  return (
    <FeatureScreenShell
      title={listT("cvTitle")}
      mobileBackActive={route.mode === "detail" || route.mode === "new"}
      onMobileBack={route.goToList}
      actions={
        <CVAnalysisHeaderActions
          selectedAnalysis={selectedAnalysis}
          showAnalysisActions={showSelectedAnalysisActions}
          isDeleting={deleteAnalysis.isPending}
          onNewAnalysis={route.goToNew}
          onDeleteAnalysis={handleDelete}
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
          />
        }
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
          <div className="flex flex-col h-full">
            <FeatureDetailTabBar
              tabs={[
                { id: "extraction" as const, label: t("extractionTab"), icon: <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "analysis" as const, label: t("analysisTab"), icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
              ]}
              activeTab="analysis"
              onTabChange={() => {}}
            />
            <div className="flex-1 py-4 sm:py-6">
              <AnalysisDetailSkeleton />
            </div>
          </div>
        ) : !selectedAnalysis ? (
          <CVAnalysisEmptyState onCreate={route.goToNew} />
        ) : (
          <CVAnalysisDetailPanel
            selectedAnalysis={selectedAnalysis}
            route={route}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            hasAIApiKey={hasAIApiKey}
            onOpenSettings={onOpenSettings}
            onRefetchAnalysis={() => void detailQuery.refetch()}
            onScoreAnalysis={handleScoreAnalysis}
          />
        )}
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
