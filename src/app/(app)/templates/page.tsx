import { redirect } from "next/navigation";
import { CV_TEMPLATES } from "@/lib/cv-templates";

interface TemplatesPageProps {
  searchParams: Promise<{ cvId?: string }>;
}

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps) {
  const { cvId } = await searchParams;
  const firstTemplateId = CV_TEMPLATES[0]?.templateId;
  const query = cvId ? `?cvId=${encodeURIComponent(cvId)}` : "";
  redirect(firstTemplateId ? `/templates/${firstTemplateId}${query}` : "/");
}
