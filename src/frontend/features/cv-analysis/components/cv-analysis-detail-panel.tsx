"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useIsDesktopLayout } from "@/frontend/components/shared/use-is-desktop-layout";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureDetailTabBar } from "@/frontend/components/shared/feature-detail-tab-bar";
import type { AIContext, Analysis } from "@/lib/analysis-types";
import type { ScoreCVAnalysisInput } from "../hooks/use-cv-analysis-mutations";
import type {
  CVAnalysisRouteTab,
  useCVAnalysisRouteState,
} from "../hooks/use-cv-analysis-route-state";
import AIAnalysisView from "./detail/analysis-view";
import ExtractionView from "./extraction/extraction-view";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface CVAnalysisDetailPanelProps {
  selectedAnalysis: Analysis;
  route: ReturnType<typeof useCVAnalysisRouteState>;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onRefetchAnalysis: () => void;
  onScoreAnalysis: (id: string, input: ScoreCVAnalysisInput) => Promise<void>;
}

function toAIAnalysisProps(analysis: Analysis) {
  return {
    ai_score: analysis.ai_score ?? 0,
    ai_feedback: analysis.ai_feedback ?? "",
    ai_keywords: analysis.ai_keywords ?? "[]",
    ai_improvements: analysis.ai_improvements ?? "[]",
    ai_model: analysis.ai_model ?? "",
    ai_analyzed_at: analysis.ai_analyzed_at ?? "",
    ai_context: (analysis.ai_context as AIContext | null) ?? null,
    id: analysis.id,
    cv_id: analysis.cv_id,
    cv: analysis.cv
      ? {
          id: analysis.cv.id,
          name: analysis.cv.name,
          filename: analysis.cv.filename ?? "",
          type: analysis.cv.type,
        }
      : null,
    title: analysis.title,
    filename: analysis.filename,
  };
}

function toExtractionAnalysis(analysis: Analysis) {
  return {
    ...analysis,
    cv: analysis.cv
      ? {
          id: analysis.cv.id,
          name: analysis.cv.name,
          filename: analysis.cv.filename ?? "",
          type: analysis.cv.type,
        }
      : null,
  };
}

export function CVAnalysisDetailPanel({
  selectedAnalysis,
  route,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
  onRefetchAnalysis,
  onScoreAnalysis,
}: CVAnalysisDetailPanelProps) {
  const t = useTranslations("analysisFlow.appShell");
  const extractionAnalysis = toExtractionAnalysis(selectedAnalysis);
  const hasAnalysis = selectedAnalysis.ai_score !== null;
  const routeTab = hasAnalysis ? (route.tab ?? "analysis") : "extraction";
  const [activeTab, setActiveTab] = useState<CVAnalysisRouteTab>(routeTab);
  const effectiveTab = hasAnalysis ? activeTab : "extraction";

  useEffect(() => {
    setActiveTab(routeTab);
  }, [routeTab, selectedAnalysis.id]);

  const handleTabChange = (tab: CVAnalysisRouteTab) => {
    setActiveTab(tab);
    route.setTab(tab);
  };

  const handleAnalysisComplete = () => {
    onRefetchAnalysis();
    handleTabChange("analysis");
  };

  const isDesktop = useIsDesktopLayout();

  return (
    <MotionConfig reducedMotion={isDesktop ? "always" : "never"}>
      <div className="flex flex-col">
      <FeatureDetailTabBar
        tabs={[
          { id: "extraction" as const, label: t("extractionTab"), icon: <FileText /> },
          ...(hasAnalysis
            ? [
                {
                  id: "analysis" as const,
                  label: t("analysisTab"),
                  icon: <Sparkles />,
                },
              ]
            : []),
        ]}
        activeTab={effectiveTab}
        onTabChange={handleTabChange}
      />

      <AnimatePresence mode="wait">
        {effectiveTab === "extraction" ? (
          <motion.div
            key="extraction-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <ExtractionView
              analysis={extractionAnalysis}
              onAIAnalysisComplete={handleAnalysisComplete}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
              onScoreAnalysis={onScoreAnalysis}
              hideAnalysisSelector={hasAnalysis}
            />
          </motion.div>
        ) : (
          <motion.div
            key="analysis-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <AIAnalysisView
              analysis={toAIAnalysisProps(selectedAnalysis)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
