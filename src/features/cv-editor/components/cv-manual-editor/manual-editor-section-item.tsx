"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowDown, ArrowUp, GripVertical, Eye, EyeOff } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { getSectionTitle, type CVRenderableSectionId, type CVTemplateLocale } from "@/lib/cv-templates";

interface ManualEditorSectionItemProps {
  section: {
    id: string;
    label: string;
    icon: LucideIcon;
    count?: number;
    content: ReactNode;
  };
  index: number;
  sectionOrderLength: number;
  isHidden: boolean;
  isBeingDragged: boolean;
  sectionTitle: string;
  onDragStart: (sectionId: CVRenderableSectionId) => void;
  onDragOverItem: (targetIndex: number, sectionId: CVRenderableSectionId) => void;
  onDropSection: () => void;
  onDragEnd: () => void;
  onMoveSection: (sectionId: CVRenderableSectionId, direction: -1 | 1) => void;
  onUpdateSectionTitle: (sectionId: CVRenderableSectionId, title: string) => void;
  onToggleVisibility: (sectionId: CVRenderableSectionId) => void;
  locale: CVTemplateLocale;
}

export function ManualEditorSectionItem({
  section,
  index,
  sectionOrderLength,
  isHidden,
  isBeingDragged,
  sectionTitle,
  onDragStart,
  onDragOverItem,
  onDropSection,
  onDragEnd,
  onMoveSection,
  onUpdateSectionTitle,
  onToggleVisibility,
  locale,
}: ManualEditorSectionItemProps) {
  const t = useTranslations("cvEditor.manual");
  const sectionId = section.id as CVRenderableSectionId;
  const SectionIcon = section.icon;

  return (
    <AccordionItem
      key={section.id}
      value={section.id}
      className={`border rounded-xl transition-all duration-300 group/accordion-item overflow-hidden ${
        isBeingDragged
          ? "opacity-20 scale-[0.96] border-dashed border-line-strong bg-field-code/50 shadow-inner"
          : isHidden
          ? "opacity-60 bg-field-code/20 border-dashed border-line-default/40"
          : "border-transparent"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!isBeingDragged) {
          onDragOverItem(index, sectionId);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropSection();
      }}
    >
      <div className="relative">
        <AccordionTrigger className={`rounded-xl px-3 py-2 hover:bg-panel/[0.03] hover:no-underline data-[state=open]:bg-panel/[0.03] [&>svg]:text-text-faint ${
          isHidden ? "bg-field-code/10 hover:bg-field-code/20" : ""
        }`}>
          <span className="block h-6 w-full" />
        </AccordionTrigger>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 pr-8">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              draggable
              onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", section.id);
                onDragStart(sectionId);
              }}
              onDragEnd={(event) => {
                event.stopPropagation();
                onDragEnd();
              }}
              onClick={(event) => event.stopPropagation()}
              className="pointer-events-auto inline-flex h-6 w-5 cursor-grab items-center justify-center text-text-faint hover:text-text-soft active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
              title={t("dragSection")}
              type="button"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>

            <SectionIcon className={`h-3.5 w-3.5 shrink-0 transition-colors ${
              isHidden ? "text-text-faint opacity-40" : "text-text-muted"
            }`} />

            <input
              value={sectionTitle}
              onChange={(event) => onUpdateSectionTitle(sectionId, event.target.value)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder={getSectionTitle(sectionId, locale)}
              className={`pointer-events-auto h-6 w-full min-w-[100px] max-w-[180px] bg-transparent px-1 text-xs font-medium placeholder:text-text-faint focus:text-text-main focus:outline-none transition-colors border-b border-transparent focus:border-accent-teal-border ${
                isHidden ? "text-text-muted opacity-50" : "text-text-soft"
              }`}
            />

            {section.count !== undefined && section.count > 0 && (
              <span className="rounded-full bg-panel/5 px-1.5 py-0.5 text-[9px] text-text-muted shrink-0">
                {section.count}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center opacity-0 group-hover/accordion-item:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveSection(sectionId, -1);
                }}
                disabled={index === 0}
                className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center text-text-muted hover:text-text-main disabled:pointer-events-none disabled:opacity-20"
                title={t("moveUp")}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveSection(sectionId, 1);
                }}
                disabled={index === sectionOrderLength - 1}
                className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center text-text-muted hover:text-text-main disabled:pointer-events-none disabled:opacity-20"
                title={t("moveDown")}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleVisibility(sectionId);
              }}
              className={`pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                isHidden
                  ? "text-danger-text bg-danger-soft hover:bg-danger-soft"
                  : "text-text-muted hover:text-text-main hover:bg-panel/5"
              }`}
              title={isHidden ? t("showSection") : t("hideSection")}
            >
              {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
      <AccordionContent className="px-1 pt-2 pb-1">
        {section.content}
      </AccordionContent>
    </AccordionItem>
  );
}
