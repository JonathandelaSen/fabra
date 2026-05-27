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
          ? "opacity-20 scale-[0.96] border-dashed border-zinc-700 bg-zinc-950/50 shadow-inner"
          : isHidden
          ? "opacity-60 bg-zinc-950/20 border-dashed border-zinc-800/40"
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
      <AccordionTrigger className={`rounded-xl px-3 py-2 hover:bg-white/[0.03] hover:no-underline data-[state=open]:bg-white/[0.03] [&>svg]:text-zinc-600 ${
        isHidden ? "bg-zinc-950/10 hover:bg-zinc-950/20" : ""
      }`}>
        <div className="flex items-center justify-between w-full pr-2">
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
              className="inline-flex h-6 w-5 cursor-grab items-center justify-center text-zinc-600 hover:text-zinc-300 active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
              title={t("dragSection")}
              type="button"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>

            <SectionIcon className={`h-3.5 w-3.5 shrink-0 transition-colors ${
              isHidden ? "text-zinc-600 opacity-40" : "text-zinc-500"
            }`} />

            <input
              value={sectionTitle}
              onChange={(event) => onUpdateSectionTitle(sectionId, event.target.value)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder={getSectionTitle(sectionId, locale)}
              className={`h-6 w-full min-w-[100px] max-w-[180px] bg-transparent px-1 text-xs font-medium placeholder:text-zinc-600 focus:text-white focus:outline-none transition-colors border-b border-transparent focus:border-teal-500/30 ${
                isHidden ? "text-zinc-500 opacity-50" : "text-zinc-300"
              }`}
            />

            {section.count !== undefined && section.count > 0 && (
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-500 shrink-0">
                {section.count}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center opacity-0 group-hover/accordion-item:opacity-100 transition-opacity">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveSection(sectionId, -1);
                }}
                disabled={index === 0}
                className="inline-flex h-6 w-6 items-center justify-center text-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-20"
                title={t("moveUp")}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveSection(sectionId, 1);
                }}
                disabled={index === sectionOrderLength - 1}
                className="inline-flex h-6 w-6 items-center justify-center text-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-20"
                title={t("moveDown")}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleVisibility(sectionId);
              }}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                isHidden
                  ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
              title={isHidden ? t("showSection") : t("hideSection")}
            >
              {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-1 pt-2 pb-1">
        {section.content}
      </AccordionContent>
    </AccordionItem>
  );
}
