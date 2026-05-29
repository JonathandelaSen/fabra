"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BasicPanel } from "./basic-panel";

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
    <BasicPanel
      as="aside"
      radius="lg"
      className={cn(
        "flex h-full min-h-0 w-full shrink-0 flex-col",
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
    </BasicPanel>
  );
}
