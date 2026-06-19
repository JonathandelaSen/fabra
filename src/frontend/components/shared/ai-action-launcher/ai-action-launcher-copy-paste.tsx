"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

interface AIActionLauncherCopyPasteProps {
  onOpenFlow: () => void;
  onClose: () => void;
}

export default function AIActionLauncherCopyPaste({
  onOpenFlow,
  onClose,
}: AIActionLauncherCopyPasteProps) {
  const t = useTranslations("aiLauncher");

  const handleCopyPasteRun = () => {
    onClose();
    onOpenFlow();
  };

  return (
    <div className="p-4 rounded-xl border border-line bg-panel-subtle hover:border-ai-flow-border hover:bg-panel-hover transition-all duration-300 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-ai-flow-soft flex items-center justify-center shrink-0 border border-ai-flow-border">
          <ExternalLink className="w-4 h-4 text-ai-flow-icon" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-text-main">
            {t("externalLabel")}
          </h4>
          <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 leading-relaxed">
            {t("externalDesc")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopyPasteRun}
        className="w-full py-2 px-4 rounded-lg bg-panel-control hover:bg-panel-active text-text-main border border-line font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer"
      >
        {t("openFlow")}
      </button>
    </div>
  );
}
