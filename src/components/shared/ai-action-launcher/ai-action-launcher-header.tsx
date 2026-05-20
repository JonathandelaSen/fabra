"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AIActionLauncherHeader() {
  const t = useTranslations("aiLauncher");

  return (
    <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-400" />
        {t("title")}
      </h3>
    </div>
  );
}
