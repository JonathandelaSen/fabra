"use client";

import { MessageSquareQuote } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { Select } from "@/components/ui/select";
import type { InterviewQuestion } from "../api/interview-questions-api";
import type {
  InterviewQuestionAnsweredFilter,
  InterviewQuestionsFilters,
} from "../hooks/use-interview-questions-route-state";
import { InterviewQuestionListItem } from "./interview-question-list-item";
import type {
  InterviewQuestionAnalysisOption,
  InterviewQuestionCVOption,
} from "./interview-questions-types";

interface InterviewQuestionsSidebarProps {
  questions: InterviewQuestion[];
  selectedId: string | null;
  filters: InterviewQuestionsFilters;
  cvs: InterviewQuestionCVOption[];
  analyses: InterviewQuestionAnalysisOption[];
  onSelect: (id: string) => void;
  onFiltersChange: (filters: Partial<InterviewQuestionsFilters>) => void;
}

export function InterviewQuestionsSidebar({
  questions,
  selectedId,
  filters,
  cvs,
  analyses,
  onSelect,
  onFiltersChange,
}: InterviewQuestionsSidebarProps) {
  const t = useTranslations("interviewQuestions");

  const filterHeader = (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={filters.cvId ?? ""}
          onChange={(event) =>
            onFiltersChange({ cvId: event.target.value || null })
          }
          className="text-xs"
        >
          <option value="" className="bg-[#1a1a24] text-zinc-100">{t("allCvs")}</option>
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id} className="bg-[#1a1a24] text-zinc-100">
              {cv.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.analysisId ?? ""}
          onChange={(event) =>
            onFiltersChange({ analysisId: event.target.value || null })
          }
          className="text-xs"
        >
          <option value="" className="bg-[#1a1a24] text-zinc-100">{t("allOffers")}</option>
          {analyses.map((analysis) => (
            <option key={analysis.id} value={analysis.id} className="bg-[#1a1a24] text-zinc-100">
              {analysis.title}
            </option>
          ))}
        </Select>
      </div>
      <Select
        value={filters.answered}
        onChange={(event) =>
          onFiltersChange({
            answered: event.target.value as InterviewQuestionAnsweredFilter,
          })
        }
        className="text-xs"
      >
        <option value="all" className="bg-[#1a1a24] text-zinc-100">{t("all")}</option>
        <option value="answered" className="bg-[#1a1a24] text-zinc-100">{t("answeredFilter")}</option>
        <option value="empty" className="bg-[#1a1a24] text-zinc-100">{t("pendingFilter")}</option>
      </Select>
    </div>
  );

  return (
    <FeatureSidebarPanel header={filterHeader}>
      {questions.length === 0 ? (
        <div className="px-4 py-12 text-center text-xs text-text-faint">
          {t("emptyFiltered")}
        </div>
      ) : (
        questions.map((question) => (
          <InterviewQuestionListItem
            key={question.id}
            question={question}
            isSelected={selectedId === question.id}
            onSelect={() => onSelect(question.id)}
          />
        ))
      )}
    </FeatureSidebarPanel>
  );
}

