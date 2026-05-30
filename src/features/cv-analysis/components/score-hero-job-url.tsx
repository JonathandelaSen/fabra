"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ExternalLink,
  Loader2,
  Check,
  X,
  Plus,
  Pencil,
} from "lucide-react";

interface ScoreHeroJobUrlProps {
  jobUrl: string | null;
  onSaveUrl: (url: string) => Promise<void>;
  isSavingUrl: boolean;
}

export function ScoreHeroJobUrl({
  jobUrl,
  onSaveUrl,
  isSavingUrl,
}: ScoreHeroJobUrlProps) {
  const t = useTranslations("analysisDetail.score");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState(jobUrl || "");

  const handleSaveUrl = async () => {
    await onSaveUrl(editedUrl.trim());
    setIsEditingUrl(false);
  };

  if (isEditingUrl) {
    return (
      <>
        <span className="text-zinc-700 text-[10px]">|</span>
        <div className="inline-flex items-center gap-1.5">
          <input
            type="url"
            value={editedUrl}
            onChange={(e) => setEditedUrl(e.target.value)}
            placeholder={t("urlPlaceholder")}
            className="h-6 w-48 rounded-md bg-[#0a0a12] border border-white/[0.06] px-2 text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500/40"
            autoFocus
          />
          <button
            onClick={handleSaveUrl}
            disabled={isSavingUrl}
            className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
          >
            {isSavingUrl ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => {
              setIsEditingUrl(false);
              setEditedUrl(jobUrl || "");
            }}
            disabled={isSavingUrl}
            className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </>
    );
  }

  if (jobUrl) {
    return (
      <>
        <span className="text-zinc-700 text-[10px]">|</span>
        <span className="inline-flex items-center gap-1">
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-1 rounded-md transition-colors max-w-[180px] truncate"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {new URL(jobUrl).hostname}
          </a>
          <button
            onClick={() => {
              setEditedUrl(jobUrl);
              setIsEditingUrl(true);
            }}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
        </span>
      </>
    );
  }

  return (
    <>
      <span className="text-zinc-700 text-[10px]">|</span>
      <button
        onClick={() => {
          setEditedUrl("");
          setIsEditingUrl(true);
        }}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors"
      >
        <Plus className="w-3 h-3" />
        {t("offerUrl")}
      </button>
    </>
  );
}
