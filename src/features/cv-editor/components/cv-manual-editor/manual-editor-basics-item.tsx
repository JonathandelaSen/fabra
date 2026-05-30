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
      <AccordionTrigger className="rounded-xl px-3 py-2.5 hover:bg-white/[0.03] hover:no-underline data-[state=open]:bg-white/[0.03] [&>svg]:text-zinc-600">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-300">{section.label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-1 pb-1 pt-2">{section.content}</AccordionContent>
    </AccordionItem>
  );
}
