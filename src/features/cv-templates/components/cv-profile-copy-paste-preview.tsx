"use client";

import { useTranslations } from "next-intl";
import {
  CopyPastePreviewItem,
} from "@/components/shared/copy-paste-workflow-modal";
import type { PreviewCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/preview/responses";

interface CVProfileCopyPastePreviewProps {
  data: PreviewCVProfileCopyPasteResponse;
}

export default function CVProfileCopyPastePreview({
  data,
}: CVProfileCopyPastePreviewProps) {
  const t = useTranslations("analysisFlow.cvProfileCopyPaste");
  const tCopyPaste = useTranslations("analysisFlow.copyPaste");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <CopyPastePreviewItem
          label={t("profileName")}
          value={data.preview.basicsName ?? t("missingValue")}
        />
        <CopyPastePreviewItem
          label={t("sectionsDetected")}
          value={data.preview.sectionsCount}
        />
        <CopyPastePreviewItem
          label={t("completeness")}
          value={`${data.preview.completeness}/100`}
        />
        <CopyPastePreviewItem
          label={tCopyPaste("originLabel")}
          value={tCopyPaste("externalChat")}
        />
      </div>

      {data.preview.missingImportantFields.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="mb-2 text-xs font-medium uppercase text-amber-200">
            {t("missingFields")}
          </p>
          <ul className="space-y-1 text-sm text-amber-100">
            {data.preview.missingImportantFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
