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
      <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
      <div className="flex items-center gap-2">
        {saveState === "saving" && <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-400 animate-pulse">{t("saving")}</span>}
        {saveState === "saved" && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">{t("saved")}</span>}
        <button onClick={onSave} className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/5 px-2 py-1 text-[11px] text-zinc-400 hover:text-white hover:bg-white/10">
          <Save className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
