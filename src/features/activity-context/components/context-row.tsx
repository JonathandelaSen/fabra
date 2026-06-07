"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  Briefcase,
  Check,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import {
  LabelBadge,
  LABEL_BADGE_SIZES,
  LABEL_BADGE_TONES,
} from "@/components/shared/label-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  ActivityContext,
  ActivityContextType,
  UpdateActivityContextInput,
} from "../api/activity-context-api";

const TYPE_OPTIONS: [ActivityContextType, string][] = [
  ["employment", "employment"],
  ["project", "project"],
  ["personal", "personal"],
  ["other", "other"],
];

const TYPE_ICONS: Record<ActivityContextType, React.ReactNode> = {
  employment: <Briefcase className="h-3.5 w-3.5" />,
  project: <FolderOpen className="h-3.5 w-3.5" />,
  personal: <User className="h-3.5 w-3.5" />,
  other: <MoreHorizontal className="h-3.5 w-3.5" />,
};

interface ContextRowProps {
  context: ActivityContext;
  hasReturnTo: boolean;
  onSelect: (ctx: ActivityContext) => void;
  onUpdate: (id: string, updates: UpdateActivityContextInput) => Promise<unknown>;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

export function ContextRow({
  context,
  hasReturnTo,
  onSelect,
  onUpdate,
  onDelete,
  isUpdating,
}: ContextRowProps) {
  const t = useTranslations("activityContexts");
  const [editState, setEditState] = useState<{
    name: string;
    type: ActivityContextType;
  } | null>(null);

  const handleSaveEdit = async () => {
    if (!editState || !editState.name.trim()) return;
    await onUpdate(context.id, { name: editState.name.trim(), type: editState.type });
    setEditState(null);
  };

  if (editState) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <select
          className="h-8 w-28 shrink-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          value={editState.type}
          onChange={(e) =>
            setEditState({ ...editState, type: e.target.value as ActivityContextType })
          }
        >
          {TYPE_OPTIONS.map(([value, key]) => (
            <option key={value} value={value} className="bg-zinc-900">
              {t(`contextTypes.${key}`)}
            </option>
          ))}
        </select>
        <input
          className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          value={editState.name}
          onChange={(e) => setEditState({ ...editState, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSaveEdit();
            if (e.key === "Escape") setEditState(null);
          }}
          autoFocus
        />
        <ActionIconButton
          icon={Check}
          loading={isUpdating}
          tone={ACTION_ICON_BUTTON_TONES.SUCCESS}
          onClick={() => void handleSaveEdit()}
          disabled={isUpdating || !editState.name.trim()}
        />
        <ActionIconButton
          icon={X}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
          onClick={() => setEditState(null)}
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-zinc-500">
        {TYPE_ICONS[context.type]}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-zinc-100">
            {context.name}
          </span>
          {context.isDefault && (
            <LabelBadge
              label={t("badges.default")}
              size={LABEL_BADGE_SIZES.XS}
              tone={LABEL_BADGE_TONES.INFO}
            />
          )}
          {context.status === "archived" && (
            <LabelBadge
              label={t("badges.archived")}
              size={LABEL_BADGE_SIZES.XS}
              tone={LABEL_BADGE_TONES.NEUTRAL}
              className="border-zinc-600/40 text-zinc-500"
            />
          )}
        </div>
        <span className="text-xs text-zinc-600">
          {t(`contextTypes.${context.type}`)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
        {hasReturnTo && context.status === "active" && (
          <IconTextButton
            icon={Check}
            tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
            onClick={() => onSelect(context)}
          >
            {t("selectAndReturn")}
          </IconTextButton>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <ActionIconButton
                icon={MoreHorizontal}
                tone={ACTION_ICON_BUTTON_TONES.MUTED}
              />
            }
          />
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem
              onClick={() =>
                setEditState({ name: context.name, type: context.type })
              }
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                void onUpdate(context.id, {
                  status: context.status === "active" ? "archived" : "active",
                })
              }
            >
              {context.status === "active" ? (
                <>
                  <Archive className="h-3.5 w-3.5" />
                  {t("actions.archive")}
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("actions.restore")}
                </>
              )}
            </DropdownMenuItem>
            {!context.isDefault && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(context.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("actions.delete")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
