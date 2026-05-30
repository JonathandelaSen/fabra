"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import AIActionLauncher, {
  type AIModelOption,
} from "@/components/shared/ai-action-launcher/ai-action-launcher";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";

interface CVEditorAIPanelProps {
  editInstruction: string;
  setEditInstruction: (value: string) => void;
  editingProfile: boolean;
  hasAIApiKey: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  aiModels: AIModelOption[];
  error: string | null;
  onApplyInstruction: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings: () => void;
}

export function CVEditorAIPanel({
  editInstruction,
  setEditInstruction,
  editingProfile,
  hasAIApiKey,
  selectedModel,
  setSelectedModel,
  aiModels,
  error,
  onApplyInstruction,
  onOpenCopyPaste,
  onOpenSettings,
}: CVEditorAIPanelProps) {
  const t = useTranslations("cvEditor");

  return (
    <section>
      <header className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-white">
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
          value={editInstruction}
          onChange={(e) => setEditInstruction(e.target.value)}
          placeholder={t("aiPlaceholder")}
          className="h-32 w-full resize-none rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/30 focus:outline-none transition-colors"
        />

        <AIActionLauncher
          actionLabel={t("aiEditorAction")}
          loading={editingProfile}
          disabled={!editInstruction.trim()}
          integrated={{
            available: hasAIApiKey,
            selectedModelId: selectedModel,
            models: aiModels,
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
              className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] text-zinc-400 hover:border-white/10 hover:bg-white/10 hover:text-zinc-200 transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
