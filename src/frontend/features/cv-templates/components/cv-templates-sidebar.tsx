"use client";

import type { CVTemplateDefinition, CVTemplateLocale } from "@/lib/cv-templates";
import { FeatureSidebarPanel } from "@/frontend/components/shared/feature-sidebar-panel";
import CVTemplatePreview from "./cv-template-preview";
import { Check, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

interface CVTemplatesSidebarProps {
  templates: CVTemplateDefinition[];
  selectedId: string | null;
  locale: CVTemplateLocale;
  onSelect: (id: string) => void;
}

export function CVTemplatesSidebar({
  templates,
  selectedId,
  locale,
  onSelect,
}: CVTemplatesSidebarProps) {
  return (
    <FeatureSidebarPanel bodyClassName="px-4 py-5 scrollbar-thin">
      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => {
          const isSelected = template.templateId === selectedId;
          return (
            <button
              key={template.templateId}
              type="button"
              onClick={() => onSelect(template.templateId)}
              className={cn(
                "flex flex-col rounded-xl border p-3.5 text-left transition-all duration-200 group relative",
                "border-line bg-panel-subtle text-text-muted hover:border-line-strong hover:bg-panel-hover hover:shadow-md hover:-translate-y-0.5",
                isSelected &&
                  "border-template-language-border bg-template-language-soft/20 text-template-language-text ring-2 ring-template-language-border/30",
              )}
            >
              {/* Visual Preview Container */}
              <div className="w-full aspect-[794/1123] overflow-hidden rounded-lg border border-line/60 bg-white/95 shadow-sm transition-all duration-200 group-hover:border-line-strong group-hover:shadow-md mb-3 relative">
                <svg
                  className="w-full h-full object-contain"
                  viewBox="0 0 794 1123"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <foreignObject width="794" height="1123">
                    <div className="w-[794px] h-[1123px] text-left select-none pointer-events-none origin-top-left scale-[1.0] bg-white">
                      <CVTemplatePreview
                        profile={template.fixtureProfile}
                        templateId={template.templateId}
                        locale={locale}
                      />
                    </div>
                  </foreignObject>
                </svg>
              </div>

              {/* Template Info */}
              <div className="flex flex-col justify-between flex-1 w-full px-1">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-text-main group-hover:text-text-main transition-colors">
                      {template.name}
                    </span>
                    {isSelected ? (
                      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-template-language-border text-white shadow-sm">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <LayoutTemplate className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-muted group-hover:text-text-soft transition-colors">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </FeatureSidebarPanel>
  );
}
