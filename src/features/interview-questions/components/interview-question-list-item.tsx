"use client";

import { Briefcase, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { InterviewQuestion } from "../api/interview-questions-api";

interface InterviewQuestionListItemProps {
  question: InterviewQuestion;
  isSelected: boolean;
  onSelect: () => void;
}

export function InterviewQuestionListItem({
  question,
  isSelected,
  onSelect,
}: InterviewQuestionListItemProps) {
  const t = useTranslations("interviewQuestions");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative mb-2 w-full rounded-xl p-3.5 text-left border transition-all duration-200 ${
        isSelected
          ? "bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 line-clamp-2 text-[14px] font-semibold tracking-tight text-zinc-100">
          {question.question}
        </p>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
            isSelected ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
          }`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {question.answer ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {t("answered")}
            </span>
          ) : (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-amber-400">
              {t("pending")}
            </span>
          )}
          {question.cv && (
            <span className="inline-flex items-center gap-1 truncate text-[11px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
              <FileText className="h-3 w-3 text-zinc-600" />
              <span className="truncate max-w-[80px]">{question.cv.name}</span>
            </span>
          )}
          {question.analysis && (
            <span className="inline-flex items-center gap-1 truncate text-[11px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
              <Briefcase className="h-3 w-3 text-zinc-600" />
              <span className="truncate max-w-[80px]">{t("offer")}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

