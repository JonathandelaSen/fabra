"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ChevronDown, Check, KeyRound, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { AIModelOption } from "./ai-action-launcher";
import { AlertBanner, ALERT_BANNER_TONES } from "../alert-banner";

interface AIActionLauncherIntegratedProps {
  available: boolean;
  selectedModelId: string;
  models: AIModelOption[];
  onModelChange: (modelId: string) => void;
  onRun: () => void;
  unavailableReason?: string;
  onConfigure?: () => void;
  onClose: () => void;
}

export default function AIActionLauncherIntegrated({
  available,
  selectedModelId,
  models,
  onModelChange,
  onRun,
  unavailableReason,
  onConfigure,
  onClose,
}: AIActionLauncherIntegratedProps) {
  const t = useTranslations("aiLauncher");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  const handleIntegratedRun = () => {
    onClose();
    onRun();
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300 bg-white/[0.02] flex flex-col gap-3",
        available
          ? "border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.04]"
          : "border-amber-500/10 bg-amber-500/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/10">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
            {t("insideLabel")}
          </h4>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed">
            {available
              ? t("insideDesc")
              : unavailableReason || t("insideDesc")}
          </p>
        </div>
      </div>

      {available ? (
        <>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/[0.06] hover:border-white/[0.12] text-xs text-zinc-300 flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-medium">
                  {selectedModel?.label || "Select model"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                {selectedModel?.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-white/[0.04]">
                    {selectedModel.badge}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-zinc-500 transition-transform duration-300",
                    showModelDropdown && "rotate-180"
                  )}
                />
              </span>
            </button>

            <AnimatePresence>
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-1.5 rounded-lg border border-white/[0.08] bg-[#0c0c16] shadow-xl overflow-hidden"
                >
                  <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onModelChange(model.id);
                          setShowModelDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-all cursor-pointer",
                          model.id === selectedModelId
                            ? "bg-violet-500/10 text-violet-300 font-semibold"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{model.label}</span>
                          {model.badge && (
                            <span className="text-[8px] scale-90 px-1 py-0.2 bg-zinc-800/80 text-zinc-400 border border-white/[0.04] rounded">
                              {model.badge}
                            </span>
                          )}
                        </span>
                        {model.id === selectedModelId && (
                          <Check className="w-3.5 h-3.5 text-violet-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleIntegratedRun}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md shadow-violet-950/20 cursor-pointer"
          >
            {t("continue")}
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          <AlertBanner tone={ALERT_BANNER_TONES.WARNING} icon={KeyRound}compact>
            {t("configureAI")}
          </AlertBanner>
          {onConfigure && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onConfigure?.();
              }}
              className="w-full py-2 px-4 rounded-lg border border-amber-500/30 hover:bg-amber-500/15 text-amber-300 font-semibold text-xs transition-all cursor-pointer"
            >
              {t("configureAI")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
