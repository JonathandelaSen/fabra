"use client";

import type { CVTemplateDefinition } from "@/lib/cv-templates";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { CVTemplatesSidebarItem } from "./cv-templates-sidebar-item";

interface CVTemplatesSidebarProps {
  templates: CVTemplateDefinition[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CVTemplatesSidebar({
  templates,
  selectedId,
  onSelect,
}: CVTemplatesSidebarProps) {
  return (
    <FeatureSidebarPanel>
      {templates.map((template) => (
        <CVTemplatesSidebarItem
          key={template.templateId}
          template={template}
          selected={selectedId === template.templateId}
          onSelect={onSelect}
        />
      ))}
    </FeatureSidebarPanel>
  );
}
