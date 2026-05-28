"use client";

import { Briefcase, Check, CheckCircle2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteButton, EditButton, IconTextButton } from "@/components/shared/action-buttons";
import { IconLabelBadge } from "@/components/shared/icon-label-badge";
import { LabelBadge } from "@/components/shared/label-badge";
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
              <LabelBadge tone="success" size="md" icon={CheckCircle2} className="uppercase" strong>
                {t("answered")}
              </LabelBadge>
            ) : (
              <LabelBadge tone="warning" size="md" className="uppercase" strong>
                {t("pending")}
              </LabelBadge>
            )}
            {question.cvId && (
              <IconLabelBadge
                icon={FileText}
                text={linkedCvName}
              />
            )}
            {question.analysisId && (
              <IconLabelBadge
                icon={Briefcase}
                text={linkedOfferTitle}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end shrink-0">
          {question.analysisId && (
            <IconTextButton
              type="button"
              onClick={() => onOpenAnalysis(question.analysisId!)}
              icon={Briefcase}
            >
              {t("openLinkedOffer")}
            </IconTextButton>
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
            <EditButton
              type="button"
              onClick={onToggleEdit}
            />
          )}
          <DeleteButton
            type="button"
            onClick={onDelete}
          />
        </div>
      </div>
    </section>
  );
}
