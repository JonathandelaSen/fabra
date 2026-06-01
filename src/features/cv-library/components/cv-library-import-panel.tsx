"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { JsonResumeImport } from "./json-resume-import";

interface CVLibraryImportPanelProps {
  onClose: () => void;
}

export function CVLibraryImportPanel({ onClose }: CVLibraryImportPanelProps) {
  const t = useTranslations("jsonResumeImport");

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-2xl border border-line bg-white/[0.02] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">{t("title")}</h2>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <JsonResumeImport onSuccess={() => onClose()} />
    </div>
  );
}
