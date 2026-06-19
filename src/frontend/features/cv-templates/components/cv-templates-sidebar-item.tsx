"use client";

import { SidebarListItem } from "@/components/shared/sidebar-list-item";
import type { CVTemplateDefinition } from "@/lib/cv-templates";

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
    <SidebarListItem
      title={template.name}
      selected={selected}
      onClick={() => onSelect(template.templateId)}
      subtitle={
        <p className="line-clamp-2 text-xs text-text-muted font-light">
          {template.description}
        </p>
      }
    />
  );
}
