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
        <span className="text-[11px] font-medium text-zinc-500">
          {t("associatedQuestions")}
        </span>
        <button
          type="button"
          onClick={() => onOpenQuestions(selectedCvId)}
          className="inline-flex items-center gap-1 rounded-md border border-fuchsia-500/25 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all focus:outline-none"
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
              className="group flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5 text-left transition-all hover:border-fuchsia-500/20 hover:bg-fuchsia-500/[0.04] focus:outline-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-500 group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-300 transition-colors">
                <MessageSquareQuote className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-zinc-200 group-hover:text-zinc-100">
                  {question.question}
                </span>
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  {question.answer ? t("answered") : t("pending")}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-xs text-zinc-500">
          {t("noAssociatedQuestions")}
        </div>
      )}
    </div>
  );
}
