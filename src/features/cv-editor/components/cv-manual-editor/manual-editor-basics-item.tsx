"use client";

import type { ElementType, ReactNode } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ManualEditorBasicsItemProps {
  section: {
    icon: ElementType;
    label: string;
    content: ReactNode;
  };
}

export function ManualEditorBasicsItem({ section }: ManualEditorBasicsItemProps) {
  const Icon = section.icon;

  return (
    <AccordionItem value="basics" className="rounded-xl border border-transparent group/accordion-item">
      <AccordionTrigger className="rounded-xl px-3 py-2.5 hover:bg-panel/[0.03] hover:no-underline data-[state=open]:bg-panel/[0.03] [&>svg]:text-text-faint">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-xs font-medium text-text-soft">{section.label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-1 pb-1 pt-2">{section.content}</AccordionContent>
    </AccordionItem>
  );
}
