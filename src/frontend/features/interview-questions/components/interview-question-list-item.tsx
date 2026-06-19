"use client";

import { Briefcase, CheckCircle2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { SidebarListItem } from "@/frontend/components/shared/sidebar-list-item";
import { IconLabelBadge } from "@/frontend/components/shared/icon-label-badge";
import { LabelBadge, LABEL_BADGE_TONES } from "@/frontend/components/shared/label-badge";
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
    <SidebarListItem
      title={question.question}
      selected={isSelected}
      onClick={onSelect}
      titleClamp={2}
      footer={
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {question.answer ? (
            <LabelBadge tone={LABEL_BADGE_TONES.SUCCESS} size="xs" icon={CheckCircle2} >
              {t("answered")}
            </LabelBadge>
          ) : (
            <LabelBadge tone={LABEL_BADGE_TONES.WARNING} size="xs" >
              {t("pending")}
            </LabelBadge>
          )}
          {question.cv && (
            <IconLabelBadge
              icon={FileText}
              size="xs"
              text={question.cv.name}
            />
          )}
          {question.analysis && (
            <IconLabelBadge
              icon={Briefcase}
              size="xs"
              text={question.analysis.title}
            />
          )}
        </div>
      }
    />
  );
}
