"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { UploadCloud, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useParseCV } from "../../hooks/use-parse-cv";
import { UploadPhaseHeader } from "./upload-phase-header";
import { UploadPhaseError } from "./upload-phase-error";

interface UploadPhaseProps {
  onUploadComplete: (analysisId: string) => void;
}

export default function UploadPhase({ onUploadComplete }: UploadPhaseProps) {
  const t = useTranslations("analysisFlow.upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parse, loading, error, setError } = useParseCV(onUploadComplete);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError(t("pdfOnly"));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t("selectPdf"));
      return;
    }
    await parse(file);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <UploadPhaseHeader />

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
            ${
              file
                ? "border-action-border/40 bg-action/5"
                : dragActive
                  ? "border-action-border bg-action/10 scale-[1.01]"
                  : "border-line-default/60 hover:border-line-strong/80 hover:bg-panel/[0.02]"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            {file ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-action/15 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-action-text" />
              </motion.div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-panel-control/60 flex items-center justify-center group-hover:bg-panel-control">
                <UploadCloud className="w-8 h-8 text-text-muted" />
              </div>
            )}
            <div>
              <p className="text-text-soft font-medium text-lg">
                {file ? file.name : t("dropPdf")}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : t("clickToSelect")}
              </p>
            </div>
          </div>
        </div>

        {error && <UploadPhaseError error={error} />}

        {/* Upload Button */}
        <motion.button
          onClick={handleUpload}
          disabled={loading || !file}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200
            ${
              file && !loading
                ? "bg-gradient-to-r from-action to-action-hover hover:from-action-hover hover:to-action text-text-on-dark shadow-xl shadow-[var(--ui-action-shadow)]"
                : "bg-panel-control/60 text-text-muted cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("extracting")}
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {t("extract")}
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
