"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Download,
  Redo2,
  Settings,
  Sparkles,
  Undo2,
} from "lucide-react";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_SIZES,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";

interface CVEditorHeaderProps {
  versionName: string;
  versionId: string;
  templateName: string;
  locale: string;
  canUndo: boolean;
  canRedo: boolean;
  isPanelOpen: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveNewVersion: () => void;
  onTogglePanel: () => void;
  onBackToLibrary?: () => void;
}

export function CVEditorHeader({
  versionName,
  versionId,
  templateName,
  locale,
  canUndo,
  canRedo,
  isPanelOpen,
  onUndo,
  onRedo,
  onSaveNewVersion,
  onTogglePanel,
  onBackToLibrary,
}: CVEditorHeaderProps) {
  const t = useTranslations("cvEditor");

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a12]/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <ActionIconButton
          icon={ArrowLeft}
          buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
          onClick={onBackToLibrary}
        />
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-white">
              {versionName}
            </h2>
            <span className="text-[10px] text-zinc-600">{t("basedOn")}</span>
            <span className="truncate text-[11px] font-medium text-teal-500/80 italic">
              {t("originalCv")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="rounded-full bg-white/5 px-1.5 py-0.5 uppercase tracking-wider">
              {templateName}
            </span>
            <span className="rounded-full bg-white/5 px-1.5 py-0.5 uppercase tracking-wider">
              {locale}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border border-white/5 bg-white/5 p-1">
          <ActionIconButton
            icon={Undo2}
            disabled={!canUndo}
            onClick={onUndo}
            tone={ACTION_ICON_BUTTON_TONES.MUTED}
            title={t("undo")}
          />
          <ActionIconButton
            icon={Redo2}
            disabled={!canRedo}
            onClick={onRedo}
            tone={ACTION_ICON_BUTTON_TONES.MUTED}
            title={t("redo")}
          />
        </div>

        <IconTextButton
          icon={Sparkles}
          tone={ICON_TEXT_BUTTON_TONES.INFO}
          onClick={onSaveNewVersion}
        >
          <span className="hidden sm:inline">{t("saveNewVersion")}</span>{" "}
        </IconTextButton>

        <div className="hidden h-4 w-[1px] bg-white/10 md:block" />

        <a
          href={`/api/cvs/${versionId}/template-pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-white/5 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("downloadPdf")}</span>
          <span className="sm:hidden">PDF</span>
        </a>

        <ActionIconButton
          icon={Settings}
          buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
          onClick={onTogglePanel}
          tone={isPanelOpen ? ACTION_ICON_BUTTON_TONES.SUCCESS : ACTION_ICON_BUTTON_TONES.MUTED}
        />
      </div>
    </header>
  );
}
