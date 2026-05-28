"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Loader2, PenLine, Sparkles } from "lucide-react";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import { type AIModelOption } from "@/components/shared/ai-action-launcher/ai-action-launcher";
import { ManualEditor } from "./cv-manual-editor/manual-editor";
import CVEditorCopyPasteModal from "./cv-editor-copy-paste-modal";
import { CVEditorEmptyState } from "./cv-editor-empty-state";
import { CVEditorHeader } from "./cv-editor-header";
import { CVEditorAIPanel } from "./cv-editor-ai-panel";
import { CVEditorRecommendations } from "./cv-editor-recommendations";
import { CVEditorPublicSection } from "./cv-editor-public-section";
import { CVEditorSettingsSection } from "./cv-editor-settings-section";
import { CVEditorPublicModal } from "./cv-editor-public-modal";
import { CVEditorSaveModal } from "./cv-editor-save-modal";
import { useCVEditorMutations } from "../hooks/use-cv-editor-mutations";
import { useCVEditorState } from "../hooks/use-cv-editor-state";

const PDFPreview = dynamic(
  () => import("@/components/shared/pdf-preview").then((mod) => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  },
);

interface CVEditorViewProps {
  activeVersionId: string | null;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onStartAnalysis: () => void;
  onBackToLibrary?: () => void;
}

