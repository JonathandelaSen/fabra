"use client";

import { useTranslations } from "next-intl";
import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Save,
} from "lucide-react";
import {
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";

interface CVEditorPublicSectionProps {
  publicEnabled: boolean;
  publicId: string | null;
  publicSlug: string;
  normalizedPublicSlug: string;
  publicUrl: string | null;
  hasPublicSlugChanges: boolean;
  publicCopied: boolean;
  savingPublicSettings: boolean;
  cvId: string;
  onSetPublicSlugDraft: (params: { cvId: string; value: string }) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onSaveUrl: () => void;
  onCopyPublicUrl: () => void;
}

export function CVEditorPublicSection({
  publicEnabled,
  publicId,
  publicSlug,
  normalizedPublicSlug,
  publicUrl,
  hasPublicSlugChanges,
  publicCopied,
  savingPublicSettings,
  cvId,
  onSetPublicSlugDraft,
  onPublish,
  onUnpublish,
  onSaveUrl,
  onCopyPublicUrl,
}: CVEditorPublicSectionProps) {
  const t = useTranslations("cvEditor");

  return (
    <section className="space-y-4 border-t border-line/5 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info-text">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-main">
              {t("publicPage.title")}
            </h3>
            <p className="text-[11px] text-text-faint">
              {publicEnabled
                ? t("publicPage.enabled")
                : t("publicPage.disabled")}
            </p>
          </div>
        </div>
        {publicEnabled ? (
          <DeleteButton
            disabled={savingPublicSettings}
            onClick={onUnpublish}
            className="h-8"
            strong
          >
            {t("publicPage.unpublish")}
          </DeleteButton>
        ) : (
          <IconTextButton
            icon={Globe2}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
            disabled={
              savingPublicSettings || !normalizedPublicSlug
            }
            onClick={onPublish}
            className="h-8"
            strong
          >
            {t("publicPage.publish")}
          </IconTextButton>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-text-faint">
          {t("publicPage.editableUrl")}
        </label>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-line/5 bg-panel/5 p-1.5">
          <span className="hidden shrink-0 pl-2 text-[11px] text-text-faint sm:inline">
            /cv/{publicId ?? "id"}/
          </span>
          <input
            value={publicSlug}
            onChange={(event) =>
              onSetPublicSlugDraft({
                cvId,
                value: event.target.value,
              })
            }
            onBlur={() =>
              onSetPublicSlugDraft({
                cvId,
                value: normalizedPublicSlug,
              })
            }
            className="min-w-0 flex-1 bg-transparent px-2 text-xs text-text-main outline-none placeholder:text-text-faint"
            placeholder={t("publicPage.urlPlaceholder")}
          />
        </div>
        <p className="text-[11px] leading-relaxed text-text-faint">
          {t("publicPage.urlHelp")}
        </p>
      </div>

      {publicEnabled && publicUrl && (
        <div className="space-y-2">
          {hasPublicSlugChanges && (
            <IconTextButton
              icon={Save}
              loading={savingPublicSettings}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
              disabled={
                savingPublicSettings || !normalizedPublicSlug
              }
              onClick={onSaveUrl}
              fullWidth
              strong
              className="h-8"
            >
              {t("publicPage.saveUrl")}
            </IconTextButton>
          )}
          <div className="flex min-w-0 gap-2">
            <IconTextButton
              icon={publicCopied ? Check : Copy}
              disabled={savingPublicSettings}
              onClick={onCopyPublicUrl}
              fullWidth
              className="h-8 min-w-0 shrink"
            >
              {publicCopied ? t("publicPage.copied") : t("publicPage.copyUrl")}
            </IconTextButton>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-line/5 bg-panel/5 px-3 text-xs text-text-soft hover:bg-panel/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
