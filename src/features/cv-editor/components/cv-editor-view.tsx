"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { copyToClipboard } from "@/lib/clipboard";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CVEditorEmptyState } from "./cv-editor-empty-state";
import { CVEditorHeader } from "./cv-editor-header";
import { CVEditorModals } from "./cv-editor-modals";
import { CVEditorSidePanel, type CVEditorSidePanelProps } from "./cv-editor-side-panel";
import { CVTemplateChangeSheet } from "./cv-template-change-sheet";
import { useCVEditorMutations } from "../hooks/use-cv-editor-mutations";
import { useCVEditorRouteState } from "../hooks/use-cv-editor-route-state";
import { useCVEditorState } from "../hooks/use-cv-editor-state";
import type { CVEditorTab } from "../types";
const PDFPreview = dynamic(
  () => import("@/components/shared/pdf-preview").then((mod) => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-panel-elevated text-text-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  },
);

interface CVEditorViewProps { onOpenTemplates: () => void; onOpenSettings: () => void; onStartAnalysis: () => void; onBackToLibrary?: () => void; }

export default function CVEditorView({
  onOpenTemplates,
  onOpenSettings,
  onStartAnalysis,
  onBackToLibrary,
}: CVEditorViewProps) {
  const t = useTranslations("cvEditor");
  const [panelState, setPanelState] = useState({ desktopOpen: true, mobileOpen: false });
  const [modalState, setModalState] = useState({
    saving: false,
    public: false,
    copyPaste: false,
    template: false,
  });
  const [saveName, setSaveName] = useState("");
  const [publicCopied, setPublicCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<CVEditorTab>("ai");
  const routeState = useCVEditorRouteState();

  const editorState = useCVEditorState(routeState.versionId);
  const {
    templateCvs,
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
    selectedProvider,
    setSelectedProvider,
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
    changingTemplate,
    savingPublicSettings,
    applyInstruction,
    handleCopyPasteApplied,
    saveAsCV,
    changeTemplate,
    updateLocale,
    updatePublicSettings,
  } = useCVEditorMutations({
    currentVersionId: currentVersion?.id ?? null,
    currentProfile,
    normalizedPublicSlug,
    aiProvider: selectedProvider,
    aiApiKey,
    selectedModel,
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
    await copyToClipboard(publicUrl);
    setPublicCopied(true);
    setTimeout(() => setPublicCopied(false), 1800);
  };

  if (!currentVersion || !activeTemplate) {
    return (
      <CVEditorEmptyState
        templateCvs={templateCvs}
        onSelectVersion={routeState.selectVersion}
        onOpenTemplates={onOpenTemplates}
      />
    );
  }

  const sidePanelProps = {
    activeTemplateId: activeTemplate.templateId,
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
    publicSlug: normalizedPublicSlug,
    publicUrl,
    recommendationAnalysis,
    saveState,
    savingLocale,
    savingPublicSettings,
    selectedProvider,
    selectedModel,
    onApplyInstruction: () => applyInstruction(),
    onCopyPublicUrl: () => void copyPublicUrl(),
    onManualChange: handleManualChange,
    onOpenCopyPaste: () => setModalState((current) => ({ ...current, copyPaste: true })),
    onOpenSettings,
    onOpenTemplates: () => setModalState((current) => ({ ...current, template: true })),
    onPublish: () => setModalState((current) => ({ ...current, public: true })),
    onSaveManual: () => void saveProfileToApi(currentProfile),
    onSaveUrl: () => void handleUpdatePublicSettings(true),
    onSetEditInstruction: setEditInstruction,
    onSetEditorTab: setEditorTab,
    onSetPublicSlugDraft: setPublicSlugDraft,
    onSetSelectedProvider: setSelectedProvider,
    onSetSelectedModel: setSelectedModel,
    onStartAnalysis,
    onUnpublish: () => void handleUpdatePublicSettings(false),
    onUpdateLocale: updateLocale,
  } satisfies Omit<CVEditorSidePanelProps, "displayMode">;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-pdf-canvas">
      <CVEditorHeader
        versionName={currentVersion.name}
        versionId={currentVersion.id}
        templateName={activeTemplate.name}
        locale={locale}
        canUndo={canUndo}
        canRedo={canRedo}
        isDesktopPanelOpen={panelState.desktopOpen}
        onUndo={undo}
        onRedo={redo}
        onSaveNewVersion={() => {
          setSaveName(t("editedName", { name: currentVersion.name }));
          setModalState((current) => ({ ...current, saving: true }));
        }}
        onOpenMobilePanel={() => setPanelState((current) => ({ ...current, mobileOpen: true }))}
        onToggleDesktopPanel={() =>
          setPanelState((current) => ({ ...current, desktopOpen: !current.desktopOpen }))
        }
        onBackToLibrary={onBackToLibrary}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-auto bg-pdf-canvas scrollbar-thin">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(var(--ui-pdf-dot) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {currentProfile ? (
            <PDFPreview url={previewSrc} fitMobile />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-panel-elevated text-text-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {panelState.desktopOpen && (
            <CVEditorSidePanel {...sidePanelProps} />
          )}
        </AnimatePresence>
      </div>

      <Sheet
        open={panelState.mobileOpen}
        onOpenChange={(mobileOpen) => setPanelState((current) => ({ ...current, mobileOpen }))}
      >
        <SheetContent
          side="right"
          closeLabel={t("closeEditorPanel")}
          className="!w-full sm:!w-[480px] gap-0 border-line bg-panel-base/95 p-0 backdrop-blur-xl md:hidden"
        >
          <SheetTitle className="sr-only">{t("editorPanelTitle")}</SheetTitle>
          <CVEditorSidePanel {...sidePanelProps} displayMode="mobile" />
        </SheetContent>
      </Sheet>

      <CVEditorModals
        copyPasteOpen={modalState.copyPaste}
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
          setModalState((current) => ({ ...current, copyPaste: false }));
        }}
        onCloseCopyPaste={() => setModalState((current) => ({ ...current, copyPaste: false }))}
        onClosePublicModal={() => setModalState((current) => ({ ...current, public: false }))}
        onCloseSavingModal={() => setModalState((current) => ({ ...current, saving: false }))}
        onConfirmPublic={() => void handleUpdatePublicSettings(true, true)}
        onSave={handleSaveAsCV}
        onSaveNameChange={setSaveName}
      />

      <CVTemplateChangeSheet
        activeTemplateId={activeTemplate.templateId}
        changing={changingTemplate}
        locale={locale}
        open={modalState.template}
        onOpenChange={(template) => setModalState((current) => ({ ...current, template }))}
        onChangeTemplate={(input) => {
          void changeTemplate(input).then((version) => {
            if (!version) return;
            setModalState((current) => ({ ...current, template: false }));
            routeState.selectVersion(version.id);
          });
        }}
      />
    </div>
  );
}
