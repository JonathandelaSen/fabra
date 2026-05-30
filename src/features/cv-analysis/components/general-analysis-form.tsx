"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { AIContext } from "@/lib/analysis-types";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { BasicPanel } from "@/components/shared/basic-panel";

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
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

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
    { id: "gemini-2.5-flash", label: `Gemini 2.5 Flash (${t("fast")})` },
    { id: "gemini-3.1-pro-preview", label: `Gemini 3.1 Pro Preview (${t("powerful")})` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <BasicPanel className="shrink-0 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            {t("generalTitle")}
          </div>
          <span className="text-[10px] text-zinc-600">
            {t("allFieldsOptional")}
          </span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("changeMode")}
        </button>
      </div>

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

      {/* Footer: Unified AI Action Launcher */}
      <div className="w-full flex justify-end">
        <AIActionLauncher
          actionLabel={t("analyzeCV")}
          loading={loading}
          integrated={{
            available: hasAIApiKey,
            selectedModelId: selectedModel,
            models,
            onModelChange: setSelectedModel,
            onRun: handleSubmit,
            onConfigure: onOpenSettings,
          }}
          copyPaste={{
            available: true,
            onOpenFlow: handleExternalChat,
          }}
        />
      </div>

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

