"use client";

import { FormattedDate } from "@/components/shared/formatted-date";
import { featureListItemClassName } from "@/components/shared/feature-visual-system";
import { cn } from "@/lib/utils";
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import { JobMatchAnalysisScoreBadge } from "./job-match-analysis-score-badge";
import { JobMatchAnalysisStatusBadge } from "./job-match-analysis-status-badge";

interface JobMatchAnalysisListItemProps {
  analysis: JobMatchAnalysisSummary;
  selected: boolean;
  onSelect: () => void;
}

export function JobMatchAnalysisListItem({
  analysis,
  selected,
  onSelect,
}: JobMatchAnalysisListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={featureListItemClassName(selected, "flex items-start gap-3")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-action-text">
            {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
          </p>
          <JobMatchAnalysisScoreBadge score={analysis.aiScore} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <FormattedDate value={analysis.createdAt} />
          {analysis.offerStatus && (
            <JobMatchAnalysisStatusBadge status={analysis.offerStatus} />
          )}
        </div>
      </div>

    </div>
  );
}
