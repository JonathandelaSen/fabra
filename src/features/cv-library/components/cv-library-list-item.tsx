"use client";

import { Eye, FileSearch, Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import type { CVDocumentListItem } from "../api/cv-library-api";

interface CVLibraryListItemProps {
  cv: CVDocumentListItem;
  selected: boolean;
  analysisCount: number;
  editing: boolean;
  draftName: string;
  saving: boolean;
  onSelect: () => void;
  onStartEditing: () => void;
  onDraftNameChange: (name: string) => void;
  onSaveName: () => void;
  onCancelEditing: () => void;
  onDelete: () => void;
  analysisCountLabel: string;
}

export function CVLibraryListItem({
  cv,
  selected,
  analysisCount,
  editing,
  draftName,
  saving,
  onSelect,
  onStartEditing,
  onDraftNameChange,
  onSaveName,
  onCancelEditing,
  onDelete,
  analysisCountLabel,
}: CVLibraryListItemProps) {
  return (
    <div
      className={`mb-1 rounded-lg border p-3 transition-all ${
        selected
          ? "border-sky-500/30 bg-sky-500/10"
          : "border-transparent hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-400"
        >
          <Eye className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0a0a12] px-3 text-sm text-zinc-100 focus:border-sky-500/40 focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={onSelect}
              className="block w-full truncate text-left text-sm font-semibold text-zinc-100"
            >
              {cv.name}
            </button>
          )}
          <p className="mt-1 truncate text-xs text-zinc-500">
            {cv.filename}
          </p>
          {analysisCount > 0 && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-md border border-sky-500/15 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
              <FileSearch className="h-3 w-3" />
              {analysisCountLabel}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {editing ? (
            <>
              <button
                type="button"
                onClick={onSaveName}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={onCancelEditing}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStartEditing}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
