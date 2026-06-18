"use client";

import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AIActionLauncherHeader({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("aiLauncher");
  const tCommon = useTranslations("common.actions");

  return (
    <div className="px-5 py-4 border-b border-line bg-panel-subtle flex items-center justify-between">
      <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-action-text" />
        {t("title")}
      </h3>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden rounded-lg p-1.5 text-text-muted hover:bg-panel-active hover:text-text-soft"
          aria-label={tCommon("close")}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
