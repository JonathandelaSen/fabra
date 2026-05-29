"use client";

import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import { IconTextButton } from "@/components/shared/action-buttons";

function safeParseArray(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

interface RecommendationAnalysis {
  ai_score: number | null;
  ai_improvements: string | null;
  missing_keywords: string | null;
}

interface CVEditorRecommendationsProps {
  recommendationAnalysis: RecommendationAnalysis | null;
  onStartAnalysis: () => void;
}

export function CVEditorRecommendations({
  recommendationAnalysis,
  onStartAnalysis,
}: CVEditorRecommendationsProps) {
  const t = useTranslations("cvEditor");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {t("recommendations.title")}
          </h3>
        </div>
        {recommendationAnalysis?.ai_score && (
          <span className="text-xs font-bold text-amber-500">
            {recommendationAnalysis.ai_score}/100
          </span>
        )}
      </div>

      {recommendationAnalysis ? (
        <div className="space-y-3">
          {safeParseArray(recommendationAnalysis.ai_improvements)
            .slice(0, 3)
            .map((imp, i) => (
              <div
                key={i}
                className="flex gap-3 text-xs leading-relaxed text-zinc-400"
              >
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/40" />
                <p>{imp}</p>
              </div>
            ))}
          {safeParseArray(recommendationAnalysis.missing_keywords)
            .length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {safeParseArray(
                recommendationAnalysis.missing_keywords,
              )
                .slice(0, 5)
                .map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500"
                  >
                    {k}
                  </span>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
          <p className="text-xs text-zinc-500 mb-3">
            {t("recommendations.empty")}
          </p>
          <IconTextButton
            icon={Lightbulb}
            onClick={onStartAnalysis}
            className="h-8"
          >
            {t("recommendations.analyzeNow")}
          </IconTextButton>
        </div>
      )}
    </section>
  );
}
