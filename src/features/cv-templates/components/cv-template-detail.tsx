"use client";

import { useTranslations } from "next-intl";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import type { ApplyCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/apply/responses";
import type { CVTemplateDefinition, CVTemplateLocale } from "@/lib/cv-templates";
import type { CVDocumentListItem } from "@/features/cv-library";
import CVProfileStructureCopyPasteModal from "./cv-profile-structure-copy-paste-modal";
import CVTemplatePreview from "./cv-template-preview";
import { CVTemplateCvSelector } from "./cv-template-cv-selector";
import { CVTemplateLanguageSelector } from "./cv-template-language-selector";
import { CVTemplateApiKeyAlert } from "./cv-template-api-key-alert";

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
              
              <CVTemplateCvSelector
                cvs={cvs}
                filteredCvs={filteredCvs}
                selectedCvId={selectedCvId}
                searchQuery={searchQuery}
                onSelectCv={onSelectCv}
                onSearchChange={onSearchChange}
                onOpenUpload={onOpenUpload}
              />
            </div>

            <CVTemplateLanguageSelector
              locale={locale}
              onLocaleChange={onLocaleChange}
            />

            <CVTemplateApiKeyAlert
              hasAIApiKey={hasAIApiKey}
              selectedCvId={selectedCvId}
              onOpenSettings={onOpenSettings}
            />

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
