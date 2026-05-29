"use client";

import { Pencil, Trash2 } from "lucide-react";

interface TimelineEntryActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}

export function TimelineEntryActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: TimelineEntryActionsProps) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
        title={editLabel}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
        title={deleteLabel}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
