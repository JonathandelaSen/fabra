"use client";

import { Briefcase, CheckCircle2, FileText, Loader2, Save, Trash2, MessageSquare } from "lucide-react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AIActionLauncher, {
  type AIModelOption,
} from "@/components/shared/ai-action-launcher";
import type {
  InterviewQuestion,
  UpdateInterviewQuestionInput,
} from "../api/interview-questions-api";
import type {
  InterviewQuestionAnalysisOption,
  InterviewQuestionCVOption,
} from "./interview-questions-types";

const AI_MODELS: AIModelOption[] = [
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

interface InterviewQuestionDetailProps {
  question: InterviewQuestion;
  cvs: InterviewQuestionCVOption[];
  analyses: InterviewQuestionAnalysisOption[];
  model: string;
  isSaving: boolean;
  aiLoading: "generate" | "edit" | null;
  hasAIApiKey: boolean;
  onModelChange: (model: string) => void;
  onUpdate: (updates: Partial<UpdateInterviewQuestionInput>) => void;
  onDelete: () => void;
  onRunAI: (mode: "generate" | "edit", instruction: string) => void;
  onOpenSettings: () => void;
  onOpenAnalysis: (id: string) => void;
  onOpenCopyPaste: () => void;
}

export function InterviewQuestionDetail({
  question,
  cvs,
  analyses,
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
  const tCommon = useTranslations("common.actions");
  
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
    <div className="flex w-full flex-col gap-5">
      {/* Header Panel */}
      <section className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5 animate-fade-in">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
              {t("detail")}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 line-clamp-2">
              {question.question}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              {question.answer ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {t("answered")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/20">
                  {t("pending")}
                </span>
              )}
              {question.cvId && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  {linkedCvName}
                </span>
              )}
              {question.analysisId && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                  <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                  {linkedOfferTitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end shrink-0">
            {question.analysisId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenAnalysis(question.analysisId!)}
                className="bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25 border border-indigo-500/20 hover:text-indigo-200"
              >
                <Briefcase className="h-4 w-4" />
                {t("openLinkedOffer")}
              </Button>
            )}
            <Button
              type="button"
              onClick={onDelete}
              variant="destructive"
              className="bg-rose-600/15 text-rose-300 hover:bg-rose-600/25 border border-rose-500/20 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              {tCommon("delete")}
            </Button>
          </div>
        </div>
      </section>

      {/* Inputs Panels */}
      <section className="grid gap-5 xl:grid-cols-2">
        {/* Question & Context Panel */}
        <div className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5 flex flex-col gap-4 animate-fade-in">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-300 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            {t("detail")}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="question-textarea" className="text-xs font-medium text-zinc-500">
                {t("question")}
              </label>
              <Textarea
                id="question-textarea"
                ref={questionRef}
                defaultValue={question.question}
                key={`question-${question.id}-${question.updatedAt}`}
                onBlur={(event) =>
                  !saveButtonClicked.current &&
                  event.target.value.trim() !== question.question &&
                  onUpdate({ question: event.target.value })
                }
                className="min-h-24 bg-white/[0.01] border-white/[0.08] focus-visible:ring-indigo-500/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="context-textarea" className="text-xs font-medium text-zinc-500">
                {t("context")}
              </label>
              <Textarea
                id="context-textarea"
                ref={contextRef}
                defaultValue={question.context ?? ""}
                key={`context-${question.id}-${question.updatedAt}`}
                onBlur={(event) =>
                  !saveButtonClicked.current &&
                  event.target.value !== (question.context ?? "") &&
                  onUpdate({ context: event.target.value || null })
                }
                className="min-h-24 bg-white/[0.01] border-white/[0.08] focus-visible:ring-indigo-500/50"
                placeholder={t("aiContext")}
              />
            </div>
          </div>
        </div>

        {/* Answer Panel */}
        <div className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5 flex flex-col gap-4 animate-fade-in">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {t("answer")}
          </h3>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="answer-textarea" className="text-xs font-medium text-zinc-500">
              {t("answer")}
            </label>
            <Textarea
              id="answer-textarea"
              ref={answerRef}
              defaultValue={question.answer ?? ""}
              key={`answer-${question.id}-${question.updatedAt}`}
              onBlur={(event) =>
                !saveButtonClicked.current &&
                event.target.value !== (question.answer ?? "") &&
                onUpdate({ answer: event.target.value || null })
              }
              className="min-h-64 flex-1 bg-white/[0.01] border-white/[0.08] focus-visible:ring-indigo-500/50 leading-relaxed"
              placeholder={t("manualAnswer")}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
            <div className="flex flex-wrap items-center gap-3">
              <AIActionLauncher
                actionLabel={t("generateWithAI")}
                loading={aiLoading !== null}
                integrated={{
                  available: hasAIApiKey,
                  selectedModelId: model,
                  models: AI_MODELS,
                  onModelChange: onModelChange,
                  onRun: () => onRunAI("generate", ""),
                  onConfigure: onOpenSettings,
                }}
                copyPaste={{
                  available: true,
                  onOpenFlow: onOpenCopyPaste,
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              {isSaving && (
                <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("saving")}
                </p>
              )}
              <Button
                type="button"
                onMouseDown={markSaveIntent}
                onClick={saveManualDetail}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/10"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("saveManualChanges")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

