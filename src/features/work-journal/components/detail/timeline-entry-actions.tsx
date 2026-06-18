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
    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        className="p-1.5 text-text-muted hover:text-text-soft hover:bg-panel/5 rounded-md transition-colors"
        title={editLabel}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-text-muted hover:text-danger-text hover:bg-danger-soft rounded-md transition-colors"
        title={deleteLabel}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
