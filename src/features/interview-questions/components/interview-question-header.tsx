"use client";

import { Briefcase, Check, CheckCircle2, FileText, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { InterviewQuestion } from "../api/interview-questions-api";

interface InterviewQuestionHeaderProps {
  question: InterviewQuestion;
  linkedCvName: string;
  linkedOfferTitle: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSaveAndView: () => void;
  onDelete: () => void;
  onOpenAnalysis: (id: string) => void;
}

export default function InterviewQuestionHeader({
  question,
  linkedCvName,
  linkedOfferTitle,
  isEditing,
  onToggleEdit,
  onSaveAndView,
  onDelete,
  onOpenAnalysis,
}: InterviewQuestionHeaderProps) {
  const t = useTranslations("interviewQuestions");
  const tCommon = useTranslations("common.actions");

  return (
    <section className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5 animate-fade-in">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 line-clamp-2">
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
          {isEditing ? (
            <Button
              type="button"
              onClick={onSaveAndView}
              variant="secondary"
              className="bg-emerald-600/15 text-emerald-300 hover:bg-emerald-600/25 border border-emerald-500/20 hover:text-white"
            >
              <Check className="h-4 w-4" />
              {t("actions.viewMode")}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onToggleEdit}
              variant="secondary"
              className="bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25 border border-indigo-500/20 hover:text-indigo-200"
            >
              <Pencil className="h-4 w-4" />
              {t("actions.editMode")}
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
  );
}
