"use client";

import { Pencil, Save, X, Trash2, Loader2, Sparkles, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CVDocumentListItem } from "../api/cv-library-api";

interface CVLibraryDetailHeaderProps {
  selected: CVDocumentListItem;
  editing: boolean;
  draftName: string;
  saving: boolean;
  onStartEditing: () => void;
  onDraftNameChange: (name: string) => void;
  onSaveName: () => void;
  onCancelEditing: () => void;
  onDelete: () => void;
  onOpenEditor: (cvId: string) => void;
  pdfPath: string;
}

export function CVLibraryDetailHeader({
  selected,
  editing,
  draftName,
  saving,
  onStartEditing,
  onDraftNameChange,
  onSaveName,
  onCancelEditing,
  onDelete,
  onOpenEditor,
  pdfPath,
}: CVLibraryDetailHeaderProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] bg-white/[0.01] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 pr-4">
        {editing ? (
          <div className="flex items-center gap-2 max-w-md">
            <input
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSaveName();
                if (event.key === "Escape") onCancelEditing();
              }}
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0a0a12] px-3 text-sm text-zinc-100 focus:border-teal-500/40 focus:outline-none"
              autoFocus
            />
            <Button
              type="button"
              onClick={onSaveName}
              disabled={saving || !draftName.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 p-0 text-white hover:bg-teal-500 disabled:opacity-50"
              title={t("save")}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancelEditing}
              variant="ghost"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] p-0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="truncate text-base font-semibold text-zinc-100">
                {selected.name}
              </h2>
              {selected.type === "template" ? (
                <span className="shrink-0 rounded border border-teal-500/25 bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-teal-400">
                  {t("typeTemplate")}
                </span>
              ) : (
                <span className="shrink-0 rounded border border-zinc-500/20 bg-zinc-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-zinc-400">
                  {t("typeOriginal")}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-zinc-500">
              {selected.filename || "—"}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 flex-wrap">
        {!editing && (
          <>
            <Button
              type="button"
              onClick={onStartEditing}
              variant="secondary"
              className="h-9 bg-white/[0.03] text-zinc-300 hover:bg-white/5 border border-white/[0.08] hover:text-zinc-100"
            >
              <Pencil className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
              {t("rename")}
            </Button>
            <Button
              type="button"
              onClick={onDelete}
              variant="destructive"
              className="h-9 bg-rose-600/15 text-rose-300 hover:bg-rose-600/25 border border-rose-500/20 hover:text-white"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {t("delete")}
            </Button>
          </>
        )}
        {selected.type === "template" && (
          <button
            type="button"
            onClick={() => onOpenEditor(selected.id)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-teal-500/25 bg-teal-500/10 px-3.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500/20 focus:outline-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("editWithAI")}
          </button>
        )}
        <a
          href={pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
          title={t("viewPdf")}
        >
          <Download className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
