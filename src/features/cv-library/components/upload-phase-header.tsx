"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function UploadPhaseHeader() {
  const t = useTranslations("analysisFlow.upload");

  return (
    <div className="text-center mb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-4"
      >
        <Zap className="w-3.5 h-3.5" />
        {t("step")}
      </motion.div>
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">
        {t("title")}
      </h1>
      <p className="text-zinc-500 text-sm max-w-md mx-auto">
        {t("description")}
      </p>
    </div>
  );
}
