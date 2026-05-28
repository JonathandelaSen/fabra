"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FeatureScreenShellProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
  bodyContentClassName?: string;
}

export function FeatureScreenShell({
  title,
  actions,
  children,
  className,
  headerClassName,
  bodyClassName,
  contentClassName,
  bodyContentClassName,
}: FeatureScreenShellProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-canvas text-text-main",
        className
      )}
    >
      <header
        className={cn(
          "shrink-0 border-b border-line bg-canvas-header px-5 py-4",
          headerClassName
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-[1560px] flex-wrap items-center justify-between gap-3",
            contentClassName
          )}
        >
          <div className="min-w-0">
            {typeof title === "string" ? (
              <h1 className="text-2xl font-semibold tracking-tight text-text-main">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </header>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden bg-canvas p-4 lg:p-5 xl:p-6",
          bodyClassName
        )}
      >
        <div className={cn("mx-auto h-full w-full max-w-[1560px]", bodyContentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
