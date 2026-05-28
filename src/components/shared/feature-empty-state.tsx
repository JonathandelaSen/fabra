import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface FeatureEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function FeatureEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: FeatureEmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-line-default py-24 text-center ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-panel-subtle text-text-muted border border-line">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-text-soft">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
