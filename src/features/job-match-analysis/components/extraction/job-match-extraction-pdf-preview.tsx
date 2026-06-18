"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";

interface JobMatchExtractionPdfPreviewProps {
  showPdfPreview: boolean;
  fullscreen: boolean;
  pdfUrl: string;
  onClose: () => void;
}

export default function JobMatchExtractionPdfPreview({
  showPdfPreview,
  fullscreen,
  pdfUrl,
  onClose,
}: JobMatchExtractionPdfPreviewProps) {
  const t = useTranslations("analysisFlow.extraction");

  return (
    <AnimatePresence>
      {showPdfPreview && !fullscreen && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="flex flex-col flex-1 rounded-2xl border border-line bg-panel-base overflow-hidden shadow-2xl min-h-[400px] lg:min-h-0"
        >
          <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-line bg-action/5">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-action-text" />
              <span className="text-xs font-semibold text-text-soft">
                {t("pdfPreview")}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-panel/10 text-text-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title={t("pdfPreview")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
