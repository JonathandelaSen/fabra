"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import {
  Briefcase,
  MessageCircle,
  MessageSquareQuote,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import type { JobKeyData } from "@/lib/analysis-types";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../types";
import type { JobMatchAnalysisDetail as JobMatchAnalysisDetailType } from "../api/job-match-analysis-api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScoreHero from "./score-hero";
import TabResumen from "./tab-resumen";
import TabOferta from "./tab-oferta";
import TabEntrevista from "./tab-entrevista";
import TabSeguimiento from "./tab-seguimiento";
import TabChatOferta from "./tab-chat-oferta";
import { useQuickInterviewQuestion } from "../hooks/use-quick-interview-question";
import { useJobMatchAnalysisExport } from "../hooks/use-job-match-analysis-export";

type DetailTab = "summary" | "offer" | "questions" | "chat" | "tracking";

const DETAIL_TABS = {
  summary: "summary",
  offer: "offer",
  questions: "questions",
  chat: "chat",
  tracking: "tracking",
} as const satisfies Record<DetailTab, DetailTab>;

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
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [offerStatus, setOfferStatus] = useState<OfferStatus>(
    analysis.offerStatus ?? "interesting",
  );
  const [offerNotes, setOfferNotes] = useState(analysis.offerNotes ?? "");
  const [offerNextAction, setOfferNextAction] = useState(
    analysis.offerNextAction ?? "",
  );
  const [offerNextActionAt, setOfferNextActionAt] = useState(
    toDateTimeLocalValue(analysis.offerNextActionAt),
  );
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
        offerStatus,
        offerNotes,
        offerNextAction,
        offerNextActionAt,
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
      className="flex-1 overflow-y-auto p-6"
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
          />

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              onTabChange?.(val as DetailTab);
            }}
            className="w-full"
          >
            <div className="sticky top-[-24px] z-20 -mx-6 px-6 py-4 backdrop-blur-md mb-8">
              <TabsList className="bg-white/[0.03] border-white/[0.05] p-1 rounded-2xl gap-1">
                <TabsTrigger
                  value={DETAIL_TABS.summary}
                  className="px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <Sparkles className="size-4" />
                  {t("tabs.summary")}
                </TabsTrigger>
                <TabsTrigger
                  value={DETAIL_TABS.offer}
                  className="px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <Briefcase className="size-4" />
                  {t("tabs.offer")}
                </TabsTrigger>
                <TabsTrigger
                  value={DETAIL_TABS.questions}
                  className="px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <MessageSquareQuote className="size-4" />
                  {t("tabs.questions")}
                  {interviewQuestions.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold px-2 py-0.5">
                      {interviewQuestions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value={DETAIL_TABS.chat}
                  className="px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <MessageCircle className="size-4" />
                  {t("tabs.chat")}
                </TabsTrigger>
                <TabsTrigger
                  value={DETAIL_TABS.tracking}
                  className="px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <CalendarClock className="size-4" />
                  {t("tabs.tracking")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-0">
              <TabsContent value={DETAIL_TABS.summary}>
                <TabResumen
                  improvements={improvements}
                  keywords={keywords}
                  jobKeywords={jobKeywords}
                  cvKeywords={cvKeywords}
                  matchingKeywords={matchingKeywords}
                  missingKeywords={missingKeywords}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.offer}>
                <TabOferta
                  jobKeyData={jobKeyData}
                  jobDescription={analysis.jobDescription}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.questions}>
                <TabEntrevista
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
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.chat}>
                <TabChatOferta
                  analysisId={analysis.id}
                  aiProvider={aiProvider ?? "gemini"}
                  aiApiKey={aiApiKey}
                  aiModel={aiModel ?? DEFAULT_GEMINI_MODEL}
                  hasAIApiKey={hasAIApiKey}
                />
              </TabsContent>

              <TabsContent value={DETAIL_TABS.tracking}>
                <TabSeguimiento
                  offerStatus={offerStatus}
                  onOfferStatusChange={setOfferStatus}
                  offerNotes={offerNotes}
                  onOfferNotesChange={setOfferNotes}
                  offerNextAction={offerNextAction}
                  onOfferNextActionChange={setOfferNextAction}
                  offerNextActionAt={offerNextActionAt}
                  onOfferNextActionAtChange={setOfferNextActionAt}
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
