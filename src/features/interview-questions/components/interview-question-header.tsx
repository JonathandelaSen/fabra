"use client";

import { Briefcase, Check, CheckCircle2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DeleteButton,
  EditButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { IconLabelBadge } from "@/components/shared/icon-label-badge";
import { LabelBadge, LABEL_BADGE_TONES } from "@/components/shared/label-badge";
import { BasicPanel } from "@/components/shared/basic-panel";
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
    <BasicPanel as="section" className="p-5 animate-fade-in">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 line-clamp-2">
            {question.question}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {question.answer ? (
              <LabelBadge tone={LABEL_BADGE_TONES.SUCCESS} size="md" icon={CheckCircle2}  >
                {t("answered")}
              </LabelBadge>
            ) : (
              <LabelBadge tone={LABEL_BADGE_TONES.WARNING} size="md" >
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
            <IconTextButton
              type="button"
              onClick={onSaveAndView}
              icon={Check}
              tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
              strong
            >
              {t("actions.viewMode")}
            </IconTextButton>
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
    </BasicPanel>
  );
}
