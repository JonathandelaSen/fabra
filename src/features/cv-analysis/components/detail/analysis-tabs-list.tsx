"use client";

import { useTranslations } from "next-intl";
import {
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabClassName =
  "px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-panel/10 data-active:text-text-on-bright data-active:shadow-[var(--ui-active-tab-shadow)]";

export function AnalysisTabsList() {
  const t = useTranslations("analysisDetail");

  return (
    <div className="sticky top-[-16px] sm:top-[-24px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 backdrop-blur-md mb-4">
      <TabsList className="bg-panel/[0.03] border-line/[0.05] p-1 rounded-2xl gap-1 w-fit max-w-full overflow-x-auto justify-start flex-nowrap [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <TabsTrigger value="resumen" className={tabClassName}>
          <Sparkles className="size-4" />
          {t("tabs.summary")}
        </TabsTrigger>
        <TabsTrigger value="chat" className={tabClassName}>
          <MessageCircle className="size-4" />
          {t("tabs.chat")}
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
