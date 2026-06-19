"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type AIContext } from "@/lib/analysis-types";
import { Tabs } from "@/components/ui/tabs";
import ScoreHero from "./score-hero";
import { AnalysisNextStep } from "./analysis-next-step";
import { AnalysisTabsContent } from "./analysis-tabs-content";
import { AnalysisTabsList } from "./analysis-tabs-list";

interface AIAnalysisViewProps {
  analysis: {
    ai_score: number;
    ai_feedback: string;
    ai_keywords: string;
    ai_improvements: string;
    ai_model: string;
    ai_analyzed_at: string;
    ai_context: AIContext | null;
    id: string;
    cv_id: string | null;
    cv: {
      id: string;
      name: string;
      filename: string;
      type?: string;
    } | null;
    title: string;
      filename: string;
    };
}

function safeParseArray(value: string | null): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function AIAnalysisView({
  analysis,
}: AIAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState("resumen");

  const keywords = safeParseArray(analysis.ai_keywords);
  const improvements = safeParseArray(analysis.ai_improvements);
  const additionalContext = analysis.ai_context?.additionalContext;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 py-4 sm:py-6"
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-full space-y-5">
          <ScoreHero
            score={analysis.ai_score}
            title={analysis.title}
            feedback={analysis.ai_feedback}
            model={analysis.ai_model}
            analyzedAt={analysis.ai_analyzed_at}
            cv={analysis.cv}
            cvId={analysis.cv_id}
            filename={analysis.filename}
          />

          <AnalysisNextStep
            cvId={analysis.cv?.id ?? analysis.cv_id}
            isTemplateCv={analysis.cv?.type === "template"}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <AnalysisTabsList />
            <AnalysisTabsContent
              improvements={improvements}
              keywords={keywords}
              cvId={analysis.cv?.id ?? analysis.cv_id}
              additionalContext={additionalContext}
            />
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
