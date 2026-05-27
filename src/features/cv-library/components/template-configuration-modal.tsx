"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, FileText, KeyRound, Plus, Search, X } from "lucide-react";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { Button } from "@/components/ui/button";
import type { ApplyCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/apply/responses";
import type { CVTemplateDefinition, CVTemplateLocale } from "@/lib/cv-templates";
import type { CVDocumentListItem } from "../api/cv-library-api";
import CVProfileStructureCopyPasteModal from "./cv-profile-structure-copy-paste-modal";

interface TemplateConfigurationModalProps {
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
  onClose: () => void;
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

export default function TemplateConfigurationModal({
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
  onClose,
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
}: TemplateConfigurationModalProps) {
  const t = useTranslations("analysisFlow.templates");

  return (
    <AnimatePresence>
      {template && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a12] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/5 text-zinc-400"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {t("configureVersion")}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {t("connectWithCv", { template: template.name })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/5 text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-8 md:grid-cols-2 items-start">
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
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="mt-4 max-h-[300px] space-y-2 overflow-y-auto pr-2">
                    {filteredCvs.length > 0 ? (
                      filteredCvs.map((cv) => (
                        <button
                          key={cv.id}
                          onClick={() => onSelectCv(cv.id)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                            selectedCvId === cv.id
                              ? "border-teal-500/50 bg-teal-500/10 text-teal-300"
                              : "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 mr-2">
                            <FileText
                              className={`h-4 w-4 shrink-0 ${selectedCvId === cv.id ? "text-teal-400" : "text-zinc-500"}`}
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
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm text-zinc-500">
                          {cvs.length === 0 ? t("noCvs") : t("noCvs")}
                        </p>
                        <Button
                          variant="link"
                          className="mt-2 text-teal-400"
                          onClick={onOpenUpload}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t("uploadFirstCv")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
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
                              ? "border-teal-500/50 bg-teal-500/10 text-teal-300"
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
            </div>
          </motion.div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
