"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher/ai-action-launcher";
import { AlertBanner, ALERT_BANNER_TONES } from "@/frontend/components/shared/alert-banner";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface CVEditorAIPanelProps {
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  launcherOpen?: boolean;
  onLauncherOpenChange?: (open: boolean) => void;
  editInstruction: string;
  setEditInstruction: (value: string) => void;
  editingProfile: boolean;
  hasAIApiKey: boolean;
  selectedProvider: StoredAIProvider;
  setSelectedProvider: (provider: StoredAIProvider) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  error: string | null;
  onApplyInstruction: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings: () => void;
}

export function CVEditorAIPanel({
  textareaRef,
  launcherOpen,
  onLauncherOpenChange,
  editInstruction,
  setEditInstruction,
  editingProfile,
  hasAIApiKey,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  error,
  onApplyInstruction,
  onOpenCopyPaste,
  onOpenSettings,
}: CVEditorAIPanelProps) {
  const t = useTranslations("cvEditor");

  return (
    <section>
      <header className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-teal/10 text-accent-teal-text">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-text-main">
          {t("aiEditor")}
        </h3>
      </header>

      {error && (
        <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mb-4">
          {error}
        </AlertBanner>
      )}

      <div className="space-y-4">
        <textarea
          ref={textareaRef}
          value={editInstruction}
          onChange={(e) => setEditInstruction(e.target.value)}
          placeholder={t("aiPlaceholder")}
          className="h-32 w-full resize-none rounded-2xl border border-line bg-panel-hover px-4 py-3 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none transition-colors"
        />

        <AIActionLauncher
          open={launcherOpen}
          onOpenChange={onLauncherOpenChange}
          actionLabel={t("aiEditorAction")}
          loading={editingProfile}
          disabled={!editInstruction.trim()}
          integrated={{
            available: hasAIApiKey,
            selectedProvider,
            onProviderChange: setSelectedProvider,
            selectedModelId: selectedModel,
            onModelChange: setSelectedModel,
            onRun: onApplyInstruction,
            unavailableReason: hasAIApiKey
              ? undefined
              : t("errors.missingApiKey"),
            onConfigure: onOpenSettings,
          }}
          copyPaste={{
            available: true,
            onOpenFlow: onOpenCopyPaste,
          }}
        />

        <div className="flex flex-wrap gap-2">
          {[
            t("aiHints.shortenSummary"),
            t("aiHints.improveClarity"),
            t("aiHints.moreExecutive"),
            t("aiHints.fixTypos"),
          ].map((hint) => (
            <button
              key={hint}
              onClick={() => setEditInstruction(hint)}
              className="rounded-full border border-line bg-panel-hover px-3 py-1 text-[11px] text-text-muted hover:border-line-default hover:bg-panel-active hover:text-text-soft transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
