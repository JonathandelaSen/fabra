"use client";

import type { RefObject } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcutKey?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  shortcutKey = "K",
  inputRef,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-12 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-indigo-500/30 focus:bg-white/[0.04] focus:outline-none"
      />
      {shortcutKey && (
        <kbd className="pointer-events-none absolute top-2 right-3 hidden h-5 select-none items-center gap-0.5 rounded border border-white/[0.08] bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 md:inline-flex">
          <span className="text-xs">⌘</span>
          {shortcutKey}
        </kbd>
      )}
    </div>
  );
}
