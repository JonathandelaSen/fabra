"use client";

import { useTranslations } from "next-intl";
import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="space-y-4 border-t border-white/5 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {t("publicPage.title")}
            </h3>
            <p className="text-[11px] text-zinc-600">
              {publicEnabled
                ? t("publicPage.enabled")
                : t("publicPage.disabled")}
            </p>
          </div>
        </div>
        {publicEnabled ? (
          <Button
            variant="ghost"
            disabled={savingPublicSettings}
            onClick={onUnpublish}
            className="h-8 border border-rose-500/20 bg-rose-500/5 px-3 text-[11px] text-rose-300 hover:bg-rose-500/10"
          >
            {t("publicPage.unpublish")}
          </Button>
        ) : (
          <Button
            disabled={
              savingPublicSettings || !normalizedPublicSlug
            }
            onClick={onPublish}
            className="h-8 bg-sky-500 px-3 text-[11px] font-bold text-black hover:bg-sky-400"
          >
            {t("publicPage.publish")}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
          {t("publicPage.editableUrl")}
        </label>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1.5">
          <span className="hidden shrink-0 pl-2 text-[11px] text-zinc-600 sm:inline">
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
            className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-zinc-700"
            placeholder="nombre-del-cv"
          />
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-600">
          {t("publicPage.urlHelp")}
        </p>
      </div>

      {publicEnabled && publicUrl && (
        <div className="space-y-2">
          {hasPublicSlugChanges && (
            <Button
              disabled={
                savingPublicSettings || !normalizedPublicSlug
              }
              onClick={onSaveUrl}
              className="h-8 w-full bg-sky-500 px-3 text-[11px] font-bold text-black hover:bg-sky-400"
            >
              {savingPublicSettings ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                t("publicPage.saveUrl")
              )}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={savingPublicSettings}
              onClick={onCopyPublicUrl}
              className="h-8 flex-1 border border-white/5 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
            >
              {publicCopied ? (
                <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="mr-2 h-3.5 w-3.5" />
              )}
              {publicCopied ? t("publicPage.copied") : t("publicPage.copyUrl")}
            </Button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center rounded-md border border-white/5 bg-white/5 px-3 text-xs text-zinc-300 hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
