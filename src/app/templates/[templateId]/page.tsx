import { notFound } from "next/navigation";
import { CV_TEMPLATES } from "@/lib/cv-templates";

interface CVTemplatePageProps {
  params: Promise<{ templateId: string }>;
}

export default async function CVTemplatePage({
  params,
}: CVTemplatePageProps) {
  const { templateId } = await params;
  const templateExists = CV_TEMPLATES.some(
    (template) => template.templateId === templateId
  );

  if (!templateExists) notFound();

  return null;
}
