import type React from "react";

interface CVTemplatePreviewSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CVTemplatePreviewSection({
  title,
  children,
}: CVTemplatePreviewSectionProps) {
  return (
    <section className="cvp-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
