"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { JsonResumeImport } from "@/features/cv-library";

interface NewAnalysisJsonResumeProps {
  onImported: (cvId: string) => void;
  importedCvId: string | null;
}

export default function NewAnalysisJsonResume({
  onImported,
  importedCvId,
}: NewAnalysisJsonResumeProps) {
  const t = useTranslations("jsonResumeImport");

  if (importedCvId) {
    return (
      <section className="flex items-center gap-3 rounded-xl border border-violet-500/40 bg-violet-500/5 p-5">
        <CheckCircle2 className="h-5 w-5 text-violet-300" />
        <p className="text-sm font-medium text-zinc-200">{t("success")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-white/[0.02] p-5">
      <JsonResumeImport
        onSuccess={(cvId) => {
          if (cvId) onImported(cvId);
        }}
      />
    </section>
  );
}
