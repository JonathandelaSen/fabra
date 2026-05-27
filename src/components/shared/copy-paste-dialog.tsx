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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2
            id={labelledById}
            className="text-lg font-semibold text-zinc-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
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
