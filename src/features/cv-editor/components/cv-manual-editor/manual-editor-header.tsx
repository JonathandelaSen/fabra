"use client";

import { Save } from "lucide-react";

import type { CVSaveState } from "../../types";

export function ManualEditorHeader({
  saveState,
  onSave,
  t,
}: {
  saveState: CVSaveState;
  onSave: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-text-main">{t("title")}</h3>
      <div className="flex items-center gap-2">
        {saveState === "saving" && <span className="rounded-full bg-accent-teal/10 px-2 py-0.5 text-[10px] text-accent-teal-text animate-pulse">{t("saving")}</span>}
        {saveState === "saved" && <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success-text">{t("saved")}</span>}
        <button onClick={onSave} className="flex items-center gap-1 rounded-lg bg-panel-hover border border-line px-2 py-1 text-[11px] text-text-muted hover:text-text-main hover:bg-panel-active">
          <Save className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
