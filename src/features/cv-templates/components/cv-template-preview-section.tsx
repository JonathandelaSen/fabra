import type React from "react";

interface CVTemplatePreviewSectionProps {
  title: string;
  children: React.ReactNode;
  sectionId?: string;
}

export function CVTemplatePreviewSection({
  title,
  children,
  sectionId,
}: CVTemplatePreviewSectionProps) {
  return (
    <section className="cvp-section" data-section={sectionId}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
