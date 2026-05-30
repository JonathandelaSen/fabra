"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_FAST_GEMINI_MODEL, DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { Briefcase, KeyRound, Link } from "lucide-react";
import { useTranslations } from "next-intl";
import { BasicPanel } from "@/components/shared/basic-panel";
import { JobMatchFormHeader } from "./job-match-form-header";
import { JobMatchActionLauncher } from "./job-match-action-launcher";

interface JobMatchFormProps {
  onSubmit: (jobDescription: string, jobUrl: string, model: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
}

export default function JobMatchForm({
  onSubmit,
  onBack,
  loading,
  error,
  hasAIApiKey,
  onOpenSettings,
}: JobMatchFormProps) {
  const t = useTranslations("analysisFlow.forms");
  const common = useTranslations("common");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_FAST_GEMINI_MODEL);

  const handleSubmit = () => {
    if (!jobDescription.trim()) return;
    onSubmit(jobDescription.trim(), jobUrl.trim(), selectedModel);
  };

  const models = [
    { id: DEFAULT_FAST_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_FAST_GEMINI_MODEL]} (${t("fast")})` },
    { id: DEFAULT_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_GEMINI_MODEL]} (${t("powerful")})` },
  ];

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
            className="w-full h-10 px-4 rounded-xl bg-[#0a0a12] border border-white/[0.06] text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all"
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
            className="w-full h-48 px-4 py-3 rounded-xl bg-[#0a0a12] border border-white/[0.06] text-sm text-zinc-300 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <JobMatchActionLauncher
          loading={loading}
          disabled={!jobDescription.trim()}
          hasAIApiKey={hasAIApiKey}
          selectedModel={selectedModel}
          models={models}
          onModelChange={setSelectedModel}
          onSubmit={handleSubmit}
          onOpenSettings={onOpenSettings}
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
