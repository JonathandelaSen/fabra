"use client";

import type { RefObject } from "react";
import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { BasicPanel } from "@/components/shared/basic-panel";
import type { InterviewQuestion, UpdateInterviewQuestionInput } from "../api/interview-questions-api";

interface InterviewQuestionPromptPanelProps {
  question: InterviewQuestion;
  isEditing: boolean;
  questionRef: RefObject<HTMLTextAreaElement | null>;
  contextRef: RefObject<HTMLTextAreaElement | null>;
  shouldSkipBlurSave: () => boolean;
  onUpdate: (updates: Partial<UpdateInterviewQuestionInput>) => void;
}

export default function InterviewQuestionPromptPanel({
  question,
  isEditing,
  questionRef,
  contextRef,
  shouldSkipBlurSave,
  onUpdate,
}: InterviewQuestionPromptPanelProps) {
  const t = useTranslations("interviewQuestions");

  return (
    <BasicPanel className="p-5 flex flex-col gap-4 animate-fade-in">
      <h3 className="text-sm font-semibold tracking-tight text-text-soft flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary-2" />
        {t("question")}
      </h3>
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="question-textarea" className="text-xs font-medium text-text-muted">
              {t("question")}
            </label>
            <Textarea
              id="question-textarea"
              ref={questionRef}
              defaultValue={question.question}
              key={`question-${question.id}-${question.updatedAt}`}
              onBlur={(event) =>
                !shouldSkipBlurSave() &&
                event.target.value.trim() !== question.question &&
                onUpdate({ question: event.target.value })
              }
              className="min-h-24 bg-panel/[0.01] border-line focus-visible:ring-action-border"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="context-textarea" className="text-xs font-medium text-text-muted">
              {t("context")}
            </label>
            <Textarea
              id="context-textarea"
              ref={contextRef}
              defaultValue={question.context ?? ""}
              key={`context-${question.id}-${question.updatedAt}`}
              onBlur={(event) =>
                !shouldSkipBlurSave() &&
                event.target.value !== (question.context ?? "") &&
                onUpdate({ context: event.target.value || null })
              }
              className="min-h-24 bg-panel/[0.01] border-line focus-visible:ring-action-border"
              placeholder={t("aiContext")}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              {t("question")}
            </span>
            <div className="rounded-lg border border-line bg-panel/[0.01] p-3.5 text-sm leading-relaxed text-text-on-bright min-h-[5.5rem] whitespace-pre-wrap">
              {question.question}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              {t("context")}
            </span>
            {question.context ? (
              <div className="rounded-lg border border-line bg-panel/[0.01] p-3.5 text-sm leading-relaxed text-text-soft min-h-[6rem] whitespace-pre-wrap">
                {question.context}
              </div>
            ) : (
              <div className="flex rounded-lg border border-dashed border-line bg-panel/[0.005] p-3.5 text-sm italic text-text-muted min-h-[6rem] items-center justify-center">
                {t("noContextSpecified")}
              </div>
            )}
          </div>
        </div>
      )}
    </BasicPanel>
  );
}
