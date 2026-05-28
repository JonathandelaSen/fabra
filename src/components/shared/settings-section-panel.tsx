import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

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
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <Icon className="h-5 w-5 text-zinc-400" />
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
