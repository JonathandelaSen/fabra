"use client";

import { Pencil, Save, X, Trash2, Sparkles, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CVDocumentListItem } from "../../api/cv-library-api";
import { LabelBadge, LABEL_BADGE_TONES } from "@/components/shared/label-badge";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_SIZES,
  ACTION_ICON_BUTTON_TONES,
  EditButton,
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";

interface CVLibraryDetailHeaderProps {
  selected: CVDocumentListItem;
  editing: boolean;
  draftName: string;
  saving: boolean;
  onStartEditing: () => void;
  onDraftNameChange: (name: string) => void;
  onSaveName: () => void;
  onCancelEditing: () => void;
  onDelete: () => void;
  onOpenEditor: (cvId: string) => void;
  pdfPath: string;
}

export function CVLibraryDetailHeader({
  selected,
  editing,
  draftName,
  saving,
  onStartEditing,
  onDraftNameChange,
  onSaveName,
  onCancelEditing,
  onDelete,
  onOpenEditor,
  pdfPath,
}: CVLibraryDetailHeaderProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] bg-white/[0.01] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 pr-4">
        {editing ? (
          <div className="flex items-center gap-2 max-w-md">
            <input
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSaveName();
                if (event.key === "Escape") onCancelEditing();
              }}
              className="h-9 w-full rounded-lg border border-line bg-field px-3 text-sm text-text-main focus:border-ring/40 focus:outline-none"
              autoFocus
            />
            <ActionIconButton
              type="button"
              icon={Save}
              loading={saving}
              buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
              tone={ACTION_ICON_BUTTON_TONES.PRIMARY}
              onClick={onSaveName}
              disabled={saving || !draftName.trim()}
              title={t("save")}
            />
            <ActionIconButton
              type="button"
              icon={X}
              buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
              tone={ACTION_ICON_BUTTON_TONES.MUTED}
              onClick={onCancelEditing}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="truncate text-base font-semibold text-zinc-100">
                {selected.name}
              </h2>
              <LabelBadge tone={selected.type === "template" ? LABEL_BADGE_TONES.TEAL : LABEL_BADGE_TONES.NEUTRAL} size="xs" className="uppercase" strong>
                {selected.type === "template" ? t("typeTemplate") : t("typeOriginal")}
              </LabelBadge>
            </div>
            <p className="mt-1 truncate text-xs text-zinc-500">
              {selected.filename || "—"}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 flex-wrap">
        {!editing && (
          <>
            <EditButton onClick={onStartEditing} />
            <DeleteButton onClick={onDelete} disabled={saving} />
          </>
        )}
        {selected.type === "template" && (
          <IconTextButton
            type="button"
            onClick={() => onOpenEditor(selected.id)}
            icon={Sparkles}
            tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
            strong
          >
            {t("editWithAI")}
          </IconTextButton>
        )}
        <a
          href={pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
          title={t("viewPdf")}
        >
          <Download className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
