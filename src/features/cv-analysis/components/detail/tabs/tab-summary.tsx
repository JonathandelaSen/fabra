"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star, ChevronRight, XCircle, FileSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisMode } from "@/lib/analysis-types";
import { BasicPanel } from "@/components/shared/basic-panel";
import { AnalysisMarkdown } from "@/components/shared/analysis-markdown";

interface TabSummaryProps {
  improvements: string[];
  keywords: string[];
  jobKeywords: string[];
  cvKeywords: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
  analysisMode: AnalysisMode;
  additionalContext?: string;
}

export default function TabSummary({
  improvements,
  keywords,
  jobKeywords,
  cvKeywords,
  matchingKeywords,
  missingKeywords,
  analysisMode,
  additionalContext,
}: TabSummaryProps) {
  const t = useTranslations("analysisDetail.summary");
  const tDetail = useTranslations("analysisDetail");

  return (
    <div className="space-y-6">
      {/* Improvements & Keywords */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-6 shadow-lg shadow-amber-500/[0.02]"
        >
          <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-4">
            <Star className="w-4 h-4" />
            {t("improvements")}
          </h4>
          <ul className="space-y-3">
            {improvements.length > 0 ? (
              improvements.map((imp, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-200"
                >
                  <ChevronRight className="w-4 h-4 mt-0.5 text-amber-500/70 shrink-0" />
                  <AnalysisMarkdown content={imp} className="min-w-0 flex-1" />
                </motion.li>
              ))
            ) : (
              <span className="text-zinc-500 text-sm italic">
                {t("noImprovements")}
              </span>
            )}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <BasicPanel className="p-6">
          <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4" />
            {t("keywordsFound")}
          </h4>
          {analysisMode === "job_match" && (
            <div className="mb-4 grid gap-3">
              <div>
                <p className="mb-2 text-xs sm:text-sm font-semibold text-zinc-400">
                  {t("offer")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {jobKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs sm:text-sm font-medium text-sky-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs sm:text-sm font-semibold text-zinc-400">{t("cv")}</p>
                <div className="flex flex-wrap gap-2">
                  {cvKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs sm:text-sm font-medium text-violet-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {keywords.length > 0 ? (
              keywords.map((kw, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium"
                >
                  {kw}
                </motion.span>
              ))
            ) : (
              <span className="text-zinc-500 text-sm italic">
                {t("noKeywords")}
              </span>
            )}
          </div>
        </BasicPanel>
      </motion.div>
      </div>

      {/* Matching & Missing Keywords */}
      {analysisMode === "job_match" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BasicPanel className="p-6">
            <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              {t("matchingKeywords")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchingKeywords.length > 0 ? (
                matchingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-300"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-sm italic text-zinc-500">
                  {t("noMatches")}
                </span>
              )}
            </div>
          </BasicPanel>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <BasicPanel className="p-6">
            <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-4">
              <XCircle className="w-4 h-4" />
              {t("missingKeywords")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.length > 0 ? (
                missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-300"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-sm italic text-zinc-500">
                  {t("noMissingKeywords")}
                </span>
              )}
            </div>
          </BasicPanel>
        </motion.div>
      </div>
      )}
      {additionalContext && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6"
        >
          <h4 className="text-sm font-semibold text-violet-300 flex items-center gap-2 mb-3">
            <FileSearch className="w-4 h-4" />
            {tDetail("context.title")}
          </h4>
          <p className="text-xs text-zinc-400 italic bg-field rounded-lg p-3 border border-white/[0.04] whitespace-pre-wrap">
            {additionalContext}
          </p>
        </motion.div>
      )}
    </div>
  );
}
