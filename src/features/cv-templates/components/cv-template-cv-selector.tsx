"use client";

import { useTranslations } from "next-intl";
import { Check, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <label className="mb-4 block text-sm font-medium text-zinc-300">
        {t("chooseSourceCv")}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder={t("searchCv")}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none transition-colors"
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
                  ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                  : "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 mr-2">
                <FileText
                  className={`h-4 w-4 shrink-0 ${selectedCvId === cv.id ? "text-indigo-400" : "text-zinc-500"}`}
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
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-white/10">
            <p className="text-sm text-zinc-500">
              {cvs.length === 0 ? t("noCvs") : t("noCvs")}
            </p>
            <Button
              variant="link"
              className="mt-2 text-indigo-400 hover:text-indigo-300"
              onClick={onOpenUpload}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("uploadFirstCv")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
