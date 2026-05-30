"use client";

import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL, DEFAULT_FAST_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { Sparkles } from "lucide-react";

interface ChatHeaderProps {
  model: string;
  onModelChange: (model: string) => void;
}

export function ChatHeader({ model, onModelChange }: ChatHeaderProps) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400">
          <Sparkles className="size-3.5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-zinc-200">
            {t("title")}
          </h4>
          <p className="text-[11px] text-zinc-600">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <select
        value={model}
        onChange={(event) => onModelChange(event.target.value)}
        aria-label={t("modelLabel")}
        className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-zinc-400 outline-none transition-colors hover:border-white/[0.12] focus:border-cyan-500/30"
      >
        <option value={DEFAULT_GEMINI_MODEL}>{GEMINI_MODELS[DEFAULT_GEMINI_MODEL]}</option>
        <option value={DEFAULT_FAST_GEMINI_MODEL}>{GEMINI_MODELS[DEFAULT_FAST_GEMINI_MODEL]}</option>
      </select>
    </div>
  );
}
