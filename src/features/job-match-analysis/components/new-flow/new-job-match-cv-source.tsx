"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FileJson, FileText, UploadCloud } from "lucide-react";
import type { CVDocumentSummaryResponse } from "@/app/api/cvs/responses";

export type CVSource = "existing" | "upload" | "json_resume";

export function NewJobMatchCVSourceSelector({
  cvs,
  source,
  onSourceChange,
}: {
  cvs: CVDocumentSummaryResponse[];
  source: CVSource;
  onSourceChange: (source: CVSource) => void;
}) {
  const t = useTranslations("analysisFlow.newOffer");

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <SourceButton
        icon={<FileText className="mb-4 h-6 w-6 text-action-text" />}
        selected={source === "existing"}
        disabled={cvs.length === 0}
        tone="indigo"
        title={t("existing")}
        description={t("existingDescription", { count: cvs.length })}
        onClick={() => onSourceChange("existing")}
      />
      <SourceButton
        icon={<UploadCloud className="mb-4 h-6 w-6 text-success-text" />}
        selected={source === "upload"}
        tone="emerald"
        title={t("upload")}
        description={t("uploadDescription")}
        onClick={() => onSourceChange("upload")}
      />
      <SourceButton
        icon={<FileJson className="mb-4 h-6 w-6 text-action-text" />}
        selected={source === "json_resume"}
        tone="violet"
        title={t("jsonResume")}
        description={t("jsonResumeDescription")}
        onClick={() => onSourceChange("json_resume")}
      />
    </section>
  );
}

export type CVSourceTone = "indigo" | "emerald" | "violet";

function SourceButton({
  icon,
  selected,
  disabled = false,
  tone,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  selected: boolean;
  disabled?: boolean;
  tone: CVSourceTone;
  title: string;
  description: string;
  onClick: () => void;
}) {
  const selectedClass = {
    indigo: "border-action-border/40 bg-action/10 text-action-text",
    emerald: "border-success-border bg-success/10 text-text-on-bright",
    violet: "border-action-border bg-action-soft text-action-text",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border p-5 text-left transition-all ${
        selected
          ? selectedClass
          : "border-line bg-panel/[0.02] text-text-muted hover:bg-panel/[0.04]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {icon}
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </button>
  );
}
