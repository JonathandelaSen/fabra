"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type AIModelOption } from "@/components/shared/ai-action-launcher/ai-action-launcher";
import { GEMINI_MODELS } from "@/frontend/ai-models";
import { CVEditorEmptyState } from "./cv-editor-empty-state";
import { CVEditorHeader } from "./cv-editor-header";
import { CVEditorModals } from "./cv-editor-modals";
import { CVEditorSidePanel } from "./cv-editor-side-panel";
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

interface CVEditorViewProps { activeVersionId: string | null; onOpenTemplates: () => void; onOpenSettings: () => void; onStartAnalysis: () => void; onOpenVersion: (cvId: string) => void; onBackToLibrary?: () => void; }

const AI_MODELS: AIModelOption[] = [
  { id: "gemini-3.1-pro-preview", label: GEMINI_MODELS["gemini-3.1-pro-preview"] },
  { id: "gemini-3.1-flash-preview", label: GEMINI_MODELS["gemini-3.1-flash-preview"] },
  { id: "gemini-2.5-pro", label: GEMINI_MODELS["gemini-2.5-pro"] },
  { id: "gemini-2.5-flash", label: GEMINI_MODELS["gemini-2.5-flash"] },
];

export default function CVEditorView({
  activeVersionId,
  onOpenTemplates,
  onOpenSettings,
  onStartAnalysis,
  onOpenVersion,
  onBackToLibrary,
}: CVEditorViewProps) {
  const t = useTranslations("cvEditor");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [modalState, setModalState] = useState({ saving: false, public: false });
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
    setProfile,
    saveProfileToApi,
    reloadPreview,
    recommendationAnalysis,
    handleManualChange,
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
    if (saved) setModalState((current) => ({ ...current, saving: false }));
  };

  const handleUpdatePublicSettings = async (enabled: boolean, confirmPublicExposure = false) => {
    const saved = await updatePublicSettings(enabled, confirmPublicExposure);
    if (saved) setModalState((current) => ({ ...current, public: false }));
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
        onSelectVersion={onOpenVersion}
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
          setModalState((current) => ({ ...current, saving: true }));
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
            <CVEditorSidePanel
              activeTemplateId={activeTemplate.templateId}
              currentProfile={currentProfile}
              currentVersion={currentVersion}
              editInstruction={editInstruction}
              editingProfile={editingProfile}
              editorTab={editorTab}
              error={error}
              hasAIApiKey={hasAIApiKey}
              hasPublicSlugChanges={hasPublicSlugChanges}
              locale={locale}
              publicCopied={publicCopied}
              publicSlug={normalizedPublicSlug}
              publicUrl={publicUrl}
              recommendationAnalysis={recommendationAnalysis}
              saveState={saveState}
              savingLocale={savingLocale}
              savingPublicSettings={savingPublicSettings}
              selectedModel={selectedModel}
              aiModels={AI_MODELS}
              onApplyInstruction={() => applyInstruction()}
              onCopyPublicUrl={() => void copyPublicUrl()}
              onManualChange={handleManualChange}
              onOpenCopyPaste={() => setCopyPasteOpen(true)}
              onOpenSettings={onOpenSettings}
              onOpenTemplates={onOpenTemplates}
              onPublish={() => setModalState((current) => ({ ...current, public: true }))}
              onSaveManual={() => void saveProfileToApi(currentProfile)}
              onSaveUrl={() => void handleUpdatePublicSettings(true)}
              onSetEditInstruction={setEditInstruction}
              onSetEditorTab={setEditorTab}
              onSetPublicSlugDraft={setPublicSlugDraft}
              onSetSelectedModel={setSelectedModel}
              onStartAnalysis={onStartAnalysis}
              onUnpublish={() => void handleUpdatePublicSettings(false)}
              onUpdateLocale={updateLocale}
            />
          )}
        </AnimatePresence>
      </div>

      <CVEditorModals
        copyPasteOpen={copyPasteOpen}
        currentVersionId={currentVersion.id}
        editInstruction={editInstruction}
        isPublicModalOpen={modalState.public}
        isSavingModalOpen={modalState.saving}
        normalizedPublicSlug={normalizedPublicSlug}
        publicDraftUrl={publicDraftUrl}
        saveName={saveName}
        savingAsCv={savingAsCv}
        savingPublicSettings={savingPublicSettings}
        onApplyCopyPaste={(result) => {
          handleCopyPasteApplied(result);
          setCopyPasteOpen(false);
        }}
        onCloseCopyPaste={() => setCopyPasteOpen(false)}
        onClosePublicModal={() => setModalState((current) => ({ ...current, public: false }))}
        onCloseSavingModal={() => setModalState((current) => ({ ...current, saving: false }))}
        onConfirmPublic={() => void handleUpdatePublicSettings(true, true)}
        onSave={handleSaveAsCV}
        onSaveNameChange={setSaveName}
      />
    </div>
  );
}
