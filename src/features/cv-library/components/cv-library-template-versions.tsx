"use client";

import { Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CVDocumentListItem } from "../api/cv-library-api";

interface CVLibraryTemplateVersionsProps {
  templateVersions: CVDocumentListItem[];
  onOpenEditor: (cvId: string) => void;
  formatDate: (dateStr: string) => string;
}

export function CVLibraryTemplateVersions({
  templateVersions,
  onOpenEditor,
  formatDate,
}: CVLibraryTemplateVersionsProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (templateVersions.length <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-xs text-zinc-500">
        {t("noTemplateVersions")}
      </div>
    );
  }

  return (
    <div className="grid gap-2 max-h-36 overflow-y-auto pr-1 sm:grid-cols-2">
      {templateVersions.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onOpenEditor(template.id)}
          className="group flex min-w-0 items-center gap-3 rounded-lg border border-teal-500/10 bg-teal-500/[0.02] p-2.5 text-left hover:border-teal-500/20 hover:bg-teal-500/[0.05] transition-all focus:outline-none"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-500 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-zinc-200 group-hover:text-zinc-100">
              {template.name}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
              <Clock className="h-2.5 w-2.5" />
              {formatDate(template.createdAt)}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
