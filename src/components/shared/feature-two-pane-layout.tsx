"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FeatureTwoPaneLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sidebarClassName?: string;
  mainClassName?: string;
  columnsClassName?: string;
}

export function FeatureTwoPaneLayout({
  sidebar,
  children,
  className,
  sidebarClassName,
  mainClassName,
  columnsClassName,
}: FeatureTwoPaneLayoutProps) {
  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]",
        columnsClassName,
        className
      )}
    >
      <div className={cn("min-h-0 w-full shrink-0", sidebarClassName)}>
        {sidebar}
      </div>
      <main className={cn("min-w-0 overflow-y-auto", mainClassName)}>
        {children}
      </main>
    </div>
  );
}
