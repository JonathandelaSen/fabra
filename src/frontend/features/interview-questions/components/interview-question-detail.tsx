"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/lib/clipboard";
import type {
  InterviewQuestion,
  UpdateInterviewQuestionInput,
} from "../api/interview-questions-api";
import type {
  InterviewQuestionAnalysisOption,
  InterviewQuestionCVOption,
  InterviewQuestionAIMode,
} from "./interview-questions-types";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import InterviewQuestionHeader from "./interview-question-header";
import InterviewQuestionPromptPanel from "./interview-question-prompt-panel";
import InterviewQuestionAnswerPanel from "./interview-question-answer-panel";

interface InterviewQuestionDetailProps {
  question: InterviewQuestion;
  cvs: InterviewQuestionCVOption[];
  analyses: InterviewQuestionAnalysisOption[];
  provider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  model: string;
  isSaving: boolean;
  aiLoading: InterviewQuestionAIMode | null;
  hasAIApiKey: boolean;
  onModelChange: (model: string) => void;
  onUpdate: (updates: Partial<UpdateInterviewQuestionInput>) => void;
  onDelete: () => void;
  onRunAI: (mode: InterviewQuestionAIMode, instruction: string) => void;
  onOpenSettings: () => void;
  onOpenAnalysis: (id: string) => void;
  onOpenCopyPaste: () => void;
}

export function InterviewQuestionDetail({
  question,
  cvs,
  analyses,
  provider,
  onProviderChange,
  model,
  isSaving,
  aiLoading,
  hasAIApiKey,
  onModelChange,
  onUpdate,
  onDelete,
  onRunAI,
  onOpenSettings,
  onOpenAnalysis,
  onOpenCopyPaste,
}: InterviewQuestionDetailProps) {
  const t = useTranslations("interviewQuestions");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [question.id]);

  const handleCopy = async () => {
    if (!question.answer) return;
    await copyToClipboard(question.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  const contextRef = useRef<HTMLTextAreaElement | null>(null);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  const saveButtonClicked = useRef(false);

  const linkedCvName =
    question.cv?.name ??
    cvs.find((cv) => cv.id === question.cvId)?.name ??
    t("noCv");
  const linkedOfferTitle =
    question.analysis?.title ??
    analyses.find((analysis) => analysis.id === question.analysisId)?.title ??
    t("noOffer");

  const markSaveIntent = () => {
    saveButtonClicked.current = true;
  };

  const shouldSkipBlurSave = () => saveButtonClicked.current;

  const saveManualDetail = () => {
    onUpdate({
      question: questionRef.current?.value ?? question.question,
      context: contextRef.current?.value || null,
      answer: answerRef.current?.value || null,
    });
    requestAnimationFrame(() => {
      saveButtonClicked.current = false;
    });
  };

  return (
    <div className="flex w-full max-w-[1600px] mx-auto flex-col gap-5">
      <InterviewQuestionHeader
        question={question}
        linkedCvName={linkedCvName}
        linkedOfferTitle={linkedOfferTitle}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(true)}
        onSaveAndView={() => {
          saveManualDetail();
          setIsEditing(false);
        }}
        onDelete={onDelete}
        onOpenAnalysis={onOpenAnalysis}
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <InterviewQuestionPromptPanel
          question={question}
          isEditing={isEditing}
          questionRef={questionRef}
          contextRef={contextRef}
          shouldSkipBlurSave={shouldSkipBlurSave}
          onUpdate={onUpdate}
        />
        <InterviewQuestionAnswerPanel
          question={question}
          isEditing={isEditing}
          copied={copied}
          isSaving={isSaving}
          aiLoading={aiLoading}
          hasAIApiKey={hasAIApiKey}
          provider={provider}
          onProviderChange={onProviderChange}
          model={model}
          answerRef={answerRef}
          shouldSkipBlurSave={shouldSkipBlurSave}
          onUpdate={onUpdate}
          onModelChange={onModelChange}
          onRunAI={onRunAI}
          onOpenSettings={onOpenSettings}
          onOpenCopyPaste={onOpenCopyPaste}
          onMarkSaveIntent={markSaveIntent}
          onSaveManualDetail={saveManualDetail}
          onCopy={handleCopy}
        />
      </section>
    </div>
  );
}
