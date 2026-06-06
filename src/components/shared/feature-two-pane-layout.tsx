"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FeatureTwoPaneLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  mobileDetailActive?: boolean;
  className?: string;
  sidebarClassName?: string;
  mainClassName?: string;
  columnsClassName?: string;
}

export function FeatureTwoPaneLayout({
  sidebar,
  children,
  mobileDetailActive,
  className,
  sidebarClassName,
  mainClassName,
  columnsClassName,
}: FeatureTwoPaneLayoutProps) {
  const detailPaneRef = useRef<HTMLElement>(null);
  const lastSidebarFocusRef = useRef<HTMLElement | null>(null);
  const previousDetailActiveRef = useRef(mobileDetailActive);

  useEffect(() => {
    if (
      mobileDetailActive === undefined ||
      previousDetailActiveRef.current === mobileDetailActive
    ) {
      return;
    }
    previousDetailActiveRef.current = mobileDetailActive;

    if (mobileDetailActive) {
      detailPaneRef.current?.focus({ preventScroll: true });
    } else {
      lastSidebarFocusRef.current?.focus({ preventScroll: true });
    }
  }, [mobileDetailActive]);

  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]",
        columnsClassName,
        className
      )}
    >
      <div
        className={cn(
          "min-h-0 w-full shrink-0 lg:block",
          mobileDetailActive === true
            ? "hidden"
            : mobileDetailActive === false
              ? "motion-safe:animate-in motion-safe:slide-in-from-left-4 motion-safe:duration-200"
              : undefined,
          sidebarClassName
        )}
        onFocusCapture={(event) => {
          lastSidebarFocusRef.current = event.target as HTMLElement;
        }}
        onPointerDownCapture={(event) => {
          const target = event.target as HTMLElement;
          lastSidebarFocusRef.current =
            target.closest<HTMLElement>("button, a, [role='button'], [tabindex]") ??
            target;
        }}
      >
        {sidebar}
      </div>
      <main
        ref={detailPaneRef}
        tabIndex={mobileDetailActive === true ? -1 : undefined}
        className={cn(
          "min-h-0 min-w-0 overflow-y-auto outline-none lg:block",
          mobileDetailActive === true
            ? "flex flex-col motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:duration-200"
            : mobileDetailActive === false
              ? "hidden"
              : undefined,
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}
