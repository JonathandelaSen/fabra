"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormattedDate } from "@/frontend/components/shared/formatted-date";
import type { CVDocumentListItem } from "../../api/cv-library-api";

interface CVLibraryTemplateVersionsProps {
  templateVersions: CVDocumentListItem[];
  onOpenEditor: (cvId: string) => void;
}

export function CVLibraryTemplateVersions({
  templateVersions,
  onOpenEditor,
}: CVLibraryTemplateVersionsProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (templateVersions.length <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-line/[0.06] p-4 text-center text-xs text-text-muted">
        {t("noTemplateVersions")}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {templateVersions.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onOpenEditor(template.id)}
          className="group flex min-w-0 items-center gap-3 rounded-lg border border-accent-teal-border bg-accent-teal/[0.02] p-2.5 text-left hover:border-accent-teal-border hover:bg-accent-teal/[0.05] transition-all focus:outline-none"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-control/60 text-text-muted group-hover:bg-accent-teal/10 group-hover:text-accent-teal-text transition-colors">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-text-soft group-hover:text-text-main">
              {template.name}
            </span>
            <FormattedDate
              value={template.createdAt}
              className="mt-0.5 text-[10px]"
              iconClassName="h-2.5 w-2.5"
            />
          </span>
        </button>
      ))}
    </div>
  );
}
