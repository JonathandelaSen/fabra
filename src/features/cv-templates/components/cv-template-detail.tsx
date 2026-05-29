"use client";

import { useTranslations } from "next-intl";
import { Check, FileText, KeyRound, Plus, Search } from "lucide-react";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { Button } from "@/components/ui/button";
import type { ApplyCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/apply/responses";
import type { CVTemplateDefinition, CVTemplateLocale } from "@/lib/cv-templates";
import type { CVDocumentListItem } from "@/features/cv-library";
import CVProfileStructureCopyPasteModal from "./cv-profile-structure-copy-paste-modal";
import CVTemplatePreview from "./cv-template-preview";

interface CVTemplateDetailProps {
  template: CVTemplateDefinition | null;
  cvs: CVDocumentListItem[];
  filteredCvs: CVDocumentListItem[];
  selectedCvId: string;
  locale: CVTemplateLocale;
  searchQuery: string;
  hasAIApiKey: boolean;
  selectedModel: string;
  models: { id: string; label: string }[];
  creating: boolean;
  copyPasteOpen: boolean;
  error: string | null;
  onSelectCv: (cvId: string) => void;
  onLocaleChange: (locale: CVTemplateLocale) => void;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onModelChange: (model: string) => void;
  onCreateVersion: () => void;
  onOpenCopyPaste: () => void;
  onCloseCopyPaste: () => void;
  onApplied: (result: ApplyCVProfileCopyPasteResponse) => void;
}

export function CVTemplateDetail({
  template,
  cvs,
  filteredCvs,
  selectedCvId,
  locale,
  searchQuery,
  hasAIApiKey,
  selectedModel,
  models,
  creating,
  copyPasteOpen,
  error,
  onSelectCv,
  onLocaleChange,
  onSearchChange,
  onOpenUpload,
  onOpenSettings,
  onModelChange,
  onCreateVersion,
  onOpenCopyPaste,
  onCloseCopyPaste,
  onApplied,
}: CVTemplateDetailProps) {
  const t = useTranslations("analysisFlow.templates");

  if (!template) {
    return (
      <section className="min-h-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex h-full min-h-[520px] items-center justify-center text-sm text-zinc-500">
          {t("title")}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-0 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
      <div className="flex flex-col h-full min-h-[620px]">
        <div className="flex items-center justify-between border-b border-white/5 p-6 bg-[#09090f]">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {template.name}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {template.description}
            </p>
          </div>
        </div>

        {error && (
          <div className="m-6 mb-0 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="p-6 grid gap-8 xl:grid-cols-2 items-start flex-1">
          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6 flex items-center justify-center">
            <svg
              className="w-full h-auto max-w-full rounded-sm shadow-2xl"
              viewBox="0 0 794 1123"
              preserveAspectRatio="xMidYMid meet"
            >
              <foreignObject width="794" height="1123">
                <div className="w-[794px] h-[1123px] bg-white overflow-hidden">
                  <CVTemplatePreview
                    profile={template.fixtureProfile}
                    templateId={template.templateId}
                    locale={locale}
                  />
                </div>
              </foreignObject>
            </svg>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-6">
                {t("configureVersion")}
              </h3>
              
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

            <div>
              <label className="mb-4 block text-sm font-medium text-zinc-300">
                {t("outputLanguage")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["es", "en"] as const).map((language) => (
                  <button
                    key={language}
                    onClick={() => onLocaleChange(language)}
                    className={`flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                      locale === language
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                        : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {language === "es" ? t("spanish") : t("english")}
                  </button>
                ))}
              </div>
            </div>

            {!hasAIApiKey && selectedCvId && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex gap-3">
                  <KeyRound className="h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-xs leading-relaxed text-amber-200">
                      {t("missingApiKey")}
                    </p>
                    <Button
                      variant="link"
                      className="h-auto p-0 mt-2 text-xs font-bold text-amber-400 hover:text-amber-300"
                      onClick={onOpenSettings}
                    >
                      {t("configureNow")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <AIActionLauncher
                actionLabel={t("createVersion")}
                loading={creating}
                disabled={!selectedCvId}
                integrated={{
                  available: hasAIApiKey,
                  selectedModelId: selectedModel,
                  models,
                  onModelChange,
                  onRun: onCreateVersion,
                  onConfigure: onOpenSettings,
                }}
                copyPaste={{
                  available: true,
                  onOpenFlow: onOpenCopyPaste,
                }}
              />
            </div>
          </div>
        </div>

        {selectedCvId && (
          <CVProfileStructureCopyPasteModal
            cvId={selectedCvId}
            templateId={template.templateId}
            locale={locale}
            open={copyPasteOpen}
            onClose={onCloseCopyPaste}
            onApplied={onApplied}
          />
        )}
      </div>
    </section>
  );
}
