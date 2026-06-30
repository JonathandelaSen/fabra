"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import type { JobKeyData } from "@/lib/analysis-types";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../../types";
import type { JobMatchAnalysisDetail as JobMatchAnalysisDetailType, DetailTab } from "../../types";
import { Tabs, TabsContent } from "@/frontend/components/ui/tabs";
import ScoreHero from "./score-hero";
import TabSummary from "./tabs/tab-summary";
import TabOffer from "./tabs/tab-offer";
import TabInterview from "./tabs/tab-interview";
import TabFollowUp from "./tabs/tab-follow-up";
import TabOfferChat from "./tabs/tab-offer-chat";
import { TabPeople } from "./people/tab-people";
import { useQuickInterviewQuestion } from "../../hooks/use-quick-interview-question";
import { DETAIL_TABS, JobMatchDetailTabsList } from "./job-match-detail-tabs-list";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import type {
  CreateFollowUpEntryInput,
  FollowUpEntryInput,
} from "../../api/job-match-analysis-api";
interface JobMatchAnalysisDetailProps {
  analysis: JobMatchAnalysisDetailType;
  aiProvider?: StoredAIProvider;
  aiApiKey?: string;
  aiModel?: string;
  hasAIApiKey?: boolean;
  activeTab?: DetailTab;
  onTabChange?: (tab: DetailTab) => void;
  interviewQuestions?: InterviewQuestionSummary[];
  onInterviewQuestionCreated?: () => void;
  onOpenQuestions?: () => void;
  onUpdateUrl: (url: string) => Promise<void>;
  isSavingTracking: boolean;
  onCreateTrackingEntry: (input: CreateFollowUpEntryInput) => Promise<void>;
  onUpdateTrackingEntry: (
    entryId: string,
    input: FollowUpEntryInput,
  ) => Promise<void>;
  onDeleteTrackingEntry: (entryId: string) => Promise<void>;
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
  isSavingTracking,
  onCreateTrackingEntry,
  onUpdateTrackingEntry,
  onDeleteTrackingEntry,
}: JobMatchAnalysisDetailProps) {
  const t = useTranslations("analysisDetail");
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [chatDraftRequest, setChatDraftRequest] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const currentStatus =
    analysis.tracking?.currentStatus ??
    analysis.offerStatus ??
    ("interesting" as OfferStatus);
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
  const prepareConversation = (name: string) => {
    setChatDraftRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      text: t("people.preparePrompt", { name }),
    }));
    onTabChange?.(DETAIL_TABS.chat);
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
            onSaveUrl={handleSaveUrl}
            isSavingUrl={isSavingUrl}
            offerStatus={currentStatus}
            onTabChange={onTabChange}
          />

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              const nextTab = val as DetailTab;
              onTabChange?.(nextTab);
            }}
            className="w-full"
          >
            <JobMatchDetailTabsList />

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
                  key={chatDraftRequest?.id ?? 0}
                  analysisId={analysis.id}
                  aiProvider={aiProvider ?? "gemini"}
                  aiApiKey={aiApiKey}
                  aiModel={aiModel ?? DEFAULT_GEMINI_MODEL}
                  hasAIApiKey={hasAIApiKey}
                  draftRequest={chatDraftRequest}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.people}>
                <TabPeople
                  analysisId={analysis.id}
                  onPrepareConversation={prepareConversation}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.tracking}>
                <TabFollowUp
                  currentStatus={currentStatus}
                  entries={analysis.tracking?.entries ?? []}
                  isSaving={isSavingTracking}
                  onCreateEntry={onCreateTrackingEntry}
                  onUpdateEntry={onUpdateTrackingEntry}
                  onDeleteEntry={onDeleteTrackingEntry}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
