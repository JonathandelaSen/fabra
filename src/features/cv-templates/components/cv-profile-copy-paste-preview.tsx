"use client";

import { useTranslations } from "next-intl";
import {
  CopyPastePreviewItem,
} from "@/components/shared/copy-paste-workflow-modal";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
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
        <AlertBanner tone={ALERT_BANNER_TONES.WARNING} title={t("missingFields")}>
          <ul className="space-y-1">
            {data.preview.missingImportantFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </AlertBanner>
      )}
    </div>
  );
}
