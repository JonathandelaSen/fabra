"use client";

import { Briefcase, CheckCircle2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { featureMetaPillClassName } from "@/components/shared/feature-visual-system";
import { SidebarListItem } from "@/components/shared/sidebar-list-item";
import { StatusBadge } from "@/components/shared/status-badge";
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
            <StatusBadge label={t("answered")} color="emerald" icon={CheckCircle2} />
          ) : (
            <StatusBadge label={t("pending")} color="amber" />
          )}
          {question.cv && (
            <span className={`inline-flex items-center gap-1 text-[11px] ${featureMetaPillClassName}`}>
              <FileText className="h-3 w-3 text-text-faint" />
              <span className="truncate max-w-[80px]">{question.cv.name}</span>
            </span>
          )}
          {question.analysis && (
            <span className={`inline-flex items-center gap-1 text-[11px] ${featureMetaPillClassName}`}>
              <Briefcase className="h-3 w-3 text-text-faint" />
              <span className="truncate max-w-[80px]">{t("offer")}</span>
            </span>
          )}
        </div>
      }
    />
  );
}
