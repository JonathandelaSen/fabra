"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyPasteDialogProps {
  title: string;
  closeLabel?: string;
  labelledById?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function CopyPasteDialog({
  title,
  closeLabel = "Close",
  labelledById = "copy-paste-dialog-title",
  onClose,
  children,
  className,
  bodyClassName,
}: CopyPasteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-scrim p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line-default bg-modal shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-line-default px-5 py-4">
          <h2
            id={labelledById}
            className="text-lg font-semibold text-text-main"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-panel-active hover:text-text-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/50"
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className={cn("min-h-0 flex-1 overflow-y-auto p-5", bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
