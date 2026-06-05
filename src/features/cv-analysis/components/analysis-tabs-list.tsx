"use client";

import { useTranslations } from "next-intl";
import {
  Briefcase,
  CalendarClock,
  FileSearch,
  MessageCircle,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisTabsListProps {
  isJobMatch: boolean;
  interviewQuestionCount: number;
}

const tabClassName =
  "px-5 py-2 gap-2 text-sm font-semibold transition-all data-active:bg-white/10 data-active:text-white data-active:shadow-[0_0_20px_rgba(255,255,255,0.05)]";

export function AnalysisTabsList({
  isJobMatch,
  interviewQuestionCount,
}: AnalysisTabsListProps) {
  const t = useTranslations("analysisDetail");

  if (!isJobMatch) {
    return null;
  }

  return (
    <div className="sticky top-[-24px] z-20 -mx-6 px-6 py-4 backdrop-blur-md mb-8">
      <TabsList className="bg-white/[0.03] border-white/[0.05] p-1 rounded-2xl gap-1">
        <TabsTrigger value="resumen" className={tabClassName}>
          <Sparkles className="size-4" />
          {t("tabs.summary")}
        </TabsTrigger>
        {isJobMatch && (
          <>
            <TabsTrigger value="oferta" className={tabClassName}>
              <Briefcase className="size-4" />
              {t("tabs.offer")}
            </TabsTrigger>
            <TabsTrigger value="entrevista" className={tabClassName}>
              <MessageSquareQuote className="size-4" />
              {t("tabs.questions")}
              {interviewQuestionCount > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold px-2 py-0.5">
                  {interviewQuestionCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="chat" className={tabClassName}>
              <MessageCircle className="size-4" />
              {t("tabs.chat")}
            </TabsTrigger>
            <TabsTrigger value="seguimiento" className={tabClassName}>
              <CalendarClock className="size-4" />
              {t("tabs.tracking")}
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </div>
  );
}
