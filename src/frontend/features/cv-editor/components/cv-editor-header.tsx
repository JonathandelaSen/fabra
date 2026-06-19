"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Download,
  PanelRightClose,
  PanelRightOpen,
  Redo2,
  SlidersHorizontal,
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
  isDesktopPanelOpen: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveNewVersion: () => void;
  onOpenMobilePanel: () => void;
  onToggleDesktopPanel: () => void;
  onBackToLibrary?: () => void;
}

export function CVEditorHeader({
  versionName,
  versionId,
  templateName,
  locale,
  canUndo,
  canRedo,
  isDesktopPanelOpen,
  onUndo,
  onRedo,
  onSaveNewVersion,
  onOpenMobilePanel,
  onToggleDesktopPanel,
  onBackToLibrary,
}: CVEditorHeaderProps) {
  const t = useTranslations("cvEditor");

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-panel-base/80 px-2 backdrop-blur-md sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <ActionIconButton
          icon={ArrowLeft}
          buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
          onClick={onBackToLibrary}
        />
        <div className="hidden h-4 w-[1px] bg-panel/10 sm:block" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-text-main">
              {versionName}
            </h2>
            <span className="hidden text-[10px] text-text-faint lg:inline">{t("basedOn")}</span>
            <span className="hidden truncate text-[11px] font-medium text-accent-teal-text italic lg:inline">
              {t("originalCv")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span className="rounded-full bg-panel/5 px-1.5 py-0.5 uppercase tracking-wider">
              {templateName}
            </span>
            <span className="rounded-full bg-panel/5 px-1.5 py-0.5 uppercase tracking-wider">
              {locale}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <div className="hidden items-center gap-1 rounded-md border border-line bg-panel-hover p-1 sm:flex">
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

        <div className="hidden h-4 w-[1px] bg-panel/10 md:block" />

        <a
          href={`/api/cvs/${versionId}/template-pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-panel-hover px-3 text-xs text-text-main hover:bg-panel-active"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("downloadPdf")}</span>
          <span className="sm:hidden">PDF</span>
        </a>

        <ActionIconButton
          icon={SlidersHorizontal}
          buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
          className="md:hidden"
          onClick={onOpenMobilePanel}
          title={t("openEditorPanel")}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
        />

        <ActionIconButton
          icon={isDesktopPanelOpen ? PanelRightClose : PanelRightOpen}
          buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
          className="hidden md:inline-flex"
          onClick={onToggleDesktopPanel}
          title={isDesktopPanelOpen ? t("closeEditorPanel") : t("openEditorPanel")}
          tone={isDesktopPanelOpen ? ACTION_ICON_BUTTON_TONES.SUCCESS : ACTION_ICON_BUTTON_TONES.MUTED}
        />
      </div>
    </header>
  );
}
