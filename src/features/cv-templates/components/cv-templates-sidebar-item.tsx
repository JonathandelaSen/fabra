"use client";

import type { CVTemplateDefinition } from "@/lib/cv-templates";
import { ChevronRight, LayoutTemplate } from "lucide-react";

interface CVTemplatesSidebarItemProps {
  template: CVTemplateDefinition;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function CVTemplatesSidebarItem({
  template,
  selected,
  onSelect,
}: CVTemplatesSidebarItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.templateId)}
      className={`group relative mb-2 w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
        selected
          ? "bg-panel-selected border-action-border text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
            selected
              ? "border-action-border bg-action-soft text-action-text"
              : "border-white/10 bg-white/5 text-zinc-500"
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-action-text">
              {template.name}
            </h3>

            <ChevronRight
              className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                selected
                  ? "text-action-text"
                  : "text-zinc-600 group-hover:text-zinc-400"
              }`}
            />
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
            {template.description}
          </p>
        </div>
      </div>
    </button>
  );
}
