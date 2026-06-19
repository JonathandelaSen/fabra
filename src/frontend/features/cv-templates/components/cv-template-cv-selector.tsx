"use client";

import { useTranslations } from "next-intl";
import { Check, FileText, Plus } from "lucide-react";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";
import type { CVDocumentListItem } from "@/frontend/features/cv-library";

interface CVTemplateCvSelectorProps {
  cvs: CVDocumentListItem[];
  selectedCvId: string;
  onSelectCv: (cvId: string) => void;
  onOpenUpload: () => void;
}

export function CVTemplateCvSelector({
  cvs,
  selectedCvId,
  onSelectCv,
  onOpenUpload,
}: CVTemplateCvSelectorProps) {
  const t = useTranslations("analysisFlow.templates");

  return (
    <div>
      <label className="mb-4 block text-sm font-medium text-text-soft">
        {t("chooseSourceCv")}
      </label>

      <div className="max-h-[240px] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {cvs.length > 0 ? (
          cvs.map((cv) => (
            <button
              key={cv.id}
              onClick={() => onSelectCv(cv.id)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                selectedCvId === cv.id
                  ? "border-template-language-border bg-template-language-soft text-template-language-text"
                  : "border-line bg-panel-subtle text-text-muted hover:border-line-default hover:bg-panel-hover"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 mr-2">
                <FileText
                  className={`h-4 w-4 shrink-0 ${selectedCvId === cv.id ? "text-template-language-text" : "text-text-muted"}`}
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
