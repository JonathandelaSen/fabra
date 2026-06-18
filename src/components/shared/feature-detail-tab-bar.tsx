"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FeatureDetailTab<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
}

interface FeatureDetailTabBarProps<T extends string = string> {
  tabs: FeatureDetailTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
}

export function FeatureDetailTabBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: FeatureDetailTabBarProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "shrink-0 flex items-center gap-1 pb-4 sm:pb-0 pt-2 sm:pt-0",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-panel-active text-text-on-bright shadow-sm"
              : "text-text-muted hover:bg-panel-subtle hover:text-text-soft",
          )}
        >
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
