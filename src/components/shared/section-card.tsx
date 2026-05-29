import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BasicPanel } from "./basic-panel";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  icon: Icon,
  actions,
  children,
  className = "",
  noPadding = false,
}: SectionCardProps) {
  return (
    <BasicPanel className={cn(!noPadding && "p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </BasicPanel>
  );
}
