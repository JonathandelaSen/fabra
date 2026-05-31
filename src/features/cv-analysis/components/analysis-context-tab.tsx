"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FileSearch } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

interface AnalysisContextTabProps {
  additionalContext: string;
}

export function AnalysisContextTab({ additionalContext }: AnalysisContextTabProps) {
  const t = useTranslations("analysisDetail");

  return (
    <TabsContent value="contexto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6"
      >
        <h4 className="text-sm font-semibold text-violet-300 flex items-center gap-2 mb-3">
          <FileSearch className="w-4 h-4" />
          {t("context.title")}
        </h4>
        <p className="text-xs text-zinc-400 italic bg-field rounded-lg p-3 border border-white/[0.04]">
          {additionalContext}
        </p>
      </motion.div>
    </TabsContent>
  );
}
