import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BasicPanel } from "./basic-panel";

interface SettingsSectionPanelProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  children: ReactNode;
}

export function SettingsSectionPanel({
  title,
  icon: Icon,
  description,
  children,
}: SettingsSectionPanelProps) {
  return (
    <BasicPanel className="p-6">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-main">
          <Icon className="h-5 w-5 text-text-muted" />
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>
      {children}
    </BasicPanel>
  );
}
