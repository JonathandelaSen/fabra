"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  featureListItemClassName,
  featureListItemIconClassName,
} from "@/frontend/components/shared/feature-visual-system";

interface SidebarListItemProps {
  title?: string;
  selected: boolean;
  onClick: () => void;
  subtitle?: ReactNode;
  footer?: ReactNode;
  titleClamp?: 1 | 2;
  className?: string;
}

export function SidebarListItem({
  title,
  selected,
  onClick,
  subtitle,
  footer,
  titleClamp = 1,
  className,
}: SidebarListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={featureListItemClassName(selected, `mb-2 ${className ?? ""}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 text-left">
          {title && (
            <p
              className={`min-w-0 text-[14px] font-semibold tracking-tight text-text-main transition-colors group-hover:text-action-text ${
                titleClamp === 1 ? "truncate" : "line-clamp-2"
              }`}
            >
              {title}
            </p>
          )}
          {subtitle && (
            <div className={title ? "mt-1.5 min-w-0" : "min-w-0"}>
              {subtitle}
            </div>
          )}
        </div>
        <ChevronRight className={featureListItemIconClassName(selected)} />
      </div>

      {footer && (
        <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
          {footer}
        </div>
      )}
    </button>
  );
}