const AI_MODELS: AIModelOption[] = [
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
  { id: "gemini-3.1-flash-preview", label: "Gemini 3.1 Flash Preview" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

export default function CVEditorView({
  activeVersionId,
  onOpenTemplates,
  onOpenSettings,
  onStartAnalysis,
  onBackToLibrary,
}: CVEditorViewProps) {
  const t = useTranslations("cvEditor");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [publicCopied, setPublicCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<"ai" | "manual">("ai");
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);

  const editorState = useCVEditorState(activeVersionId);
  const {
    templateCvs,
    aiProvider,
    aiApiKey,
    hasAIApiKey,
    currentVersion,
    activeTemplate,
    locale,
    currentProfile,
    previewSrc,
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    error,
    setError,
    selectedModel,
    setSelectedModel,
    setEditedVersion,
    setManuallySelectedVersionId,
    setProfile,
    saveProfileToApi,
    reloadPreview,
    recommendationAnalysis,
    handleManualChange,
    publicSlug,
    normalizedPublicSlug,
    publicUrl,
    publicDraftUrl,
    hasPublicSlugChanges,
    setPublicSlugDraft,
    savedProfileJsonRef,
  } = editorState;

  const {
    editInstruction,
    setEditInstruction,
    editingProfile,
    savingAsCv,
    savingLocale,
    savingPublicSettings,
    applyInstruction,
    handleCopyPasteApplied,
    saveAsCV,
    updateLocale,
    updatePublicSettings,
  } = useCVEditorMutations({
    currentVersionId: currentVersion?.id ?? null,
    currentProfile,
    normalizedPublicSlug,
    aiProvider,
    aiApiKey,
    selectedModel,
    hasAIApiKey,
    savedProfileJsonRef,
    setEditedVersion,
    setProfile,
    saveProfileToApi,
    reloadPreview,
    setError,
    setPublicSlugDraft,
  });

  const handleSaveAsCV = async () => {
    const saved = await saveAsCV(saveName);
    if (saved) setIsSavingModalOpen(false);
  };

  const handleUpdatePublicSettings = async (
    enabled: boolean,
    confirmPublicExposure = false,
  ) => {
    const saved = await updatePublicSettings(enabled, confirmPublicExposure);
    if (saved) setIsPublicModalOpen(false);
  };

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setPublicCopied(true);
    setTimeout(() => setPublicCopied(false), 1800);
  };

  if (!currentVersion || !activeTemplate) {
    return (
      <CVEditorEmptyState
        templateCvs={templateCvs}
        setManuallySelectedVersionId={setManuallySelectedVersionId}
        onOpenTemplates={onOpenTemplates}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#050509]">
      <CVEditorHeader
        versionName={currentVersion.name}
        versionId={currentVersion.id}
        templateName={activeTemplate.name}
        locale={locale}
        canUndo={canUndo}
        canRedo={canRedo}
        isPanelOpen={isPanelOpen}
        onUndo={undo}
        onRedo={redo}
        onSaveNewVersion={() => {
          setSaveName(t("editedName", { name: currentVersion.name }));
          setIsSavingModalOpen(true);
        }}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        onBackToLibrary={onBackToLibrary}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-auto bg-[#050509] scrollbar-thin">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {currentProfile ? (
            <PDFPreview url={previewSrc} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isPanelOpen && (
            <motion.aside
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-30 w-[480px] border-l border-white/5 bg-[#0a0a12]/95 backdrop-blur-xl md:relative"
            >
              <div className="flex h-full flex-col overflow-y-auto p-6 scrollbar-thin">
                <div className="space-y-8">
                  <div className="flex gap-1 rounded-xl border border-white/5 p-1 bg-white/5">
                    <button
                      onClick={() => setEditorTab("ai")}
                      className={`flex items-center gap-1.5 flex-1 justify-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${editorTab === "ai" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      IA
                    </button>
                    <button
                      onClick={() => setEditorTab("manual")}
                      className={`flex items-center gap-1.5 flex-1 justify-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${editorTab === "manual" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Manual
                    </button>
                  </div>

                  {editorTab === "manual" && currentProfile && (
                    <ManualEditor
                      profile={currentProfile}
                      templateId={activeTemplate.templateId}
                      locale={locale}
                      saveState={saveState}
                      onChange={handleManualChange}
                      onSave={() => void saveProfileToApi(currentProfile)}
                    />
                  )}

                  {editorTab === "ai" && (
                    <CVEditorAIPanel
                      editInstruction={editInstruction}
                      setEditInstruction={setEditInstruction}
                      editingProfile={editingProfile}
                      hasAIApiKey={hasAIApiKey}
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                      aiModels={AI_MODELS}
                      error={error}
                      onApplyInstruction={() => applyInstruction()}
                      onOpenCopyPaste={() => setCopyPasteOpen(true)}
                      onOpenSettings={onOpenSettings}
                    />
                  )}

                  <CVEditorRecommendations
                    recommendationAnalysis={recommendationAnalysis}
                    onStartAnalysis={onStartAnalysis}
                  />

                  <CVEditorPublicSection
                    publicEnabled={currentVersion.publicEnabled}
                    publicId={currentVersion.publicId}
                    publicSlug={publicSlug}
                    normalizedPublicSlug={normalizedPublicSlug}
                    publicUrl={publicUrl}
                    hasPublicSlugChanges={hasPublicSlugChanges}
                    publicCopied={publicCopied}
                    savingPublicSettings={savingPublicSettings}
                    cvId={currentVersion.id}
                    onSetPublicSlugDraft={setPublicSlugDraft}
                    onPublish={() => setIsPublicModalOpen(true)}
                    onUnpublish={() => void handleUpdatePublicSettings(false)}
                    onSaveUrl={() => void handleUpdatePublicSettings(true)}
                    onCopyPublicUrl={() => void copyPublicUrl()}
                  />

                  <CVEditorSettingsSection
                    locale={locale}
                    savingLocale={savingLocale}
                    onUpdateLocale={updateLocale}
                    onOpenTemplates={onOpenTemplates}
                  />

                  {!hasAIApiKey && (
                    <IconTextButton
                      icon={KeyRound}
                      tone={ICON_TEXT_BUTTON_TONES.WARNING}
                      onClick={onOpenSettings}
                      className="w-full"
                    >
                      {t("settings.configureApiKey")}
                    </IconTextButton>
                  )}
                </div>

                <div className="mt-auto pt-10">
                  <p className="text-[10px] text-zinc-600 leading-relaxed">
                    {t("derivedNotice")}
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isPublicModalOpen && (
          <CVEditorPublicModal
            publicDraftUrl={publicDraftUrl}
            normalizedPublicSlug={normalizedPublicSlug}
            savingPublicSettings={savingPublicSettings}
            onClose={() => setIsPublicModalOpen(false)}
            onConfirm={() => void handleUpdatePublicSettings(true, true)}
          />
        )}

        {isSavingModalOpen && (
          <CVEditorSaveModal
            saveName={saveName}
            setSaveName={setSaveName}
            savingAsCv={savingAsCv}
            onClose={() => setIsSavingModalOpen(false)}
            onSave={handleSaveAsCV}
          />
        )}
      </AnimatePresence>

      {currentVersion && (
        <CVEditorCopyPasteModal
          cvId={currentVersion.id}
          instruction={editInstruction}
          open={copyPasteOpen}
          onClose={() => setCopyPasteOpen(false)}
          onApplied={(result) => {
            handleCopyPasteApplied(result);
            setCopyPasteOpen(false);
          }}
        />
      )}
    </div>
  );
}
