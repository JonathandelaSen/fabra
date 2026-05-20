"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  Cpu,
  KeyRound,
  Loader2,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface AIModelOption {
  id: string;
  label: string;
  provider?: string;
  badge?: string;
  disabled?: boolean;
}

export interface AIActionLauncherProps {
  actionLabel: string;
  integrated: {
    available: boolean;
    selectedModelId: string;
    models: AIModelOption[];
    onModelChange: (modelId: string) => void;
    onRun: () => void;
    unavailableReason?: string;
    onConfigure?: () => void;
  };
  copyPaste: {
    available: boolean;
    onOpenFlow: () => void;
    unavailableReason?: string;
  };
  loading?: boolean;
  disabled?: boolean;
}

export default function AIActionLauncher({
  actionLabel,
  integrated,
  copyPaste,
  loading = false,
  disabled = false,
}: AIActionLauncherProps) {
  const t = useTranslations("aiLauncher");
  const [open, setOpen] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const selectedModel = integrated.models.find(
    (m) => m.id === integrated.selectedModelId
  );

  const handleIntegratedRun = () => {
    setOpen(false);
    integrated.onRun();
  };

  const handleCopyPasteRun = () => {
    setOpen(false);
    copyPaste.onOpenFlow();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={loading || disabled}
        className="w-fit flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-950/30 hover:shadow-indigo-900/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{actionLabel}...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4.5 h-4.5 text-indigo-200 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
            <span>{actionLabel}</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70 group-hover:translate-y-0.5 transition-transform duration-300" />
          </>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] xs:w-[380px] p-0 overflow-hidden bg-[#0c0c16]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/80 animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Title / Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            {t("title")}
          </h3>
        </div>

        {/* Action Modes Container */}
        <div className="p-4 flex flex-col gap-3">
          {/* Mode 1: Integrated (Dentro de la app) */}
          <div
            className={cn(
              "relative p-4 rounded-xl border transition-all duration-300 bg-white/[0.02] flex flex-col gap-3",
              integrated.available
                ? "border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.04]"
                : "border-amber-500/10 bg-amber-500/[0.02]"
            )}
          >
            {/* Mode Header */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/10">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
                  {t("insideLabel")}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  {integrated.available
                    ? t("insideDesc")
                    : integrated.unavailableReason || t("insideDesc")}
                </p>
              </div>
            </div>

            {integrated.available ? (
              <>
                {/* Model Selection Row */}
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

                  {/* Dropdown Menu for Models */}
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
                          {integrated.models.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                integrated.onModelChange(model.id);
                                setShowModelDropdown(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-all cursor-pointer",
                                model.id === integrated.selectedModelId
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
                              {model.id === integrated.selectedModelId && (
                                <Check className="w-3.5 h-3.5 text-violet-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Button */}
                <button
                  type="button"
                  onClick={handleIntegratedRun}
                  className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md shadow-violet-950/20 cursor-pointer"
                >
                  {t("continue")}
                </button>
              </>
            ) : (
              /* Missing Configuration / Key State */
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  <KeyRound className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>{t("configureAI")}</span>
                </div>
                {integrated.onConfigure && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      integrated.onConfigure?.();
                    }}
                    className="w-full py-2 px-4 rounded-lg border border-amber-500/30 hover:bg-amber-500/15 text-amber-300 font-semibold text-xs transition-all cursor-pointer"
                  >
                    {t("configureAI")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mode 2: Copy Paste (Chat externo) */}
          {copyPaste.available && (
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/10">
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
                    {t("externalLabel")}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {t("externalDesc")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPasteRun}
                className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.06] font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                {t("openFlow")}
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
