"use client";

import { useTranslations } from "next-intl";
import { Filter, Search } from "lucide-react";
import type { ProcessingEventStatus } from "@/app/api/admin/processing-events/responses";

const STATUS_OPTIONS = ["", "started", "success", "warning", "error"];
const STAGE_OPTIONS = [
  "",
  "cv_upload",
  "cv_text_extraction",
  "pdf_parser",
  "pdf_extraction",
  "storage_upload",
  "analysis_preflight",
  "ai_analysis",
  "ai_response_parse",
  "analysis_persist",
  "analysis_request",
];

interface ObservabilityFiltersProps {
  filters: { status: ProcessingEventStatus | ""; stage: string };
  onStatusChange: (status: ProcessingEventStatus | "") => void;
  onStageChange: (stage: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function ObservabilityFilters({
  filters,
  onStatusChange,
  onStageChange,
  query,
  onQueryChange,
}: ObservabilityFiltersProps) {
  const t = useTranslations("admin");

  return (
    <div className="shrink-0 border-b border-white/[0.06] p-3">
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <label className="relative block">
          <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <select
            value={filters.status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as ProcessingEventStatus | "",
              )
            }
            className="h-9 w-full appearance-none rounded-lg border border-white/[0.06] bg-[#0d0d14] pl-9 pr-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {option || t("all")}
              </option>
            ))}
          </select>
        </label>
        <select
          value={filters.stage}
          onChange={(event) => onStageChange(event.target.value)}
          className="h-9 rounded-lg border border-white/[0.06] bg-[#0d0d14] px-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50"
        >
          {STAGE_OPTIONS.map((option) => (
            <option key={option || "all"} value={option}>
              {option || t("allStages")}
            </option>
          ))}
        </select>
      </div>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-9 w-full rounded-lg border border-white/[0.06] bg-[#0d0d14] pl-9 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/50"
        />
      </label>
    </div>
  );
}
