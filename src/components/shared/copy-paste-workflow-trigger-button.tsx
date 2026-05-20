"use client";

import { MessageSquare } from "lucide-react";

interface CopyPasteWorkflowTriggerButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function CopyPasteWorkflowTriggerButton({
  label,
  onClick,
  disabled = false,
  className = "",
}: CopyPasteWorkflowTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <MessageSquare className="h-3.5 w-3.5" />
      <span className="hidden xs:inline">{label}</span>
    </button>
  );
}
