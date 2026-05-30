"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_FAST_GEMINI_MODEL, DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AIContext } from "@/lib/analysis-types";
import { BasicPanel } from "@/components/shared/basic-panel";
import { GeneralAnalysisFormHeader } from "./general-analysis-form-header";
import { GeneralAnalysisActionLauncher } from "./general-analysis-action-launcher";

interface GeneralAnalysisFormProps {
  onSubmit: (context: AIContext, model: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onAnalyzeWithExternalChat: (context: AIContext) => void;
}

export default function GeneralAnalysisForm({
  onSubmit,
  onBack,
  loading,
  error,
  hasAIApiKey,
  onOpenSettings,
  onAnalyzeWithExternalChat,
}: GeneralAnalysisFormProps) {
  const t = useTranslations("analysisFlow.forms");
  const [additionalContext, setAdditionalContext] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_FAST_GEMINI_MODEL);

  const handleSubmit = () => {
    const context: AIContext = {};
    if (additionalContext.trim())
      context.additionalContext = additionalContext.trim();

    onSubmit(context, selectedModel);
  };

  const handleExternalChat = () => {
    const context: AIContext = {};
    if (additionalContext.trim())
      context.additionalContext = additionalContext.trim();
    onAnalyzeWithExternalChat(context);
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
      <GeneralAnalysisFormHeader onBack={onBack} />

      {/* Additional Context */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-400 mb-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          {t("additionalContext")}
          <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
            {t("optional")}
          </span>
        </label>
        <textarea
          placeholder={t("additionalContextPlaceholder")}
          className="w-full h-24 px-4 py-3 rounded-xl bg-[#0a0a12] border border-white/[0.06] text-sm text-zinc-300 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
        />
      </div>

      <GeneralAnalysisActionLauncher
        loading={loading}
        hasAIApiKey={hasAIApiKey}
        selectedModel={selectedModel}
        models={models}
        onModelChange={setSelectedModel}
        onSubmit={handleSubmit}
        onOpenSettings={onOpenSettings}
        onAnalyzeWithExternalChat={handleExternalChat}
      />

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

