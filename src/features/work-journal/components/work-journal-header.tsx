"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { WorkJournalContextLegacy as WorkJournalContext } from "../api/work-journal-types";

interface WorkJournalHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  contextFilter: string;
  setContextFilter: (s: string) => void;
  activeContexts: WorkJournalContext[];
}

export function WorkJournalHeader({
  search,
  setSearch,
  contextFilter,
  setContextFilter,
  activeContexts,
}: WorkJournalHeaderProps) {
  const t = useTranslations("workJournal");

  return (
    <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-8 pb-4 border-b border-white/5">
      <div className="relative group">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 transition-colors group-focus-within:text-zinc-300" />
        <input
          placeholder={t("searchPlaceholder")}
          className="pl-7 pr-4 py-2 bg-transparent border-b border-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-white/20 outline-none w-48 transition-all focus:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="h-4 w-px bg-white/10 hidden md:block" />

      <select
        className="bg-transparent text-sm font-medium text-zinc-400 hover:text-zinc-200 border-none focus:ring-0 outline-none cursor-pointer transition-colors"
        value={contextFilter}
        onChange={(e) => setContextFilter(e.target.value)}
      >
        <option value="" className="bg-zinc-900">
          {t("allContexts")}
        </option>
        {activeContexts.map((context) => (
          <option key={`filter-${context.id}`} value={context.id} className="bg-zinc-900">
            {context.name}
          </option>
        ))}
      </select>
    </div>
  );
}
