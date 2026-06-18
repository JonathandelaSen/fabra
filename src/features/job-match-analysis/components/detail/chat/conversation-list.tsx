"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { JobAnalysisChatConversation } from "../../../types";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationListProps {
  conversations: JobAnalysisChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: ConversationListProps) {
  const t = useTranslations("analysisDetail.chat");
  const common = useTranslations("common.actions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (conv: JobAnalysisChatConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const commitRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex min-w-0 w-full shrink-0 flex-col border-b border-line/[0.06] md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between border-b border-line/[0.06] px-3 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {t("conversations")}
        </span>
        <ActionIconButton
          icon={Plus}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
          onClick={onNew}
        />
      </div>
      <ScrollArea className="h-24 md:h-auto md:flex-1">
        <div className="space-y-0.5 p-2">
          {conversations.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-text-faint">
              {t("noConversations")}
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-colors cursor-pointer ${
                activeId === conv.id
                  ? "bg-info-soft text-info-text"
                  : "text-text-muted hover:bg-panel/[0.04] hover:text-text-soft"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageCircle className="size-3.5 shrink-0" />
              {editingId === conv.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="min-w-0 flex-1 truncate bg-transparent text-xs outline-none"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-xs">
                  {conv.title}
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 rounded p-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-panel/10 transition-opacity"
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => startEditing(conv)}>
                    <Pencil className="mr-2 size-3.5" />
                    {t("rename")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-danger-text focus:text-danger-text"
                    onClick={() => onDelete(conv.id)}
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    {common("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
