"use client";

import { motion } from "framer-motion";
import { KeyRound, PenLine, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { StandardCVProfile } from "@/lib/cv-profile";
import type { CVTemplateId, CVTemplateLocale } from "@/lib/cv-templates";
import { ManualEditor } from "./cv-manual-editor/manual-editor";
import { CVEditorAIPanel } from "./cv-editor-ai-panel";
import { CVEditorRecommendations, type RecommendationAnalysis } from "./cv-editor-recommendations";
import { CVEditorPublicSection } from "./cv-editor-public-section";
import { CVEditorSettingsSection } from "./cv-editor-settings-section";

interface CVEditorSidePanelProps {
  activeTemplateId: CVTemplateId;
  currentProfile: StandardCVProfile | null;
  currentVersion: { id: string; publicEnabled: boolean; publicId: string | null };
  editInstruction: string;
  editingProfile: boolean;
  editorTab: "ai" | "manual";
  error: string | null;
  hasAIApiKey: boolean;
  hasPublicSlugChanges: boolean;
  locale: CVTemplateLocale;
  publicCopied: boolean;
  publicSlug: string;
  publicUrl: string | null;
  recommendationAnalysis: RecommendationAnalysis | null;
  saveState: "idle" | "saving" | "saved";
  savingLocale: boolean;
  savingPublicSettings: boolean;
  selectedProvider: StoredAIProvider;
  selectedModel: string;
  onApplyInstruction: () => void;
  onCopyPublicUrl: () => void;
  onManualChange: (updater: (prev: StandardCVProfile) => StandardCVProfile) => void;
  onOpenCopyPaste: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onPublish: () => void;
  onSaveManual: () => void;
  onSaveUrl: () => void;
  onSetEditInstruction: (value: string) => void;
  onSetEditorTab: (tab: "ai" | "manual") => void;
  onSetPublicSlugDraft: (params: { cvId: string; value: string }) => void;
  onSetSelectedProvider: (value: StoredAIProvider) => void;
  onSetSelectedModel: (value: string) => void;
  onStartAnalysis: () => void;
  onUnpublish: () => void;
  onUpdateLocale: (locale: CVTemplateLocale) => void;
}

export function CVEditorSidePanel({
  activeTemplateId,
  currentProfile,
  currentVersion,
  editInstruction,
  editingProfile,
  editorTab,
  error,
  hasAIApiKey,
  hasPublicSlugChanges,
  locale,
  publicCopied,
  publicSlug,
  publicUrl,
  recommendationAnalysis,
  saveState,
  savingLocale,
  savingPublicSettings,
  selectedProvider,
  selectedModel,
  onApplyInstruction,
  onCopyPublicUrl,
  onManualChange,
  onOpenCopyPaste,
  onOpenSettings,
  onOpenTemplates,
  onPublish,
  onSaveManual,
  onSaveUrl,
  onSetEditInstruction,
  onSetEditorTab,
  onSetPublicSlugDraft,
  onSetSelectedProvider,
  onSetSelectedModel,
  onStartAnalysis,
  onUnpublish,
  onUpdateLocale,
}: CVEditorSidePanelProps) {
  const t = useTranslations("cvEditor");

  return (
    <motion.aside
      initial={{ x: 480 }}
      animate={{ x: 0 }}
      exit={{ x: 480 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 z-30 w-[480px] border-l border-line bg-panel-base/95 backdrop-blur-xl md:relative"
    >
      <div className="flex h-full flex-col overflow-x-hidden overflow-y-auto p-6 scrollbar-thin">
        <div className="space-y-8">
          <div className="flex gap-1 rounded-xl border border-line bg-panel-control p-1">
            <button onClick={() => onSetEditorTab("ai")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${editorTab === "ai" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {t("editorTabs.ai")}
            </button>
            <button onClick={() => onSetEditorTab("manual")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${editorTab === "manual" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              <PenLine className="h-3.5 w-3.5" />
              {t("editorTabs.manual")}
            </button>
          </div>

          {editorTab === "manual" && currentProfile && (
            <ManualEditor profile={currentProfile} templateId={activeTemplateId} locale={locale} saveState={saveState} onChange={onManualChange} onSave={onSaveManual} />
          )}

          {editorTab === "ai" && (
            <CVEditorAIPanel
              editInstruction={editInstruction}
              setEditInstruction={onSetEditInstruction}
              editingProfile={editingProfile}
              hasAIApiKey={hasAIApiKey}
              selectedProvider={selectedProvider}
              setSelectedProvider={onSetSelectedProvider}
              selectedModel={selectedModel}
              setSelectedModel={onSetSelectedModel}
              error={error}
              onApplyInstruction={onApplyInstruction}
              onOpenCopyPaste={onOpenCopyPaste}
              onOpenSettings={onOpenSettings}
            />
          )}

          <CVEditorRecommendations recommendationAnalysis={recommendationAnalysis} onStartAnalysis={onStartAnalysis} />
          <CVEditorPublicSection
            publicEnabled={currentVersion.publicEnabled}
            publicId={currentVersion.publicId}
            publicSlug={publicSlug}
            normalizedPublicSlug={publicSlug}
            publicUrl={publicUrl}
            hasPublicSlugChanges={hasPublicSlugChanges}
            publicCopied={publicCopied}
            savingPublicSettings={savingPublicSettings}
            cvId={currentVersion.id}
            onSetPublicSlugDraft={onSetPublicSlugDraft}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onSaveUrl={onSaveUrl}
            onCopyPublicUrl={onCopyPublicUrl}
          />
          <CVEditorSettingsSection locale={locale} savingLocale={savingLocale} onUpdateLocale={onUpdateLocale} onOpenTemplates={onOpenTemplates} />

          {!hasAIApiKey && (
            <IconTextButton icon={KeyRound} tone={ICON_TEXT_BUTTON_TONES.WARNING} onClick={onOpenSettings} className="w-full">
              {t("settings.configureApiKey")}
            </IconTextButton>
          )}
        </div>

        <div className="mt-auto pt-10">
          <p className="text-[10px] leading-relaxed text-zinc-600">{t("derivedNotice")}</p>
        </div>
      </div>
    </motion.aside>
  );
}
