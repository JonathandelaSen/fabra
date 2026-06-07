"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import type { JobKeyData } from "@/lib/analysis-types";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../types";
import type { JobMatchAnalysisDetail as JobMatchAnalysisDetailType } from "../types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ScoreHero from "./score-hero";
import TabSummary from "./tab-summary";
import TabOffer from "./tab-offer";
import TabInterview from "./tab-interview";
import TabFollowUp from "./tab-follow-up";
import TabOfferChat from "./tab-offer-chat";
import { useQuickInterviewQuestion } from "../hooks/use-quick-interview-question";
import { useJobMatchAnalysisExport } from "../hooks/use-job-match-analysis-export";
import { DETAIL_TABS, JobMatchDetailTabsList } from "./job-match-detail-tabs-list";
type DetailTab = "summary" | "offer" | "questions" | "chat" | "tracking";
interface JobMatchAnalysisDetailProps {
  analysis: JobMatchAnalysisDetailType;
  aiProvider?: "gemini" | "mock";
  aiApiKey?: string;
  aiModel?: string;
  hasAIApiKey?: boolean;
  activeTab?: DetailTab;
  onTabChange?: (tab: DetailTab) => void;
  interviewQuestions?: InterviewQuestionSummary[];
  onInterviewQuestionCreated?: () => void;
  onOpenQuestions?: () => void;
  onUpdateUrl: (url: string) => Promise<void>;
  onUpdateTracking: (updates: {
    offerStatus: OfferStatus;
    offerNotes: string;
    offerNextAction: string;
    offerNextActionAt: string;
  }) => Promise<void>;
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

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function JobMatchAnalysisDetail({
  analysis,
  aiProvider = "gemini",
  aiApiKey = "",
  aiModel = DEFAULT_GEMINI_MODEL,
  hasAIApiKey = false,
  activeTab = DETAIL_TABS.summary,
  onTabChange,
  interviewQuestions = [],
  onInterviewQuestionCreated,
  onOpenQuestions,
  onUpdateUrl,
  onUpdateTracking,
}: JobMatchAnalysisDetailProps) {
  const t = useTranslations("analysisDetail");
  const [localTab, setLocalTab] = useState(activeTab);

  useEffect(() => {
    setLocalTab(activeTab);
  }, [activeTab]);

  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [tracking, setTracking] = useState({
    status: analysis.offerStatus ?? ("interesting" as OfferStatus),
    notes: analysis.offerNotes ?? "",
    nextAction: analysis.offerNextAction ?? "",
    nextActionAt: toDateTimeLocalValue(analysis.offerNextActionAt),
  });
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const quickInterviewQuestion = useQuickInterviewQuestion({
    analysisId: analysis.id,
    cvId: analysis.cvId ?? null,
    aiProvider,
    aiApiKey,
    hasAIApiKey,
    onCreated: onInterviewQuestionCreated,
  });

  const keywords = safeParseArray(analysis.aiKeywords);
  const improvements = safeParseArray(analysis.aiImprovements);
  const jobKeywords = safeParseArray(analysis.jobKeywords);
  const cvKeywords = safeParseArray(analysis.cvKeywords);
  const matchingKeywords = safeParseArray(analysis.matchingKeywords);
  const missingKeywords = safeParseArray(analysis.missingKeywords);
  const jobKeyData = safeParseJobKeyData(analysis.jobKeyData);
  const exportAnalysis = useJobMatchAnalysisExport({
    analysis,
    keywords,
    improvements,
    jobKeywords,
    cvKeywords,
    missingKeywords,
  });

  const handleSaveUrl = async (url: string) => {
    setIsSavingUrl(true);
    try {
      await onUpdateUrl(url);
    } catch (err) {
      console.error(err);
      alert(t("alerts.saveUrlFailed"));
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleSaveTracking = async () => {
    setIsSavingTracking(true);
    try {
      await onUpdateTracking({
        offerStatus: tracking.status,
        offerNotes: tracking.notes,
        offerNextAction: tracking.nextAction,
        offerNextActionAt: tracking.nextActionAt,
      });
    } catch (err) {
      console.error(err);
      alert(t("alerts.saveTrackingFailed"));
    } finally {
      setIsSavingTracking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 py-4 sm:py-6"
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-full space-y-5">
          <ScoreHero
            score={analysis.aiScore!}
            title={analysis.title}
            feedback={analysis.aiFeedback!}
            model={analysis.aiModel!}
            analyzedAt={analysis.aiAnalyzedAt!}
            jobDescription={analysis.jobDescription}
            jobUrl={analysis.jobUrl}
            cv={analysis.cv}
            cvId={analysis.cvId}
            filename={analysis.filename}
            onExport={exportAnalysis}
            onSaveUrl={handleSaveUrl}
            isSavingUrl={isSavingUrl}
            offerStatus={tracking.status}
            onTabChange={onTabChange}
          />

          <Tabs
            value={localTab}
            onValueChange={(val) => {
              const nextTab = val as DetailTab;
              setLocalTab(nextTab);
              onTabChange?.(nextTab);
            }}
            className="w-full"
          >
            <JobMatchDetailTabsList interviewQuestionCount={interviewQuestions.length} />

            <div className="min-h-0">
              <TabsContent value={DETAIL_TABS.summary}>
                <TabSummary
                  improvements={improvements}
                  keywords={keywords}
                  jobKeywords={jobKeywords}
                  cvKeywords={cvKeywords}
                  matchingKeywords={matchingKeywords}
                  missingKeywords={missingKeywords}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.offer}>
                <TabOffer
                  jobKeyData={jobKeyData}
                  jobDescription={analysis.jobDescription}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.questions}>
                <TabInterview
                  interviewQuestions={interviewQuestions}
                  onOpenQuestions={onOpenQuestions}
                  quickQuestion={quickInterviewQuestion.question}
                  onQuickQuestionChange={quickInterviewQuestion.setQuestion}
                  quickQuestionContext={quickInterviewQuestion.context}
                  onQuickQuestionContextChange={quickInterviewQuestion.setContext}
                  quickQuestionModel={quickInterviewQuestion.model}
                  onQuickQuestionModelChange={quickInterviewQuestion.setModel}
                  isCreatingQuestion={quickInterviewQuestion.isCreating}
                  onCreateQuestion={quickInterviewQuestion.create}
                  aiProvider={aiProvider ?? "gemini"}
                  hasAIApiKey={hasAIApiKey}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.chat}>
                <TabOfferChat
                  analysisId={analysis.id}
                  aiProvider={aiProvider ?? "gemini"}
                  aiApiKey={aiApiKey}
                  aiModel={aiModel ?? DEFAULT_GEMINI_MODEL}
                  hasAIApiKey={hasAIApiKey}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.tracking}>
                <TabFollowUp
                  offerStatus={tracking.status}
                  onOfferStatusChange={(status) =>
                    setTracking((prev) => ({ ...prev, status }))
                  }
                  offerNotes={tracking.notes}
                  onOfferNotesChange={(notes) =>
                    setTracking((prev) => ({ ...prev, notes }))
                  }
                  offerNextAction={tracking.nextAction}
                  onOfferNextActionChange={(nextAction) =>
                    setTracking((prev) => ({ ...prev, nextAction }))
                  }
                  offerNextActionAt={tracking.nextActionAt}
                  onOfferNextActionAtChange={(nextActionAt) =>
                    setTracking((prev) => ({ ...prev, nextActionAt }))
                  }
                  isSavingTracking={isSavingTracking}
                  onSaveTracking={handleSaveTracking}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
