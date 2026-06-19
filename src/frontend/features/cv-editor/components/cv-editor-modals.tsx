"use client";

import { AnimatePresence } from "framer-motion";
import CVEditorCopyPasteModal, { type CVEditorCopyPasteModalProps } from "./cv-editor-copy-paste-modal";
import { CVEditorPublicModal } from "./cv-editor-public-modal";
import { CVEditorSaveModal } from "./cv-editor-save-modal";

interface CVEditorModalsProps {
  copyPasteOpen: boolean;
  currentVersionId: string;
  editInstruction: string;
  isPublicModalOpen: boolean;
  isSavingModalOpen: boolean;
  normalizedPublicSlug: string;
  publicDraftUrl: string;
  saveName: string;
  savingAsCv: boolean;
  savingPublicSettings: boolean;
  onApplyCopyPaste: CVEditorCopyPasteModalProps["onApplied"];
  onCloseCopyPaste: () => void;
  onClosePublicModal: () => void;
  onCloseSavingModal: () => void;
  onConfirmPublic: () => void;
  onSave: () => void;
  onSaveNameChange: (value: string) => void;
}

export function CVEditorModals({
  copyPasteOpen,
  currentVersionId,
  editInstruction,
  isPublicModalOpen,
  isSavingModalOpen,
  normalizedPublicSlug,
  publicDraftUrl,
  saveName,
  savingAsCv,
  savingPublicSettings,
  onApplyCopyPaste,
  onCloseCopyPaste,
  onClosePublicModal,
  onCloseSavingModal,
  onConfirmPublic,
  onSave,
  onSaveNameChange,
}: CVEditorModalsProps) {
  return (
    <>
      <AnimatePresence>
        {isPublicModalOpen && (
          <CVEditorPublicModal
            publicDraftUrl={publicDraftUrl}
            normalizedPublicSlug={normalizedPublicSlug}
            savingPublicSettings={savingPublicSettings}
            onClose={onClosePublicModal}
            onConfirm={onConfirmPublic}
          />
        )}

        {isSavingModalOpen && (
          <CVEditorSaveModal
            saveName={saveName}
            setSaveName={onSaveNameChange}
            savingAsCv={savingAsCv}
            onClose={onCloseSavingModal}
            onSave={onSave}
          />
        )}
      </AnimatePresence>

      <CVEditorCopyPasteModal
        cvId={currentVersionId}
        instruction={editInstruction}
        open={copyPasteOpen}
        onClose={onCloseCopyPaste}
        onApplied={onApplyCopyPaste}
      />
    </>
  );
}
