"use client";

import { useTranslations } from "next-intl";
import { Palette, RotateCcw } from "lucide-react";

interface ManualEditorPresentationProps {
  accentColor: string;
  tagsColor: string;
  onAccentColorChange: (color: string) => void;
  onTagsColorChange: (color: string) => void;
  onReset: () => void;
}

export function ManualEditorPresentation({
  accentColor,
  tagsColor,
  onAccentColorChange,
  onTagsColorChange,
  onReset,
}: ManualEditorPresentationProps) {
  const t = useTranslations("cvEditor.manual");

  return (
    <section className="mb-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.02]">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-teal-400" />
          <h4 className="text-xs font-semibold text-white tracking-wide">{t("presentation")}</h4>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5"
          title={t("resetPresentation")}
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>Reset</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <label className="flex items-center justify-between gap-2 cursor-pointer group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] rounded-lg p-2 transition-all">
          <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">{t("accent")}</span>
          <div className="relative flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-inner"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">{accentColor}</span>
            <input
              type="color"
              value={accentColor}
              onChange={(event) => onAccentColorChange(event.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label={t("accentColor")}
            />
          </div>
        </label>
        <label className="flex items-center justify-between gap-2 cursor-pointer group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] rounded-lg p-2 transition-all">
          <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">{t("tags")}</span>
          <div className="relative flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-inner"
              style={{ backgroundColor: tagsColor }}
            />
            <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">{tagsColor}</span>
            <input
              type="color"
              value={tagsColor}
              onChange={(event) => onTagsColorChange(event.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label={t("tagsColor")}
            />
          </div>
        </label>
      </div>
    </section>
  );
}
