"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  type AnalysisMode,
  type AIContext,
  type JobKeyData,
  type OfferStatus,
} from "@/lib/analysis-types";
import { Tabs } from "@/components/ui/tabs";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { DeleteAnalysisHandler, InterviewQuestionSummary } from "../types";
import { useAnalysisViewActions } from "../hooks/use-analysis-view-actions";
import ScoreHero from "./score-hero";
import { AnalysisTabsContent } from "./analysis-tabs-content";
import { AnalysisTabsList } from "./analysis-tabs-list";
import { exportAnalysisReport } from "./analysis-report-export";

interface AIAnalysisViewProps {
  analysis: {
    ai_score: number;
    ai_feedback: string;
    ai_keywords: string;
    ai_improvements: string;
    ai_model: string;
    ai_analyzed_at: string;
    analysis_mode: AnalysisMode;
    job_description: string | null;
    job_url: string | null;
    offer_status: OfferStatus | null;
    offer_notes: string | null;
    offer_next_action: string | null;
    offer_next_action_at: string | null;
    ai_context: AIContext | null;
    job_key_data: string | null;
    job_keywords: string | null;
    cv_keywords: string | null;
    matching_keywords: string | null;
    missing_keywords: string | null;
    id: string;
    cv_id: string | null;
    cv: {
      id: string;
      name: string;
      filename: string;
      type?: string;
    } | null;
    title: string;
      filename: string;
    };
  aiProvider?: StoredAIProvider;
  aiApiKey?: string;
  aiModel?: string;
  hasAIApiKey?: boolean;
  interviewQuestions?: InterviewQuestionSummary[];
  onInterviewQuestionCreated?: () => void;
  onOpenQuestions?: () => void;
  onDelete?: DeleteAnalysisHandler;
  onUpdate?: () => void;
}

function safeParseArray(value: string | null): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function safeParseJobKeyData(value: string | null): JobKeyData | null {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" ? (parsed as JobKeyData) : null;
  } catch {
    return null;
  }
}

export default function AIAnalysisView({
  analysis,
  aiProvider = "gemini",
  aiApiKey = "",
  aiModel = "gemini-3.1-pro-preview",
  hasAIApiKey = false,
  interviewQuestions = [],
  onInterviewQuestionCreated,
  onOpenQuestions,
  onDelete,
  onUpdate,
}: AIAnalysisViewProps) {
  const t = useTranslations("analysisDetail");
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const [isDeleting, setIsDeleting] = useState(false);

  const keywords = safeParseArray(analysis.ai_keywords);
  const improvements = safeParseArray(analysis.ai_improvements);
  const jobKeywords = safeParseArray(analysis.job_keywords);
  const cvKeywords = safeParseArray(analysis.cv_keywords);
  const matchingKeywords = safeParseArray(analysis.matching_keywords);
  const missingKeywords = safeParseArray(analysis.missing_keywords);
  const jobKeyData = safeParseJobKeyData(analysis.job_key_data);
  const additionalContext = analysis.ai_context?.additionalContext;
  const isJobMatch = analysis.analysis_mode === "job_match";

  const actions = useAnalysisViewActions({
    analysis,
    aiProvider,
    aiApiKey,
    hasAIApiKey,
    onInterviewQuestionCreated,
    onOpenQuestions,
    onUpdate,
    messages: {
      missingApiKeyForAnswer: t("alerts.missingApiKeyForAnswer"),
      missingContextForAnswer: t("alerts.missingContextForAnswer"),
      createQuestionFailed: t("alerts.createQuestionFailed"),
      generateAnswerFailed: t("alerts.generateAnswerFailed"),
      createLinkedQuestionFailed: t("alerts.createLinkedQuestionFailed"),
      saveTrackingFailed: t("alerts.saveTrackingFailed"),
      saveUrlFailed: t("alerts.saveUrlFailed"),
    },
  });

  const handleExport = () => {
    exportAnalysisReport({
      analysis,
      dateLocale,
      keywords,
      improvements,
      jobKeywords,
      cvKeywords,
      missingKeywords,
      t,
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm(t("alerts.confirmDelete"))) return;
    setIsDeleting(true);
    try {
      await onDelete(analysis.id);
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert(t("alerts.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 overflow-y-auto p-6"
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-full space-y-5">
          <ScoreHero
            score={analysis.ai_score}
            title={analysis.title}
            feedback={analysis.ai_feedback}
            model={analysis.ai_model}
            analyzedAt={analysis.ai_analyzed_at}
            analysisMode={analysis.analysis_mode}
            jobDescription={analysis.job_description}
            jobUrl={analysis.job_url}
            cv={analysis.cv}
            cvId={analysis.cv_id}
            filename={analysis.filename}
            onExport={handleExport}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            onSaveUrl={actions.handleSaveUrl}
            isSavingUrl={actions.isSavingUrl}
          />

          <Tabs defaultValue="resumen" className="w-full">
            <AnalysisTabsList
              isJobMatch={isJobMatch}
              hasAdditionalContext={Boolean(additionalContext)}
              interviewQuestionCount={interviewQuestions.length}
            />
            <AnalysisTabsContent
              isJobMatch={isJobMatch}
              improvements={improvements}
              keywords={keywords}
              jobKeywords={jobKeywords}
              cvKeywords={cvKeywords}
              matchingKeywords={matchingKeywords}
              missingKeywords={missingKeywords}
              analysisMode={analysis.analysis_mode}
              jobKeyData={jobKeyData}
              jobDescription={analysis.job_description}
              interviewQuestions={interviewQuestions}
              onOpenQuestions={onOpenQuestions}
              quickQuestion={actions.quickQuestion}
              onQuickQuestionChange={actions.setQuickQuestion}
              quickQuestionContext={actions.quickQuestionContext}
              onQuickQuestionContextChange={actions.setQuickQuestionContext}
              quickQuestionModel={actions.quickQuestionModel}
              onQuickQuestionModelChange={actions.setQuickQuestionModel}
              isCreatingQuestion={actions.isCreatingQuestion}
              onCreateQuestion={actions.handleCreateInterviewQuestion}
              analysisId={analysis.id}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              offerStatus={actions.offerStatus}
              onOfferStatusChange={actions.setOfferStatus}
              offerNotes={actions.offerNotes}
              onOfferNotesChange={actions.setOfferNotes}
              offerNextAction={actions.offerNextAction}
              onOfferNextActionChange={actions.setOfferNextAction}
              offerNextActionAt={actions.offerNextActionAt}
              onOfferNextActionAtChange={actions.setOfferNextActionAt}
              isSavingTracking={actions.isSavingTracking}
              onSaveTracking={actions.handleSaveTracking}
              additionalContext={additionalContext}
            />
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
