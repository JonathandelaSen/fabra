"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ObjectiveConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ObjectiveConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ObjectiveConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header Area */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Confirm Action</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onCancel}
            className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-2">
          <h3 className="text-base font-bold text-zinc-100 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex justify-end gap-2.5 border-t border-white/[0.06] bg-white/[0.01] px-5 py-3.5">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-8.5 px-4 text-xs font-semibold text-zinc-400 hover:bg-white/[0.04]"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="h-8.5 px-4 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
