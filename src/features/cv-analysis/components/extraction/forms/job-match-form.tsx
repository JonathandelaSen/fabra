"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BasicPanel } from "@/components/shared/basic-panel";
import { JobMatchFormHeader } from "./job-match-form-header";
import { JobMatchActionLauncher } from "./job-match-action-launcher";

import type { StoredAIProvider } from "@/lib/browser-preferences";
import { Briefcase, KeyRound, Link } from "lucide-react";

interface JobMatchFormProps {
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSubmit: (jobDescription: string, jobUrl: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onCopyPasteOpen?: (jobDescription: string, jobUrl: string) => void;
}

export default function JobMatchForm({
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
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

  const handleSubmit = () => {
    if (!jobDescription.trim()) return;
    onSubmit(jobDescription.trim(), jobUrl.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <BasicPanel className="shrink-0 p-6">
      <JobMatchFormHeader onBack={onBack} />

      <div className="space-y-4">
        {/* Job URL */}
        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 mb-1.5">
            <Link className="w-3.5 h-3.5" />
            {t("jobUrl")}
            <span className="text-[10px] text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded border border-white/[0.05]">
              {t("optional")}
            </span>
          </label>
          <input
            type="url"
            placeholder={t("jobUrlPlaceholder")}
            className="w-full h-10 px-4 rounded-xl bg-field border border-line text-sm text-text-main placeholder:text-text-faint focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </div>

        {/* Job description */}
        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 mb-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {t("jobDescription")}
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              {t("required")}
            </span>
          </label>
          <textarea
            placeholder={t("jobDescriptionPlaceholder")}
            className="w-full h-48 px-4 py-3 rounded-xl bg-field border border-line text-sm text-text-main placeholder:text-text-faint resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <JobMatchActionLauncher
          loading={loading}
          disabled={!jobDescription.trim()}
          hasAIApiKey={hasAIApiKey}
          selectedProvider={selectedProvider}
          onProviderChange={onProviderChange}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onSubmit={handleSubmit}
          onOpenSettings={onOpenSettings}
          onCopyPasteOpen={
            onCopyPasteOpen
              ? () => onCopyPasteOpen(jobDescription.trim(), jobUrl.trim())
              : undefined
          }
        />
      </div>

      {!hasAIApiKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{t("missingApiKey")}</span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-300 cursor-pointer"
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
          className="mt-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"
        >
          {error}
        </motion.div>
      )}
      </BasicPanel>
    </motion.div>
  );
}
