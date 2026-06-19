"use client";

import { MessageSquareQuote, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";

interface CVLibraryAssociatedQuestionsProps {
  selectedCvId: string;
  questions: InterviewQuestionResponse[];
  onOpenQuestions: (cvId: string) => void;
}

export function CVLibraryAssociatedQuestions({
  selectedCvId,
  questions,
  onOpenQuestions,
}: CVLibraryAssociatedQuestionsProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-text-muted">
          {t("associatedQuestions")}
        </span>
        <button
          type="button"
          onClick={() => onOpenQuestions(selectedCvId)}
          className="inline-flex items-center gap-1 rounded-md border border-action-border bg-action/10 px-2 py-0.5 text-[10px] font-semibold text-action-text hover:bg-action/20 transition-all focus:outline-none"
        >
          <Plus className="h-3 w-3" />
          {t("create")}
        </button>
      </div>
      {questions.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {questions.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => onOpenQuestions(selectedCvId)}
              className="group flex min-w-0 items-center gap-3 rounded-lg border border-line/[0.04] bg-panel/[0.02] p-2.5 text-left transition-all hover:border-action-border hover:bg-action/[0.04] focus:outline-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-control/60 text-text-muted group-hover:bg-action/10 group-hover:text-action-text transition-colors">
                <MessageSquareQuote className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-text-soft group-hover:text-text-main">
                  {question.question}
                </span>
                <span className="mt-0.5 block text-[10px] text-text-muted">
                  {question.answer ? t("answered") : t("pending")}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line/[0.06] p-4 text-center text-xs text-text-muted">
          {t("noAssociatedQuestions")}
        </div>
      )}
    </div>
  );
}
