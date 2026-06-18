"use client";

import { useTranslations } from "next-intl";
import { Check, FileText, Plus, Search } from "lucide-react";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import type { CVDocumentListItem } from "@/features/cv-library";

interface CVTemplateCvSelectorProps {
  cvs: CVDocumentListItem[];
  filteredCvs: CVDocumentListItem[];
  selectedCvId: string;
  searchQuery: string;
  onSelectCv: (cvId: string) => void;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
}

export function CVTemplateCvSelector({
  cvs,
  filteredCvs,
  selectedCvId,
  searchQuery,
  onSelectCv,
  onSearchChange,
  onOpenUpload,
}: CVTemplateCvSelectorProps) {
  const t = useTranslations("analysisFlow.templates");

  return (
    <div>
      <label className="mb-4 block text-sm font-medium text-text-soft">
        {t("chooseSourceCv")}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder={t("searchCv")}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-line/10 bg-panel/5 pl-9 pr-4 text-sm text-text-main placeholder:text-text-faint focus:border-action-border/50 focus:outline-none transition-colors"
        />
      </div>

      <div className="mt-4 max-h-[240px] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {filteredCvs.length > 0 ? (
          filteredCvs.map((cv) => (
            <button
              key={cv.id}
              onClick={() => onSelectCv(cv.id)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                selectedCvId === cv.id
                  ? "border-action-border/50 bg-action/10 text-action-text"
                  : "border-line/5 bg-panel/[0.02] text-text-muted hover:border-line/20 hover:bg-panel/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 mr-2">
                <FileText
                  className={`h-4 w-4 shrink-0 ${selectedCvId === cv.id ? "text-action-text" : "text-text-muted"}`}
                />
                <span className="text-sm font-medium truncate">
                  {cv.name}
                </span>
              </div>
              {selectedCvId === cv.id && (
                <Check className="h-4 w-4 shrink-0" />
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-line/10">
            <p className="text-sm text-text-muted">
              {cvs.length === 0 ? t("noCvs") : t("noCvs")}
            </p>
            <IconTextButton
              icon={Plus}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
              className="mt-2"
              onClick={onOpenUpload}
            >
              {t("uploadFirstCv")}
            </IconTextButton>
          </div>
        )}
      </div>
    </div>
  );
}
