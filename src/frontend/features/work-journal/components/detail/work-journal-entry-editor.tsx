"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { WorkJournalContext, WorkJournalEntry } from "../../api/work-journal-types";
import { ActivityContextSelector } from "@/frontend/features/activity-context";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher";
import { getErrorMessage } from "@/lib/errors";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import { WorkJournalCopyPastePanel } from "../form/work-journal-copy-paste-panel";

interface WorkJournalEntryEditorProps {
  entry: WorkJournalEntry;
  onSave: (updates: Partial<WorkJournalEntry>) => void;
  onCancel: () => void;
  activeContexts: WorkJournalContext[];
  onManageContexts: () => void;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  selectedProvider: StoredAIProvider;
  setSelectedProvider: (provider: StoredAIProvider) => void;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
  onDraftEditWithAI: (
    contextId: string,
    dateStart: string,
    dateEnd: string | null,
    topic: string | null,
    notes: string,
    provider: StoredAIProvider,
    modelId: string
  ) => Promise<string>;
}

export function WorkJournalEntryEditor({
  entry,
  onSave,
  onCancel,
  activeContexts,
  onManageContexts,
  hasAIApiKey,
  onOpenSettings,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  onDraftEditWithAI,
}: WorkJournalEntryEditorProps) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");
  const [edit, setEdit] = useState(entry);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);

  const currentContext =
    activeContexts.find((context) => context.id === edit.contextId) ?? null;

  const handleGenerate = async () => {
    if (!edit.contextId || !edit.rawNotes.trim()) {
      setError(t("errors.aiDraftRequired"));
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const newText = await onDraftEditWithAI(
        edit.contextId,
        edit.dateStart,
        edit.dateEnd,
        edit.topic,
        edit.rawNotes,
        selectedProvider,
        selectedModel
      );
      setEdit((current) => ({ ...current, finalText: newText }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="group text-left">
      <BasicPanel className="space-y-6 w-full p-6 md:p-8">
        <div className="flex flex-wrap gap-4 items-start">
          <div className="w-full sm:w-auto min-w-[240px] mb-2 sm:mb-0">
            <ActivityContextSelector
              id="edit-entry-context"
              manageLabel={t("manageContexts")}
              value={edit.contextId || ""}
              onChange={(val) => setEdit({ ...edit, contextId: val })}
              contexts={activeContexts}
              onManageClick={onManageContexts}
            />
          </div>
          <div className="flex flex-wrap gap-4 flex-1 items-end">
            <input
              type="date"
              className="bg-transparent border-b border-line-strong text-sm text-text-soft outline-none pb-1 transition-colors focus:border-action-border/50"
              value={edit.dateStart}
              onChange={(e) => setEdit({ ...edit, dateStart: e.target.value })}
            />
            <input
              type="date"
              className="bg-transparent border-b border-line-strong text-sm text-text-soft outline-none pb-1 transition-colors focus:border-action-border/50"
              value={edit.dateEnd || ""}
              onChange={(e) =>
                setEdit({ ...edit, dateEnd: e.target.value || null })
              }
            />
            <input
              placeholder={t("editTopicPlaceholder")}
              className="bg-transparent border-b border-line-strong text-sm text-text-soft outline-none pb-1 flex-1 min-w-[200px] transition-colors focus:border-action-border/50"
              value={edit.topic || ""}
              onChange={(e) =>
                setEdit({ ...edit, topic: e.target.value || null })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted mb-2 block">
              {t("finalText")}
            </label>
            <textarea
              className="w-full bg-transparent text-[17px] md:text-lg font-light leading-relaxed text-text-soft placeholder:text-text-faint outline-none resize-y min-h-[240px] border border-line rounded-xl p-4 focus:border-line-default transition-colors"
              value={edit.finalText}
              onChange={(event) =>
                setEdit({ ...edit, finalText: event.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted mb-2 block">
              {t("rawNotes")}
            </label>
            <textarea
              className="w-full bg-transparent text-[15px] font-light leading-relaxed text-text-muted placeholder:text-text-faint outline-none resize-y min-h-[120px] border border-line rounded-xl p-4 focus:border-line-default transition-colors"
              value={edit.rawNotes}
              onChange={(event) =>
                setEdit({ ...edit, rawNotes: event.target.value })
              }
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-danger-text bg-danger-soft px-4 py-3 rounded-lg border border-danger-border">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSave(edit)}
            disabled={aiLoading}
            className="px-4 py-2 bg-panel text-text-main text-sm font-medium rounded-full hover:bg-panel-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("saveChanges")}
          </button>
          <button
            onClick={onCancel}
            disabled={aiLoading}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {common("cancel")}
          </button>

          <div className="ml-auto">
            <AIActionLauncher
              actionLabel={t("generateProfessionalDraft")}
              loading={aiLoading}
              disabled={!edit.rawNotes.trim() || !edit.contextId}
              integrated={{
                available: hasAIApiKey,
                selectedProvider,
                onProviderChange: setSelectedProvider,
                selectedModelId: selectedModel,
                onModelChange: setSelectedModel,
                onRun: handleGenerate,
                onConfigure: onOpenSettings,
              }}
              copyPaste={{
                available: true,
                onOpenFlow: () => setIsCopyPasteOpen((open) => !open),
              }}
            />
          </div>
        </div>

        {isCopyPasteOpen && (
          <WorkJournalCopyPastePanel
            context={currentContext}
            dateStart={edit.dateStart}
            dateEnd={edit.dateEnd}
            topic={edit.topic}
            notes={edit.rawNotes}
            onPasteText={(finalText) =>
              setEdit((current) => ({ ...current, finalText: finalText }))
            }
            onClose={() => setIsCopyPasteOpen(false)}
          />
        )}
      </BasicPanel>
    </div>
  );
}
