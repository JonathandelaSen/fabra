"use client";

import type { LucideIcon } from "lucide-react";
import QuickActionItem from "./quick-action-item";

export interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface QuickActionsBlockProps {
  title: string;
  actions: QuickAction[];
}

export default function QuickActionsBlock({
  title,
  actions,
}: QuickActionsBlockProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
        {title}
      </h2>
      <div className="space-y-2">
        {actions.map((action) => (
          <QuickActionItem
            key={action.label}
            label={action.label}
            description={action.description}
            icon={action.icon}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
}
