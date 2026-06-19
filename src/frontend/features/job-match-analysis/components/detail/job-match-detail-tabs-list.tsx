"use client";

import { Briefcase, CalendarClock, MessageCircle, MessageSquareQuote, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { JOB_MATCH_DETAIL_TABS } from "../../constants";

export const DETAIL_TABS = JOB_MATCH_DETAIL_TABS;

export function JobMatchDetailTabsList() {
  const t = useTranslations("analysisDetail");

  return (
    <div className="sticky top-[-16px] sm:top-[-24px] z-20 -mx-4 sm:-mx-6 mb-4 px-2 sm:px-6 py-2 backdrop-blur-md">
      <TabsList className="gap-1 rounded-2xl border-line bg-panel-subtle p-1 w-fit max-w-full overflow-x-auto justify-start flex-nowrap [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <TabsTrigger value={DETAIL_TABS.summary} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-panel-active data-active:text-text-main data-active:shadow-[var(--ui-active-tab-shadow)]">
          <Sparkles className="size-4" />
          {t("tabs.summary")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.offer} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-panel-active data-active:text-text-main data-active:shadow-[var(--ui-active-tab-shadow)]">
          <Briefcase className="size-4" />
          {t("tabs.offer")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.questions} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-panel-active data-active:text-text-main data-active:shadow-[var(--ui-active-tab-shadow)]">
          <MessageSquareQuote className="size-4" />
          {t("tabs.questions")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.chat} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-panel-active data-active:text-text-main data-active:shadow-[var(--ui-active-tab-shadow)]">
          <MessageCircle className="size-4" />
          {t("tabs.chat")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.tracking} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-panel-active data-active:text-text-main data-active:shadow-[var(--ui-active-tab-shadow)]">
          <CalendarClock className="size-4" />
          {t("tabs.tracking")}
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
