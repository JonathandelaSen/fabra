"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { AIContext } from "@/lib/analysis-types";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import { GeneralAnalysisFormHeader } from "./general-analysis-form-header";
import { GeneralAnalysisActionLauncher } from "./general-analysis-action-launcher";

import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import { MessageSquare } from "lucide-react";

interface GeneralAnalysisFormProps {
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSubmit: (context: AIContext) => void;
  loading: boolean;
  error: string | null;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onAnalyzeWithExternalChat: (context: AIContext) => void;
}

export default function GeneralAnalysisForm({
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  onSubmit,
  loading,
  error,
  hasAIApiKey,
  onOpenSettings,
  onAnalyzeWithExternalChat,
}: GeneralAnalysisFormProps) {
  const t = useTranslations("analysisFlow.forms");
  const [additionalContext, setAdditionalContext] = useState("");

  const handleSubmit = () => {
    const context: AIContext = {};
    if (additionalContext.trim())
      context.additionalContext = additionalContext.trim();

    onSubmit(context);
  };

  const handleExternalChat = () => {
    const context: AIContext = {};
    if (additionalContext.trim())
      context.additionalContext = additionalContext.trim();
    onAnalyzeWithExternalChat(context);
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <BasicPanel className="shrink-0 p-6">
      <GeneralAnalysisFormHeader />

      {/* Additional Context */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-text-muted mb-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          {t("additionalContext")}
          <span className="text-[10px] text-text-faint bg-panel-control px-1.5 py-0.5 rounded">
            {t("optional")}
          </span>
        </label>
        <textarea
          placeholder={t("additionalContextPlaceholder")}
          className="w-full h-24 px-4 py-3 rounded-xl bg-field border border-line text-sm text-text-main placeholder:text-text-faint resize-none focus:outline-none focus:border-action-border/40 focus:ring-2 focus:ring-action-border transition-all"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
        />
      </div>

      <GeneralAnalysisActionLauncher
        loading={loading}
        hasAIApiKey={hasAIApiKey}
        selectedProvider={selectedProvider}
        onProviderChange={onProviderChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        onSubmit={handleSubmit}
        onOpenSettings={onOpenSettings}
        onAnalyzeWithExternalChat={handleExternalChat}
      />

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
