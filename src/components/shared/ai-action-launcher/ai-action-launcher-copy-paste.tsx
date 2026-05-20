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
    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/10">
          <ExternalLink className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
            {t("externalLabel")}
          </h4>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed">
            {t("externalDesc")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopyPasteRun}
        className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.06] font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer"
      >
        {t("openFlow")}
      </button>
    </div>
  );
}
