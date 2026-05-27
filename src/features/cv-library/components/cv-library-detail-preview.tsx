"use client";

interface CVLibraryDetailPreviewProps {
  pdfPath: string;
  title: string;
}

export function CVLibraryDetailPreview({
  pdfPath,
  title,
}: CVLibraryDetailPreviewProps) {
  return (
    <div className="relative min-h-0 flex-1 bg-zinc-950">
      <iframe
        src={`${pdfPath}#toolbar=0`}
        className="h-full w-full bg-zinc-950 border-0"
        title={title}
      />
    </div>
  );
}
