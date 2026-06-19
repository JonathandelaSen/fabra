"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import {
  ArrowLeft,
  Briefcase,
  KeyRound,
  Link,
} from "lucide-react";
import { useTranslations } from "next-intl";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";

interface JobMatchFormProps {
  onSubmit: (jobDescription: string, jobUrl: string, provider: StoredAIProvider, model: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onCopyPasteOpen?: (jobDescription: string, jobUrl: string) => void;
}

import type { StoredAIProvider } from "@/lib/browser-preferences";

export default function JobMatchForm({
  onSubmit,
  onBack,
  loading,
  error,
  hasAIApiKey,
  onOpenSettings,
  onCopyPasteOpen,
}: JobMatchFormProps) {
  const t = useTranslations("analysisFlow.forms");
  const common = useTranslations("common");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);

  const handleSubmit = () => {
    if (!jobDescription.trim()) return;
    onSubmit(jobDescription.trim(), jobUrl.trim(), selectedProvider, selectedModel);
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <BasicPanel className="shrink-0 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success-border text-xs font-medium text-success-text">
            <Briefcase className="w-3.5 h-3.5" />
            {t("jobTitle")}
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-soft transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("changeMode")}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="flex items-center gap-2 text-sm text-text-muted mb-1.5">
            <Link className="w-3.5 h-3.5" />
            {t("jobUrl")}
            <span className="text-[10px] text-text-muted bg-panel-control/60 px-1.5 py-0.5 rounded border border-line">
              {t("optional")}
            </span>
          </label>
          <input
            type="url"
            placeholder={t("jobUrlPlaceholder")}
            className="w-full h-10 px-4 rounded-xl bg-field border border-line text-sm text-text-main placeholder:text-text-faint focus:outline-none focus:border-success-border focus:ring-2 focus:ring-success-border transition-all"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-text-muted mb-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {t("jobDescription")}
            <span className="text-[10px] text-danger-text bg-danger-soft px-1.5 py-0.5 rounded border border-danger-border">
              {t("required")}
            </span>
          </label>
          <textarea
            placeholder={t("jobDescriptionPlaceholder")}
            className="w-full h-48 px-4 py-3 rounded-xl bg-field border border-line text-sm text-text-main placeholder:text-text-faint resize-none focus:outline-none focus:border-success-border focus:ring-2 focus:ring-success-border transition-all"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full flex justify-end">
        <AIActionLauncher
          actionLabel={t("compareOffer")}
          loading={loading}
          disabled={!jobDescription.trim()}
          integrated={{
            available: hasAIApiKey,
            selectedProvider,
            onProviderChange: setSelectedProvider,
            selectedModelId: selectedModel,
            onModelChange: setSelectedModel,
            onRun: handleSubmit,
            onConfigure: onOpenSettings,
          }}
          copyPaste={{
            available: !!onCopyPasteOpen,
            onOpenFlow: () => onCopyPasteOpen?.(jobDescription.trim(), jobUrl.trim()),
          }}
        />
      </div>

      {!hasAIApiKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex flex-col gap-3 rounded-xl border border-warning-border bg-warning/10 px-4 py-3 text-sm text-warning-text sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            {t("missingApiKey")}
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-warning px-3 py-2 text-xs font-semibold text-text-on-bright transition-colors hover:bg-warning cursor-pointer"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {common("actions.configure")}
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 px-4 py-3 rounded-xl bg-danger-soft border border-danger-border text-danger-text text-sm"
        >
          {error}
        </motion.div>
      )}
      </BasicPanel>
    </motion.div>
  );
}
