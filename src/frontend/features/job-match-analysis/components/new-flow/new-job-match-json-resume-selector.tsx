"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { JsonResumeImport } from "@/frontend/features/cv-library";

export function NewJobMatchJsonResumeSelector({
  importedCvId,
  onImported,
}: {
  importedCvId: string | null;
  onImported: (cvId: string) => void;
}) {
  const t = useTranslations("jsonResumeImport");

  if (importedCvId) {
    return (
      <section className="flex items-center gap-3 rounded-xl border border-action-border bg-action-soft p-5">
        <CheckCircle2 className="h-5 w-5 text-action-text" />
        <p className="text-sm font-medium text-text-soft">{t("success")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-panel/[0.02] p-5">
      <JsonResumeImport onSuccess={(cvId) => cvId && onImported(cvId)} />
    </section>
  );
}
