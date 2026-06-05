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
        icon={<FileText className="mb-4 h-6 w-6 text-indigo-300" />}
        selected={source === "existing"}
        disabled={cvs.length === 0}
        tone="indigo"
        title={t("existing")}
        description={t("existingDescription", { count: cvs.length })}
        onClick={() => onSourceChange("existing")}
      />
      <SourceButton
        icon={<UploadCloud className="mb-4 h-6 w-6 text-emerald-300" />}
        selected={source === "upload"}
        tone="emerald"
        title={t("upload")}
        description={t("uploadDescription")}
        onClick={() => onSourceChange("upload")}
      />
      <SourceButton
        icon={<FileJson className="mb-4 h-6 w-6 text-violet-300" />}
        selected={source === "json_resume"}
        tone="violet"
        title={t("jsonResume")}
        description={t("jsonResumeDescription")}
        onClick={() => onSourceChange("json_resume")}
      />
    </section>
  );
}

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
  tone: "indigo" | "emerald" | "violet";
  title: string;
  description: string;
  onClick: () => void;
}) {
  const selectedClass = {
    indigo: "border-indigo-500/40 bg-indigo-500/10 text-zinc-100",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-zinc-100",
    violet: "border-violet-500/40 bg-violet-500/10 text-zinc-100",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border p-5 text-left transition-all ${
        selected
          ? selectedClass
          : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {icon}
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </button>
  );
}
