"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FeatureSidebarPanelProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function FeatureSidebarPanel({
  header,
  children,
  className,
  headerClassName,
  bodyClassName,
}: FeatureSidebarPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full shrink-0 flex-col rounded-lg border border-line bg-panel shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
        className
      )}
    >
      {header && (
        <div className={cn("border-b border-line px-4 py-3", headerClassName)}>
          {header}
        </div>
      )}
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-2 py-3", bodyClassName)}>
        {children}
      </div>
    </aside>
  );
}
