"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, UploadCloud } from "lucide-react";

export function NewJobMatchUploadCVSelector({
  file,
  cvName,
  onFileChange,
  onCvNameChange,
}: {
  file: File | null;
  cvName: string;
  onFileChange: (file: File | null, error: string | null) => void;
  onCvNameChange: (name: string) => void;
}) {
  const t = useTranslations("analysisFlow.newOffer");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (nextFile: File) => {
    if (nextFile.type !== "application/pdf") {
      onFileChange(null, t("selectPdfOnly"));
      return;
    }
    onFileChange(nextFile, null);
    if (!cvName) onCvNameChange(nextFile.name.replace(/\.pdf$/i, ""));
  };

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-white/[0.02] p-5 md:grid-cols-[1fr_260px]">
      <label
        className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          file
            ? "border-emerald-500/40 bg-emerald-500/5"
            : dragActive
              ? "border-emerald-400/60 bg-emerald-500/10"
              : "border-zinc-800/70 hover:border-zinc-700"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile) handleFile(droppedFile);
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          data-testid="new-job-match-file-input"
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) handleFile(nextFile);
          }}
        />
        {file ? (
          <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-300" />
        ) : (
          <UploadCloud className="mb-3 h-8 w-8 text-zinc-500" />
        )}
        <p className="font-medium text-zinc-200">
          {file ? file.name : t("dropPdf")}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : t("clickToSelect")}
        </p>
      </label>
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          {t("cvName")}
        </label>
        <input
          value={cvName}
          onChange={(event) => onCvNameChange(event.target.value)}
          placeholder={t("cvNamePlaceholder")}
          className="h-11 w-full rounded-xl border border-line bg-field px-4 text-sm text-text-main placeholder:text-text-faint focus:border-emerald-500/40 focus:outline-none"
        />
      </div>
    </section>
  );
}
