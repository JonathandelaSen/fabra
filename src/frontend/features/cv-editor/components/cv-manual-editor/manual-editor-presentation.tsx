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
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-accent-teal-text" />
          <h4 className="text-xs font-semibold text-text-main tracking-wide">{t("presentation")}</h4>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] text-text-muted hover:text-text-on-bright transition-colors flex items-center gap-1 bg-panel-hover px-2 py-0.5 rounded border border-line"
          title={t("resetPresentation")}
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>{t("reset")}</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <label className="flex items-center justify-between gap-2 cursor-pointer group bg-panel-hover hover:bg-panel-active border border-line rounded-lg p-2 transition-all">
          <span className="text-[10px] text-text-muted group-hover:text-text-main transition-colors font-medium">{t("accent")}</span>
          <div className="relative flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-full border border-line-strong shadow-inner"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[9px] font-mono text-text-muted group-hover:text-text-soft">{accentColor}</span>
            <input
              type="color"
              value={accentColor}
              onChange={(event) => onAccentColorChange(event.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label={t("accentColor")}
            />
          </div>
        </label>
        <label className="flex items-center justify-between gap-2 cursor-pointer group bg-panel-hover hover:bg-panel-active border border-line rounded-lg p-2 transition-all">
          <span className="text-[10px] text-text-muted group-hover:text-text-main transition-colors font-medium">{t("tags")}</span>
          <div className="relative flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-full border border-line-strong shadow-inner"
              style={{ backgroundColor: tagsColor }}
            />
            <span className="text-[9px] font-mono text-text-muted group-hover:text-text-soft">{tagsColor}</span>
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
