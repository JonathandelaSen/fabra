"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PDFPreview = dynamic(
  () => import("@/components/shared/pdf-preview").then((mod) => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] w-full items-center justify-center bg-field-code text-text-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  },
);

interface CVLibraryDetailPreviewProps {
  pdfPath: string;
  title: string;
}

export function CVLibraryDetailPreview({
  pdfPath,
}: CVLibraryDetailPreviewProps) {
  return (
    <div className="relative w-full bg-field-code">
      <PDFPreview url={pdfPath} expanded />
    </div>
  );
}
