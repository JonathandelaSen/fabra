"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface CVLibrarySearchInputProps {
  searchQuery: string;
  onChange: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function CVLibrarySearchInput({
  searchQuery,
  onChange,
  inputRef,
}: CVLibrarySearchInputProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <div className="relative">
      <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-500" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-9 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-12 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-teal-500/30 focus:bg-white/[0.04] focus:outline-none"
      />
      <kbd className="pointer-events-none absolute top-2 right-3 hidden h-5 select-none items-center gap-0.5 rounded border border-white/[0.08] bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 md:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
