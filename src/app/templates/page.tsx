import { redirect } from "next/navigation";
import { CV_TEMPLATES } from "@/lib/cv-templates";

export default function TemplatesPage() {
  const firstTemplateId = CV_TEMPLATES[0]?.templateId;
  redirect(firstTemplateId ? `/templates/${firstTemplateId}` : "/");
}
