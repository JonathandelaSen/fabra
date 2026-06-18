"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  FileJson,
  FileText,
  Loader2,
  UploadCloud,
  Zap,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import NewAnalysisExistingCV from "./new-analysis-existing-cv";
import NewAnalysisJsonResume from "./new-analysis-json-resume";
import NewAnalysisUploadCV from "./new-analysis-upload-cv";
import type {
  CVSummary,
  CreateCVHandler,
  CreateAnalysisHandler,
} from "./new-analysis-types";

interface NewAnalysisFlowProps {
  cvs: CVSummary[];
  onCreateCV: CreateCVHandler;
  onCreateAnalysis: CreateAnalysisHandler;
  onAnalysisCreated: (analysisId: string) => void;
}

type CVSource = "existing" | "upload" | "json_resume";

export default function NewAnalysisFlow({
  cvs,
  onCreateCV,
  onCreateAnalysis,
  onAnalysisCreated,
}: NewAnalysisFlowProps) {
  const t = useTranslations("analysisFlow.newExtraction");
  const [source, setSource] = useState<CVSource>(
    cvs.length > 0 ? "existing" : "upload",
  );
  const [selectedCvId, setSelectedCvId] = useState(cvs[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState("");
  const [jsonResumeCvId, setJsonResumeCvId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (nextFile: File | null, fileError: string | null) => {
    setFile(nextFile);
    if (fileError) setError(fileError);
    else setError(null);
  };

  const uploadCV = async () => {
    if (!file) throw new Error(t("selectPdf"));
    return onCreateCV(file, cvName.trim() || file.name.replace(/\.pdf$/i, ""));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(t("titleRequired"));
      return;
    }
    if (source === "existing" && !selectedCvId) {
      setError(t("chooseSource"));
      return;
    }
    if (source === "upload" && !file) {
      setError(t("selectPdf"));
      return;
    }
    if (source === "json_resume" && !jsonResumeCvId) {
      setError(t("importJsonResumeFirst"));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const cvId =
        source === "upload"
          ? await uploadCV()
          : source === "json_resume"
            ? jsonResumeCvId!
            : selectedCvId;

      const analysisId = await onCreateAnalysis({
        cvId,
        title: title.trim(),
      });

      onAnalysisCreated(analysisId);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-0">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto flex w-full max-w-5xl flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-main">
            {t("title")}
          </h1>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setSource("existing")}
            disabled={cvs.length === 0}
            className={`rounded-xl border p-5 text-left transition-all ${
              source === "existing"
                ? "border-action-border/40 bg-action/10 text-action-text"
                : "border-line bg-panel/[0.02] text-text-muted hover:bg-panel/[0.04]"
            } ${cvs.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <FileText className="mb-4 h-6 w-6 text-action-text" />
            <p className="font-semibold">{t("existing")}</p>
            <p className="mt-1 text-sm text-text-muted">
              {t("existingDescription", { count: cvs.length })}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setSource("upload")}
            data-testid="new-analysis-upload-source"
            className={`rounded-xl border p-5 text-left transition-all ${
              source === "upload"
                ? "border-success-border bg-success/10 text-text-on-bright"
                : "border-line bg-panel/[0.02] text-text-muted hover:bg-panel/[0.04]"
            }`}
          >
            <UploadCloud className="mb-4 h-6 w-6 text-success-text" />
            <p className="font-semibold">{t("upload")}</p>
            <p className="mt-1 text-sm text-text-muted">
              {t("uploadDescription")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setSource("json_resume")}
            className={`rounded-xl border p-5 text-left transition-all ${
              source === "json_resume"
                ? "border-action-border bg-action-soft text-action-text"
                : "border-line bg-panel/[0.02] text-text-muted hover:bg-panel/[0.04]"
            }`}
          >
            <FileJson className="mb-4 h-6 w-6 text-action-text" />
            <p className="font-semibold">{t("jsonResume")}</p>
            <p className="mt-1 text-sm text-text-muted">
              {t("jsonResumeDescription")}
            </p>
          </button>
        </section>

        {source === "existing" ? (
          <NewAnalysisExistingCV
            cvs={cvs}
            selectedCvId={selectedCvId}
            onSelectedCvIdChange={setSelectedCvId}
          />
        ) : source === "json_resume" ? (
          <NewAnalysisJsonResume
            onImported={(cvId) => setJsonResumeCvId(cvId)}
            importedCvId={jsonResumeCvId}
          />
        ) : (
          <NewAnalysisUploadCV
            file={file}
            cvName={cvName}
            onFileChange={handleFileChange}
            onCvNameChange={setCvName}
          />
        )}

        <section className="rounded-xl border border-line bg-panel/[0.02] p-5">
          <label className="mb-2 block text-sm text-text-muted">
            {t("extractionName")}
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("extractionNamePlaceholder")}
            className="h-11 w-full rounded-xl border border-line bg-field px-4 text-sm text-text-main placeholder:text-text-faint focus:border-action-border/40 focus:outline-none"
          />
        </section>

        {error && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
            {error}
          </AlertBanner>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          data-testid="new-analysis-submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-action to-action-hover px-6 py-4 text-sm font-semibold text-text-on-dark shadow-xl shadow-[var(--ui-action-shadow)] transition-all hover:from-action-hover hover:to-action disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              {t("create")}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
