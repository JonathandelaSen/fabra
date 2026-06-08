"use client";

import { Briefcase, CalendarClock, MessageCircle, MessageSquareQuote, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisTab } from "../../hooks/use-job-match-analysis-route-state";

export const DETAIL_TABS = {
  summary: "summary",
  offer: "offer",
  questions: "questions",
  chat: "chat",
  tracking: "tracking",
} as const satisfies Record<AnalysisTab, AnalysisTab>;

export function JobMatchDetailTabsList({
  interviewQuestionCount,
}: {
  interviewQuestionCount: number;
}) {
  const t = useTranslations("analysisDetail");

  return (
    <div className="sticky top-[-16px] sm:top-[-24px] z-20 -mx-4 sm:-mx-6 mb-4 px-2 sm:px-6 py-2 backdrop-blur-md">
      <TabsList className="gap-1 rounded-2xl border-white/[0.05] bg-white/[0.03] p-1 w-fit max-w-full overflow-x-auto justify-start flex-nowrap [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <TabsTrigger value={DETAIL_TABS.summary} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <Sparkles className="size-4" />
          {t("tabs.summary")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.offer} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <Briefcase className="size-4" />
          {t("tabs.offer")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.questions} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <MessageSquareQuote className="size-4" />
          {t("tabs.questions")}
          {interviewQuestionCount > 0 && (
            <span className="ml-1 rounded-full border border-primary/30 bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
              {interviewQuestionCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.chat} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <MessageCircle className="size-4" />
          {t("tabs.chat")}
        </TabsTrigger>
        <TabsTrigger value={DETAIL_TABS.tracking} className="gap-2 px-5 py-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <CalendarClock className="size-4" />
          {t("tabs.tracking")}
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
